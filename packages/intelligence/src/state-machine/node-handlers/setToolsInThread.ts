import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult } from '../type-execution.type';

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

    protected async _resolve(): Promise<NodeExecutionResult> {
        return {
            ports: {
                next: true,
            },
        };
    }
}
