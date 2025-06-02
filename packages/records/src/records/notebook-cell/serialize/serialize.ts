import type {
    NotebookCellType,
    NotebookHeading1CellProperties,
    NotebookHeading2CellProperties,
    NotebookHeading3CellProperties,
    NotebookPageCellProperties,
    NotebookTextCellProperties,
    NotebookToolCellProperties,
} from '../notebook-cell.type';

export function serializeNotebookCells(cells: NotebookCellType[]): string {
    const serialized = cells.map(cell => {
        switch (cell.type) {
            case 'page':
                return renderPageCell(cell as NotebookCellType<'page'>);
            case 'text':
                return renderTextCell(cell as NotebookCellType<'text'>);
            case 'heading1':
                return renderHeading1Cell(cell as NotebookCellType<'heading1'>);
            case 'heading2':
                return renderHeading2Cell(cell as NotebookCellType<'heading2'>);
            case 'heading3':
                return renderHeading3Cell(cell as NotebookCellType<'heading3'>);
            case 'tool':
                return renderToolCell(cell as NotebookCellType<'tool'>);
            default:
                return '';
        }
    });

    return serialized.filter(content => content.trim().length > 0).join('\n');
}

export async function serializeNotebookCellsWithHierarchy(
    cells: NotebookCellType[],
    getChildrenFn: (parentId: string) => Promise<NotebookCellType[]>
): Promise<string> {
    const serialized = await Promise.all(
        cells.map(async cell => {
            let content = '';

            switch (cell.type) {
                case 'page':
                    content = renderPageCell(cell as NotebookCellType<'page'>);
                    break;
                case 'text':
                    content = renderTextCell(cell as NotebookCellType<'text'>);
                    break;
                case 'heading1':
                    content = renderHeading1Cell(cell as NotebookCellType<'heading1'>);
                    break;
                case 'heading2':
                    content = renderHeading2Cell(cell as NotebookCellType<'heading2'>);
                    break;
                case 'heading3':
                    content = renderHeading3Cell(cell as NotebookCellType<'heading3'>);
                    break;
                case 'tool':
                    content = renderToolCell(cell as NotebookCellType<'tool'>);
                    break;
                default:
                    content = '';
            }

            // Get and serialize child cells
            const children = await getChildrenFn(cell.id);
            if (children.length > 0) {
                const childContent = await serializeNotebookCellsWithHierarchy(children, getChildrenFn);
                if (childContent.trim().length > 0) {
                    content += '\n' + childContent;
                }
            }

            return content;
        })
    );

    return serialized.filter(content => content.trim().length > 0).join('\n');
}

function renderPageCell(cell: NotebookCellType<'page'>): string {
    const properties = cell.propertyData as NotebookPageCellProperties;
    const title = properties?.title || 'Untitled Notebook';
    return `[[Reference Notebook: ${title} (${cell.id})]]`;
}

function renderTextCell(cell: NotebookCellType<'text'>): string {
    const properties = cell.propertyData as NotebookTextCellProperties;
    if (!properties?.textSections) {
        return '';
    }

    const content = properties.textSections
        .map(section => {
            switch (section.type) {
                case 'text':
                    return section.text;
                case 'mentionPage':
                    // For page mentions, we could fetch the page title, but for now just indicate it's a reference
                    return `[Page Reference: ${section.pageId}]`;
                default:
                    return '';
            }
        })
        .join('');

    return content.trim().length > 0 ? `\n${content}` : '';
}

function renderHeading1Cell(cell: NotebookCellType<'heading1'>): string {
    const properties = cell.propertyData as NotebookHeading1CellProperties;
    const text = properties?.text || '';
    return text.trim().length > 0 ? `\n\n# ${text}` : '';
}

function renderHeading2Cell(cell: NotebookCellType<'heading2'>): string {
    const properties = cell.propertyData as NotebookHeading2CellProperties;
    const text = properties?.text || '';
    return text.trim().length > 0 ? `\n\n## ${text}` : '';
}

function renderHeading3Cell(cell: NotebookCellType<'heading3'>): string {
    const properties = cell.propertyData as NotebookHeading3CellProperties;
    const text = properties?.text || '';
    return text.trim().length > 0 ? `\n\n### ${text}` : '';
}

function renderToolCell(cell: NotebookCellType<'tool'>): string {
    const properties = cell.propertyData as NotebookToolCellProperties;
    const toolId = properties?.toolId || 'Unknown Tool';
    return `[[Tool Reference: ${toolId}]]`;
}
