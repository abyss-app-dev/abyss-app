import type { NotebookCellType } from '../notebook-cell.type';

export interface UpdateCellOperations {
    deleteCells: string[];
    updateCells: Map<string, Partial<NotebookCellType>>;
    createCells: NotebookCellType[];
}

export function saveNotebook(parentId: string, originalCells: NotebookCellType[], newCellState: NotebookCellType[]): UpdateCellOperations {
    const operations: UpdateCellOperations = {
        deleteCells: [],
        updateCells: new Map(),
        createCells: [],
    };

    // Create maps for easier lookups
    const originalCellMap = new Map<string, NotebookCellType>();
    const originalCellOrder = new Map<string, number>();

    originalCells.forEach((cell, index) => {
        originalCellMap.set(cell.id, cell);
        originalCellOrder.set(cell.id, index);
    });

    // Track which original cells are still referenced
    const referencedOriginalCells = new Set<string>();
    const newCellIds = new Set<string>();

    // Process new cells to handle duplicates correctly
    const processedNewCells: NotebookCellType[] = [];

    for (let i = 0; i < newCellState.length; i++) {
        const newCell = newCellState[i];

        if (newCellIds.has(newCell.id)) {
            // This is a duplicate ID - treat as a new cell with a new ID
            const duplicateCell: NotebookCellType = {
                ...newCell,
                id: `${newCell.id}_duplicate_${Date.now()}_${Math.random()}`,
                parentCellId: parentId,
                orderIndex: i,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            processedNewCells.push(duplicateCell);
            operations.createCells.push(duplicateCell);
        } else {
            newCellIds.add(newCell.id);

            // Update the cell with correct order info, preserve parentId from new cell
            const updatedNewCell: NotebookCellType = {
                ...newCell,
                orderIndex: i,
                updatedAt: Date.now(),
            };

            processedNewCells.push(updatedNewCell);

            if (originalCellMap.has(newCell.id)) {
                // This cell existed before
                referencedOriginalCells.add(newCell.id);
                const originalCell = originalCellMap.get(newCell.id) as NotebookCellType;

                // Check if properties have changed
                const hasChanges =
                    originalCell.type !== updatedNewCell.type ||
                    originalCell.orderIndex !== updatedNewCell.orderIndex ||
                    JSON.stringify(originalCell.propertyData) !== JSON.stringify(updatedNewCell.propertyData);

                if (hasChanges) {
                    operations.updateCells.set(newCell.id, {
                        type: updatedNewCell.type,
                        parentCellId: updatedNewCell.parentCellId,
                        orderIndex: updatedNewCell.orderIndex,
                        propertyData: updatedNewCell.propertyData,
                        updatedAt: updatedNewCell.updatedAt,
                    });
                }
            } else {
                // This is a new cell
                const newCellToCreate: NotebookCellType = {
                    ...updatedNewCell,
                    parentCellId: parentId,
                    createdAt: Date.now(),
                };
                operations.createCells.push(newCellToCreate);
            }
        }
    }

    // Mark unreferenced original cells for deletion
    for (const originalCell of originalCells) {
        if (!referencedOriginalCells.has(originalCell.id)) {
            operations.deleteCells.push(originalCell.id);
        }
    }

    return operations;
}
