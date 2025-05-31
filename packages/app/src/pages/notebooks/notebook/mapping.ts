import type {
    NotebookCellType,
    NotebookHeading1CellProperties,
    NotebookHeading2CellProperties,
    NotebookHeading3CellProperties,
    NotebookTextCellProperties,
} from '@abyss/records';
import type { JSONContent } from '@tiptap/core';

export function mapDatabaseCellsToTipTap(cells: NotebookCellType[]): JSONContent {
    return {
        type: 'doc',
        content: cells.map(mapDatabaseCellToTipTap),
    };
}

function mapDatabaseCellToTipTap(cell: NotebookCellType): JSONContent {
    switch (cell.type) {
        case 'heading1': {
            const heading1Properties: NotebookHeading1CellProperties = cell.propertyData as NotebookHeading1CellProperties;
            return {
                type: 'headingWrapped',
                attrs: {
                    level: 1,
                    db: JSON.stringify({
                        id: cell.id,
                        orderIndex: cell.orderIndex,
                        parentCellId: cell.parentCellId,
                    }),
                },
                content: [
                    {
                        type: 'text',
                        text: heading1Properties.text || '',
                    },
                ],
            };
        }
        case 'heading2': {
            const heading2Properties: NotebookHeading2CellProperties = cell.propertyData as NotebookHeading2CellProperties;
            return {
                type: 'headingWrapped',
                attrs: {
                    level: 2,
                    db: JSON.stringify({
                        id: cell.id,
                        orderIndex: cell.orderIndex,
                        parentCellId: cell.parentCellId,
                    }),
                },
                content: [
                    {
                        type: 'text',
                        text: heading2Properties.text || '',
                    },
                ],
            };
        }
        case 'heading3': {
            const heading3Properties: NotebookHeading3CellProperties = cell.propertyData as NotebookHeading3CellProperties;
            return {
                type: 'headingWrapped',
                attrs: {
                    level: 3,
                    db: JSON.stringify({
                        id: cell.id,
                        orderIndex: cell.orderIndex,
                        parentCellId: cell.parentCellId,
                    }),
                },
                content: [
                    {
                        type: 'text',
                        text: heading3Properties.text || '',
                    },
                ],
            };
        }
        case 'text': {
            const textProperties: NotebookTextCellProperties = cell.propertyData as NotebookTextCellProperties;
            const content = textProperties.text ? [{ type: 'text', text: textProperties.text }] : [];
            return {
                type: 'paragraphWrapped',
                content: content,
                attrs: {
                    db: JSON.stringify({
                        id: cell.id,
                        orderIndex: cell.orderIndex,
                        parentCellId: cell.parentCellId,
                    }),
                },
            };
        }
        default:
            throw new Error(`Unknown cell type: ${cell.type}`);
    }
}

export function mapTipTapDocumentToDatabaseCell(document: JSONContent): NotebookCellType[] {
    return document.content?.map(mapTipTapToDatabaseCell) || [];
}

function mapTipTapToDatabaseCell(cell: JSONContent): NotebookCellType {
    const db = JSON.parse(cell.attrs?.db || '{}');
    switch (cell.type) {
        case 'headingWrapped':
            if (cell.attrs?.level === 1) {
                const heading1Properties: NotebookHeading1CellProperties = {
                    text: cell.content?.[0]?.text || '',
                };
                return {
                    type: 'heading1',
                    propertyData: heading1Properties,
                    ...db,
                };
            }
            if (cell.attrs?.level === 2) {
                const heading2Properties: NotebookHeading2CellProperties = {
                    text: cell.content?.[0]?.text || '',
                };
                return {
                    type: 'heading2',
                    propertyData: heading2Properties,
                    ...db,
                };
            }
            if (cell.attrs?.level === 3) {
                const heading3Properties: NotebookHeading3CellProperties = {
                    text: cell.content?.[0]?.text || '',
                };
                return {
                    type: 'heading3',
                    propertyData: heading3Properties,
                    ...db,
                };
            }
            throw new Error(`Unknown heading level: ${cell.attrs?.level}`);
        case 'paragraphWrapped': {
            const textProperties: NotebookTextCellProperties = {
                text: cell.content?.[0]?.text || '',
            };
            return {
                type: 'text',
                propertyData: textProperties,
                ...db,
            };
        }
        default:
            throw new Error(`Unknown cell type: ${cell.type}`);
    }

    // biome-ignore lint/correctness/noUnreachable: Case where we add more cell types
    throw new Error(`Unknown cell type: ${cell.type}`);
}
