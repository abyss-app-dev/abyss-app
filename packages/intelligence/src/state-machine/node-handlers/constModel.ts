import { SqliteTable } from '@abyss/records';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export class ConstModelNode extends NodeHandler {
    constructor() {
        super('constModel');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Model',
            icon: 'CircleDot',
            description: 'Reference a model configured in Abyss',
            color: '#676767',
            ports: [
                {
                    id: 'model',
                    direction: 'output',
                    connectionType: 'data',
                    dataType: 'model',
                    name: 'Model',
                    description: 'The model to use',
                },
            ],
        };
    }

    protected async _resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        const modelId = data.inputPorts.model as string;
        const modelRef = data.database.tables[SqliteTable.modelConnection].ref(modelId);
        return {
            ports: {
                output: modelRef,
            },
        };
    }
}
