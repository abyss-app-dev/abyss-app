import type { NotebookCellType } from '@abyss/records';
import type { JSONContent } from '@tiptap/core';

export function mapDatabaseCellsToTipTap(cells: NotebookCellType[]): JSONContent {
    return {
        type: 'doc',
        content: cells.map(mapDatabaseCellToTipTap),
    };
}

function mapDatabaseCellToTipTap(cell: NotebookCellType): JSONContent {
    switch (cell.type) {
        case 'heading1':
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
                        text: (cell.propertyData?.text as string) || '',
                    },
                ],
            };
        case 'heading2':
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
                        text: (cell.propertyData?.text as string) || '',
                    },
                ],
            };
        case 'heading3':
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
                        text: (cell.propertyData?.text as string) || '',
                    },
                ],
            };
        case 'text':
            return {
                type: 'paragraphWrapped',
                content: [
                    {
                        type: 'text',
                        text: (cell.propertyData?.text as string) || 'none',
                    },
                ],
                attrs: {
                    db: JSON.stringify({
                        id: cell.id,
                        orderIndex: cell.orderIndex,
                        parentCellId: cell.parentCellId,
                    }),
                },
            };
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
                return {
                    type: 'heading1',
                    propertyData: {
                        text: cell.content?.[0]?.text || '',
                    },
                    ...db,
                };
            }
            if (cell.attrs?.level === 2) {
                return {
                    type: 'heading2',
                    propertyData: {
                        text: cell.content?.[0]?.text || '',
                    },
                    ...db,
                };
            }
            if (cell.attrs?.level === 3) {
                return {
                    type: 'heading3',
                    propertyData: {
                        text: cell.content?.[0]?.text || '',
                    },
                    ...db,
                };
            }
            throw new Error(`Unknown heading level: ${cell.attrs?.level}`);
        case 'paragraphWrapped':
            return {
                type: 'text',
                propertyData: {
                    text: cell.content?.[0]?.text || '',
                },
                ...db,
            };
        default:
            throw new Error(`Unknown cell type: ${cell.type}`);
    }

    // biome-ignore lint/correctness/noUnreachable: Case where we add more cell types
    throw new Error(`Unknown cell type: ${cell.type}`);
}
