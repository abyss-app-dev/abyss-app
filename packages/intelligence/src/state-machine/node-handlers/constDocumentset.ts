import { type ReferencedNotebookCellRecord, SqliteTable } from '@abyss/records';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export interface UserDocumentsetConfig {
    documents: {
        id: string;
    }[];
}

export interface Documentset {
    documents: {
        ref: ReferencedNotebookCellRecord;
    }[];
}

export class ConstDocumentsetNode extends NodeHandler {
    constructor() {
        super('constDocumentset');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Documentset',
            icon: 'CircleDot',
            description: 'Builds a set of documents in Abyss',
            color: '#676767',
            ports: [
                {
                    id: 'output',
                    direction: 'output',
                    connectionType: 'data',
                    dataType: 'documents',
                    name: 'Output',
                    description: 'The constant documentset value',
                    userConfigurable: true,
                },
            ],
        };
    }

    protected async _resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        const value = data.userParameters.output;
        const documentIds = JSON.parse(value) as UserDocumentsetConfig;
        const documents = documentIds.documents.map(doc => data.database.tables[SqliteTable.notebookCell].ref(doc.id));
        const documentset: Documentset = {
            documents: documents.map(doc => ({
                ref: doc,
            })),
        };

        return {
            ports: {
                output: documentset,
            },
        };
    }
}
