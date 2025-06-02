import type {
    NewRecord,
    NewToolDefinitionPartial,
    NotebookCellType,
    NotebookToolCellProperties,
    ReadonlyNotebookCellsPartial,
    ReferencedMessageThreadRecord,
    ReferencedToolDefinitionRecord,
    SQliteClient,
} from '@abyss/records';
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
            description: 'Sets the context documents available in a thread and automatically adds any referenced tools',
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

    /**
     * Extracts tool references from notebook cells and their children
     */
    private async extractToolReferencesFromCells(cellIds: string[], database: SQliteClient): Promise<ReferencedToolDefinitionRecord[]> {
        const toolRefs: ReferencedToolDefinitionRecord[] = [];
        const processedCells = new Set<string>();

        const processCells = async (cells: NotebookCellType[]) => {
            for (const cell of cells) {
                if (processedCells.has(cell.id)) continue;
                processedCells.add(cell.id);

                // Check if this cell is a tool reference
                if (cell.type === 'tool' && cell.propertyData) {
                    const toolProperties = cell.propertyData as NotebookToolCellProperties;
                    if (toolProperties.toolId) {
                        const toolRef = database.tables.toolDefinition.ref(toolProperties.toolId);
                        toolRefs.push(toolRef);
                    }
                }

                // Recursively process child cells
                const childCells = await database.tables.notebookCell.getChildren(cell.id);
                if (childCells.length > 0) {
                    await processCells(childCells);
                }
            }
        };

        // Get the initial cells and process them
        const initialCells = await database.tables.notebookCell.getMany(cellIds);
        await processCells(initialCells);

        return toolRefs;
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

        // Extract and add tool references from the documents
        try {
            const toolRefs = await this.extractToolReferencesFromCells(cellIds, data.database);

            if (toolRefs.length > 0) {
                // Check which tools need to be added to the thread
                const toolsToAdd = await thread.getDeltaToolDefinitions(toolRefs);

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

                    data.logStream.log(
                        `Added ${toolsToAdd.toolsToAdd.length} tools from document references: ${toolsToAdd.toolsToAdd.map(t => t.id).join(', ')}`
                    );
                }
            }
        } catch (error) {
            data.logStream.log(`Error extracting tool references from documents: ${(error as Error).message}`);
            // Continue execution even if tool extraction fails
        }

        return {
            ports: {
                next: randomId(),
            },
        };
    }
}
