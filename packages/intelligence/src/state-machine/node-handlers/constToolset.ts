import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export class ConstToolsetNode extends NodeHandler {
    constructor() {
        super('constToolset');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Toolset',
            icon: 'CircleDot',
            description: 'Builds a set of tools in Abyss',
            color: '#676767',
            ports: [
                {
                    id: 'output',
                    direction: 'output',
                    connectionType: 'data',
                    dataType: 'tools',
                    name: 'Output',
                    description: 'The constant toolset value',
                },
            ],
        };
    }

    protected async _resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        const value = data.inputPorts.value;
        return {
            ports: {
                output: value,
            },
        };
    }
}
