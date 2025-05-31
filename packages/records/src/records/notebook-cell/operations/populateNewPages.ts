import type { ReferencedNotebookCellTable } from '../notebook-cell';
import type { NotebookCellType, NotebookTextCellProperties } from '../notebook-cell.type';
import { UpdateCellOperations } from './saveNotebook';

export async function newPages(table: ReferencedNotebookCellTable, newCellState: NotebookCellType[]) {
    const cellsNeedingUpdate: Set<string> = new Set();
    for (const cell of newCellState) {
        if (cell.type === 'text') {
            const textProperties = cell.propertyData as NotebookTextCellProperties;
            for (const textSection of textProperties.textSections) {
                if (textSection.type === 'mentionPage') {
                    const ref = table.ref(textSection.pageId);
                    const exists = await ref.exists();

                    if (!exists) {
                        const newPage = await table.create({
                            type: 'page',
                            propertyData: {
                                title: 'New Page',
                            },
                            parentCellId: null,
                            orderIndex: 0,
                        });

                        textSection.pageId = newPage.id;
                        cellsNeedingUpdate.add(cell.id);
                    }
                }
            }
        }
    }

    const cellObjectsNeedingUpdates = newCellState.filter(cell => cellsNeedingUpdate.has(cell.id));
    return cellObjectsNeedingUpdates;
}
