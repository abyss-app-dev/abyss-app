import { ReferencedToolDefinitionRecord, SqliteTable } from '@abyss/records';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export interface UserToolsetConfig {
    tools: {
        id: string;
    }[];
}

export interface Toolset {
    tools: {
        ref: ReferencedToolDefinitionRecord;
    }[];
}

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
                    userConfigurable: true,
                },
            ],
        };
    }

    protected async _resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        const value = data.userParameters.output;
        const toolIds = JSON.parse(value) as UserToolsetConfig;
        const tools = toolIds.tools.map(tool => data.database.tables[SqliteTable.toolDefinition].ref(tool.id));
        const toolset: Toolset = {
            tools: tools.map(tool => ({
                ref: tool,
            })),
        };

        return {
            ports: {
                output: toolset,
            },
        };
    }
}
