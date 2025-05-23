import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export class ConstStringNode extends NodeHandler {
    constructor() {
        super('constString');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'String',
            icon: 'CircleDot',
            description: 'A constant string value',
            color: '#676767',
            ports: [
                {
                    id: 'output',
                    direction: 'output',
                    connectionType: 'data',
                    dataType: 'string',
                    name: 'String',
                    description: 'A configurable string value',
                    userConfigurable: true,
                },
            ],
        };
    }

    protected async _resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        return {
            ports: {
                output: data.userParameters.output,
            },
        };
    }
}
