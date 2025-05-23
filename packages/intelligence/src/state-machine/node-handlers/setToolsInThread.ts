import type { NewRecord, NewToolDefinitionPartial, ReferencedMessageThreadRecord, RemoveToolDefinitionPartial } from '@abyss/records';
import { randomId } from '../../utils/ids';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';
import type { Toolset } from './constToolset';

export class SetToolsInThreadNode extends NodeHandler {
    constructor() {
        super('setToolsInThread');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Set Tools',
            icon: 'Hammer',
            description: 'Sets the tools available in a thread',
            color: '#E57373',
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
                    description: 'The thread to set tools for',
                },
                {
                    id: 'tools',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'tools',
                    name: 'Tools',
                    description: 'The tools to set in the thread',
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
        const tools = data.inputPorts.tools as Toolset;

        // Set tools in thread
        const toolsToAdd = await thread.getDeltaToolDefinitions(tools.tools.map(tool => tool.ref));

        if (toolsToAdd.toolsToAdd.length > 0) {
            const toolData = await Promise.all(toolsToAdd.toolsToAdd.map(tool => tool.get()));
            const toolsToAddMessage: NewRecord<NewToolDefinitionPartial> = {
                type: 'new-tool-definition',
                senderId: 'system',
                payloadData: {
                    tools: toolData.map(tool => ({
                        toolId: tool.id,
                        shortName: tool.shortName,
                        description: tool.description,
                        inputSchemaData: tool.inputSchemaData,
                        outputSchemaData: tool.outputSchemaData,
                    })),
                },
            };
            await thread.addMessagePartials(toolsToAddMessage);
        }

        if (toolsToAdd.toolsToRemove.length > 0) {
            const toolsToRemoveMessage: NewRecord<RemoveToolDefinitionPartial> = {
                type: 'remove-tool-definition',
                senderId: 'system',
                payloadData: {
                    tools: toolsToAdd.toolsToRemove.map(tool => tool.id),
                },
            };
            await thread.addMessagePartials(toolsToRemoveMessage);
        }

        return {
            ports: {
                next: randomId(),
            },
        };
    }
}
