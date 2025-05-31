import type {
    NotebookCellType,
    NotebookHeading1CellProperties,
    NotebookHeading2CellProperties,
    NotebookHeading3CellProperties,
    NotebookTextCellProperties,
} from '@abyss/records';
import type { JSONContent } from '@tiptap/core';
import type { TipTapDBType } from './types';

export function mapDatabaseCellsToTipTap(cells: NotebookCellType[]): JSONContent {
    return {
        type: 'doc',
        content: cells.map(mapDatabaseCellToTipTap),
    };
}

function mapDatabaseCellToTipTap(cell: NotebookCellType): JSONContent {
    const db: TipTapDBType = {
        id: cell.id,
        orderIndex: cell.orderIndex,
        parentCellId: cell.parentCellId,
        createdAt: cell.createdAt,
        updatedAt: cell.updatedAt,
    };

    if (cell.type === 'heading1') {
        return mapHeading1Cell(cell as NotebookCellType<'heading1'>, db);
    }

    if (cell.type === 'heading2') {
        return mapHeading2Cell(cell as NotebookCellType<'heading2'>, db);
    }

    if (cell.type === 'heading3') {
        return mapHeading3Cell(cell as NotebookCellType<'heading3'>, db);
    }

    if (cell.type === 'text') {
        return mapTextCell(cell as NotebookCellType<'text'>, db);
    }

    if (cell.type === 'page') {
        return mapPageCell(cell as NotebookCellType<'page'>, db);
    }

    throw new Error(`Unknown cell type: ${cell.type}`);
}

function mapHeading1Cell(cell: NotebookCellType<'heading1'>, db: TipTapDBType): JSONContent {
    const heading1Properties = cell.propertyData as NotebookHeading1CellProperties;
    const content = heading1Properties.text ? [{ type: 'text', text: heading1Properties.text }] : [];

    return {
        type: 'headingWrapped',
        attrs: {
            level: 1,
            db: JSON.stringify(db),
        },
        content,
    };
}

function mapHeading2Cell(cell: NotebookCellType<'heading2'>, db: TipTapDBType): JSONContent {
    const heading2Properties = cell.propertyData as NotebookHeading2CellProperties;
    const content = heading2Properties.text ? [{ type: 'text', text: heading2Properties.text }] : [];

    return {
        type: 'headingWrapped',
        attrs: {
            level: 2,
            db: JSON.stringify(db),
        },
        content,
    };
}

function mapHeading3Cell(cell: NotebookCellType<'heading3'>, db: TipTapDBType): JSONContent {
    const heading3Properties = cell.propertyData as NotebookHeading3CellProperties;
    const content = heading3Properties.text ? [{ type: 'text', text: heading3Properties.text }] : [];

    return {
        type: 'headingWrapped',
        attrs: {
            level: 3,
            db: JSON.stringify(db),
        },
        content,
    };
}

function mapTextCell(cell: NotebookCellType<'text'>, db: TipTapDBType): JSONContent {
    const textProperties = cell.propertyData as NotebookTextCellProperties;
    const content: JSONContent[] = [];

    for (const textSection of textProperties.textSections || []) {
        if (textSection.type === 'text') {
            content.push({
                type: 'text',
                text: textSection.text,
            });
        } else if (textSection.type === 'mentionPage') {
            content.push({
                type: 'mentionPage',
                attrs: { id: textSection.pageId },
            });
        } else {
            throw new Error(`Unknown text section type: ${JSON.stringify(textSection)}`);
        }
    }

    return {
        type: 'paragraphWrapped',
        content,
        attrs: {
            db: JSON.stringify(db),
        },
    };
}

function mapPageCell(_cell: NotebookCellType<'page'>, db: TipTapDBType): JSONContent {
    return {
        type: 'pageWrapped',
        attrs: {
            db: JSON.stringify(db),
        },
    };
}
