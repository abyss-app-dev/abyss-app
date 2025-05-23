import type { ReferencedMessageThreadRecord } from '@abyss/records';
import { randomId } from '../../utils/ids';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export class AddSystemMessageToThreadNode extends NodeHandler {
    constructor() {
        super('addSystemMessageToThread');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Add System Message',
            icon: 'MessageCircle',
            description: 'Adds a system message to a thread',
            color: '#673AB7',
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
                    description: 'The thread to add the message to',
                },
                {
                    id: 'message',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'string',
                    name: 'Message',
                    description: 'The system message to add',
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
        const thread = data.inputPorts.thread as ReferencedMessageThreadRecord;
        const message = data.inputPorts.message as string;

        // Add system message to thread
        await thread.addMessagePartials({
            senderId: 'system',
            type: 'text',
            payloadData: {
                content: message,
            },
        });

        return {
            ports: {
                next: randomId(),
            },
        };
    }
}
