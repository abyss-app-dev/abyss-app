import type {
    NotebookAgentCellProperties,
    NotebookCellType,
    NotebookHeading1CellProperties,
    NotebookHeading2CellProperties,
    NotebookHeading3CellProperties,
    NotebookTextCellProperties,
} from '@abyss/records';
import type { JSONContent } from '@tiptap/core';
import type { TipTapDBType } from './types';

export function mapTipTapDocumentToDatabaseCell(document: JSONContent): NotebookCellType[] {
    return document.content?.map(mapTipTapToDatabaseCell) || [];
}

function mapTipTapToDatabaseCell(cell: JSONContent): NotebookCellType {
    const db = JSON.parse(cell.attrs?.db || '{}');

    if (cell.type === 'headingWrapped') {
        if (cell.attrs?.level === 1) {
            return mapHeading1Cell(cell, db);
        }

        if (cell.attrs?.level === 2) {
            return mapHeading2Cell(cell, db);
        }

        if (cell.attrs?.level === 3) {
            return mapHeading3Cell(cell, db);
        }

        throw new Error(`Unknown heading level: ${cell.attrs?.level}`);
    }

    if (cell.type === 'paragraphWrapped') {
        return mapParagraphCell(cell, db);
    }

    if (cell.type === 'pageWrapped') {
        return mapPageCell(cell, db);
    }

    if (cell.type === 'toolWrapped') {
        return mapToolCell(cell, db);
    }

    if (cell.type === 'agentWrapped') {
        return mapAgentCell(cell, db);
    }

    throw new Error(`Unknown cell type: ${cell.type}`);
}

function mapHeading1Cell(cell: JSONContent, db: TipTapDBType): NotebookCellType<'heading1'> {
    const heading1Properties: NotebookHeading1CellProperties = {
        text: cell.content?.[0]?.text || '',
    };
    return {
        type: 'heading1',
        propertyData: heading1Properties,
        ...db,
    };
}

function mapHeading2Cell(cell: JSONContent, db: TipTapDBType): NotebookCellType<'heading2'> {
    const heading2Properties: NotebookHeading2CellProperties = {
        text: cell.content?.[0]?.text || '',
    };
    return {
        type: 'heading2',
        propertyData: heading2Properties,
        ...db,
    };
}

function mapHeading3Cell(cell: JSONContent, db: TipTapDBType): NotebookCellType<'heading3'> {
    const heading3Properties: NotebookHeading3CellProperties = {
        text: cell.content?.[0]?.text || '',
    };
    return {
        type: 'heading3',
        propertyData: heading3Properties,
        ...db,
    };
}

function mapParagraphCell(cell: JSONContent, db: TipTapDBType): NotebookCellType<'text'> {
    const textProperties: NotebookTextCellProperties = {
        textSections: [],
    };

    for (const content of cell.content || []) {
        if (content.type === 'text') {
            textProperties.textSections.push({
                type: 'text',
                text: content.text || '',
            });
        } else if (content.type === 'mentionPage') {
            textProperties.textSections.push({
                type: 'mentionPage',
                pageId: content.attrs?.id || '',
            });
        } else {
            throw new Error(`Unknown content type: ${content.type}`);
        }
    }

    return {
        type: 'text',
        propertyData: textProperties,
        ...db,
    };
}

function mapPageCell(_cell: JSONContent, db: TipTapDBType): NotebookCellType<'page'> {
    return {
        type: 'page',
        ...db,
    };
}

function mapToolCell(_cell: JSONContent, db: TipTapDBType): NotebookCellType<'tool'> {
    return {
        type: 'tool',
        ...db,
    };
}

function mapAgentCell(cell: JSONContent, db: TipTapDBType): NotebookCellType<'agent'> {
    const content = cell.content?.map(c => c.text || '').join('') || '';
    const agentProperties: NotebookAgentCellProperties = {
        agentId: db.propertyData?.agentId || '',
        content: content,
    };
    return {
        type: 'agent',
        propertyData: agentProperties,
        ...db,
    };
}
