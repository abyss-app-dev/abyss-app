import type { Cell, CellCode, CellHeader, CellHeader2, CellHeader3, CellText, CellXMLElement } from '../richDocument.types';
import { dedent } from '../utils/dedent';
import { renderXmlCell } from '../utils/render-xml';

export function serializeCells(cells: Cell[]): string {
    const serialized = cells.map(cell => {
        switch (cell.type) {
            case 'text':
                return renderText(cell);
            case 'header':
                return renderHeader(cell);
            case 'header2':
                return renderHeader2(cell);
            case 'header3':
                return renderHeader3(cell);
            case 'xmlElement':
                return renderXMLElement(cell);
            case 'code':
                return renderCode(cell);
            case 'document':
                return serializeCells(cell.content.cells);
        }
    });

    return serialized.join('\n');
}

function renderText(cell: CellText): string {
    return dedent(cell.content);
}

function renderHeader(cell: CellHeader): string {
    return `\n\n\n# ${cell.content}`;
}

function renderHeader2(cell: CellHeader2): string {
    return `\n\n## ${cell.content}`;
}

function renderHeader3(cell: CellHeader3): string {
    return `\n### ${cell.content}`;
}

function renderXMLElement(cell: CellXMLElement): string {
    return renderXmlCell(cell);
}

function renderCode(cell: CellCode): string {
    return `\n\n\`\`\`${cell.content}\`\`\``;
}
