import type { NewRecord, ReadonlyNotebookCellsPartial, ReferencedMessageThreadRecord } from '@abyss/records';
import { randomId } from '../../utils/ids';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';
import type { Documentset } from './constDocumentset';

export class SetContextDocumentsInThreadNode extends NodeHandler {
    constructor() {
        super('setContextDocumentsInThread');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Set Context Documents',
            icon: 'FileText',
            description: 'Sets the context documents available in a thread',
            color: '#81C784',
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
                    description: 'The thread to set documents for',
                },
                {
                    id: 'documents',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'documents',
                    name: 'Documents',
                    description: 'The documents to set in the thread',
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
        const documents = data.inputPorts.documents as Documentset;

        // Set documents (notebook cells) in thread
        const cellIds = documents.documents.map(doc => doc.ref.id);
        const missingCells = await thread.getDeltaReadonlyNotebookCells(cellIds);

        if (missingCells.length > 0) {
            const cellsMessage: NewRecord<ReadonlyNotebookCellsPartial> = {
                type: 'readonly-notebook-cells',
                senderId: 'system',
                payloadData: {
                    cellIds: missingCells,
                },
            };
            await thread.addMessagePartials(cellsMessage);
        }

        return {
            ports: {
                next: randomId(),
            },
        };
    }
}
