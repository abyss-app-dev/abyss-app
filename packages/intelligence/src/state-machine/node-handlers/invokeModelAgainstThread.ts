import type { ReferencedMessageRecord, ReferencedMessageThreadRecord, ReferencedModelConnectionRecord } from '@abyss/records';
import { invokeModelAgainstThread } from '../../models/handler';
import { runUnproccessedToolCalls } from '../../tool-handlers/run-tool-calls';
import { randomId } from '../../utils/ids';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export class InvokeModelAgainstThreadNode extends NodeHandler {
    constructor() {
        super('invokeModelAgainstThread');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Invoke Model',
            icon: 'Box',
            description: 'Invokes a model against a thread',
            color: '#4CAF50',
            ports: [
                {
                    id: 'trigger',
                    direction: 'input',
                    connectionType: 'signal',
                    dataType: 'signal',
                    name: 'Trigger',
                    description: 'Trigger this node',
                },
                {
                    id: 'thread',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'thread',
                    name: 'Thread',
                    description: 'The thread to invoke the model against',
                },
                {
                    id: 'model',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'model',
                    name: 'Model',
                    description: 'The model to invoke',
                },
                {
                    id: 'next',
                    direction: 'output',
                    connectionType: 'signal',
                    dataType: 'signal',
                    name: 'Next',
                    description: 'What to do next',
                },
            ],
        };
    }

    protected async _resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        const modelConnection = data.inputPorts.model as ReferencedModelConnectionRecord;
        const thread = data.inputPorts.thread as ReferencedMessageThreadRecord;

        // Invoke the model
        const result = await invokeModelAgainstThread({
            modelConnection,
            thread,
            log: data.logStream.child('model'),
        });

        // Tools in chat
        const toolCallRefs = await thread.getAllActiveToolDefinitions();
        const toolCalls = await Promise.all(toolCallRefs.map(t => t.get()));

        // Add the model response to the thread
        const addedMessages: ReferencedMessageRecord[] = [];
        for (const message of result.parsed) {
            if (message.type === 'text') {
                const newMessage = await thread.addMessagePartials({
                    senderId: data.execution.senderId,
                    type: 'text',
                    payloadData: {
                        content: message.content,
                    },
                });
                addedMessages.push(newMessage[0]);
            }
            if (message.type === 'tool') {
                const toolId = Object.keys(message.content)[0];
                const toolForId = toolCalls.find(t => t.shortName === toolId);
                const newMessage = await thread.addMessagePartials({
                    senderId: data.execution.senderId,
                    type: 'tool-call-request',
                    payloadData: {
                        shortName: toolForId?.shortName || toolId,
                        toolCallId: randomId(),
                        toolId: toolForId?.id || toolId,
                        parameters: message.content[toolId] as Record<string, unknown>,
                    },
                });
                addedMessages.push(newMessage[0]);
            }
        }

        // Add data to last message
        if (addedMessages.length > 0) {
            const lastMessage = addedMessages.at(-1);
            if (lastMessage) {
                await lastMessage.update({
                    referencedData: { snapshot: result.snapshot.id },
                });
            }
        }

        // Process tool calls if there are any
        await runUnproccessedToolCalls({
            callerId: data.execution.senderId,
            thread,
            log: data.logStream.child('tools'),
        });

        return {
            ports: {
                next: randomId(),
            },
        };
    }
}
