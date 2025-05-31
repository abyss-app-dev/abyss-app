import { describe, expect, it } from 'vitest';
import { saveNotebook } from './saveNotebook';
import { createMockCell, createMultipleMockCells, mockNotebookCells, newCellStates, testScenarios } from './saveNotebook.mocking';

describe('saveNotebook', () => {
    describe('when you have an empty original notebook', () => {
        const { original } = testScenarios.emptyOriginal;

        it('when you have no new cells, no operations are performed', () => {
            const result = saveNotebook('notebook', original, newCellStates.empty);

            expect(result.deleteCells).toHaveLength(0);
            expect(result.updateCells.size).toBe(0);
            expect(result.createCells).toHaveLength(0);
        });

        it('when you have new cells, all new cells are created with correct orderIndex and parentCellId', () => {
            const result = saveNotebook('notebook', original, newCellStates.multipleNew);

            expect(result.deleteCells).toHaveLength(0);
            expect(result.updateCells.size).toBe(0);
            expect(result.createCells).toHaveLength(2);

            // Check first cell
            expect(result.createCells[0].id).toBe('new-cell-1');
            expect(result.createCells[0].parentCellId).toBe('notebook');
            expect(result.createCells[0].orderIndex).toBe(0);

            // Check second cell
            expect(result.createCells[1].id).toBe('new-cell-2');
            expect(result.createCells[1].parentCellId).toBe('notebook');
            expect(result.createCells[1].orderIndex).toBe(1);
        });
    });

    describe('when you have an original notebook with cells', () => {
        const { original } = testScenarios.multipleCellsOriginal;

        it('when you have no new cells, all cells are deleted', () => {
            const result = saveNotebook('notebook', original, newCellStates.empty);

            expect(result.deleteCells).toHaveLength(3);
            expect(result.deleteCells).toContain('cell-1');
            expect(result.deleteCells).toContain('cell-2');
            expect(result.deleteCells).toContain('cell-3');
            expect(result.updateCells.size).toBe(0);
            expect(result.createCells).toHaveLength(0);
        });

        describe('when you have new cells', () => {
            it('when the new cells start with a cell you have never seen before, all cells are updated to increment the orderIndex and a new cell is created with correct orderIndex and parentCellId at the start', () => {
                const result = saveNotebook('notebook', original, newCellStates.newCellAtStart);

                // New cell should be created at start
                expect(result.createCells).toHaveLength(1);
                expect(result.createCells[0].id).toBe('new-cell-1');
                expect(result.createCells[0].orderIndex).toBe(0);
                expect(result.createCells[0].parentCellId).toBe('notebook');

                // Existing cells should be updated with new order indices
                expect(result.updateCells.size).toBe(2);
                expect(result.updateCells.get('cell-1')?.orderIndex).toBe(1);
                expect(result.updateCells.get('cell-2')?.orderIndex).toBe(2);

                expect(result.deleteCells).toHaveLength(1);
                expect(result.deleteCells).toContain('cell-3');
            });

            describe('when the new cells start with a cell you have seen before', () => {
                it('if the cell properties are the same, no operations are performed on that cell', () => {
                    const result = saveNotebook('notebook', original, newCellStates.sameAsOriginal);

                    expect(result.updateCells.has('cell-1')).toBe(false);
                    expect(result.createCells).toHaveLength(0);
                    expect(result.deleteCells).toHaveLength(2);
                    expect(result.deleteCells).toContain('cell-2');
                    expect(result.deleteCells).toContain('cell-3');
                });

                it('if the cell properties are different, the cell is updated with the new properties', () => {
                    const result = saveNotebook('notebook', original, newCellStates.modifiedContent);

                    expect(result.updateCells.has('cell-1')).toBe(true);
                    expect(result.updateCells.get('cell-1')?.propertyData).toEqual({ content: 'Modified first cell content' });
                    expect(result.createCells).toHaveLength(0);
                    expect(result.deleteCells).toHaveLength(2);
                });
            });

            it('when the new cells dont have a cell you have seen before, the missing cell is deleted', () => {
                const newCells = [mockNotebookCells.cell1, mockNotebookCells.cell2]; // Missing cell3
                const result = saveNotebook('notebook', original, newCells);

                expect(result.deleteCells).toContain('cell-3');
                expect(result.deleteCells).toHaveLength(1);
            });

            it('when the new cells contain two cells with the same id, the first cell is treated as original and second as new', () => {
                const result = saveNotebook('notebook', original, newCellStates.duplicateIds);

                // First occurrence should be treated as update if different
                expect(result.updateCells.has('cell-1')).toBe(false); // Same properties, no update

                // Second occurrence should be treated as new cell with different ID
                expect(result.createCells).toHaveLength(1);
                expect(result.createCells[0].id).toMatch(/^cell-1_duplicate_/);
                expect(result.createCells[0].propertyData).toEqual({ content: 'Duplicate content' });
                expect(result.createCells[0].orderIndex).toBe(1);

                // Other cells should be deleted
                expect(result.deleteCells).toHaveLength(2);
                expect(result.deleteCells).toContain('cell-2');
                expect(result.deleteCells).toContain('cell-3');
            });
        });

        describe('when there are many differences, all the above rules are applied', () => {
            const { original: manyOriginal } = testScenarios.manyCellsOriginal;

            it('when we have deletions of many cells', () => {
                const newCells = [mockNotebookCells.cell1]; // Keep only one cell
                const result = saveNotebook('notebook', manyOriginal, newCells);

                expect(result.deleteCells).toHaveLength(4);
                expect(result.deleteCells).toContain('cell-2');
                expect(result.deleteCells).toContain('cell-3');
                expect(result.deleteCells).toContain('cell-4');
                expect(result.deleteCells).toContain('cell-5');
            });

            it('when we have updates of many cells', () => {
                const modifiedCells = [
                    mockNotebookCells.modifiedCell1,
                    mockNotebookCells.modifiedCell2,
                    { ...mockNotebookCells.cell3, propertyData: { content: 'Modified cell 3' } },
                    { ...mockNotebookCells.cell4, type: 'text' as const },
                    mockNotebookCells.cell5,
                ];
                const result = saveNotebook('notebook', manyOriginal, modifiedCells);

                expect(result.updateCells.size).toBe(4); // All except cell5 should be updated
                expect(result.updateCells.has('cell-1')).toBe(true);
                expect(result.updateCells.has('cell-2')).toBe(true);
                expect(result.updateCells.has('cell-3')).toBe(true);
                expect(result.updateCells.has('cell-4')).toBe(true);
                expect(result.updateCells.has('cell-5')).toBe(false); // No changes
            });

            it('when we have insertions of many cells', () => {
                const newCells = createMultipleMockCells(3, 'notebook');
                const result = saveNotebook('notebook', manyOriginal, newCells);

                expect(result.createCells).toHaveLength(3);
                expect(result.deleteCells).toHaveLength(5); // All original cells deleted
                expect(result.createCells[0].orderIndex).toBe(0);
                expect(result.createCells[1].orderIndex).toBe(1);
                expect(result.createCells[2].orderIndex).toBe(2);
            });

            it('when we have many deletions, updates, and insertions', () => {
                const result = saveNotebook('notebook', manyOriginal, newCellStates.complexChanges);

                // Should have new cells
                expect(result.createCells.length).toBeGreaterThan(0);

                // Should have updates
                expect(result.updateCells.size).toBeGreaterThan(0);

                // Should have deletions
                expect(result.deleteCells.length).toBeGreaterThan(0);

                // Verify specific operations
                expect(result.deleteCells).toContain('cell-2');
                expect(result.deleteCells).toContain('cell-4');
                expect(result.deleteCells).toContain('cell-5');
                expect(result.updateCells.has('cell-1')).toBe(true);
                expect(result.updateCells.has('cell-3')).toBe(false); // No actual change in orderIndex (2 -> 2)
            });

            it('when we have many deletions, updates, and insertions of many cells', () => {
                // Create a complex scenario with many operations
                const manyNewCells = [
                    createMockCell({ id: 'new-1' }),
                    createMockCell({ id: 'new-2' }),
                    mockNotebookCells.modifiedCell1, // Update
                    createMockCell({ id: 'new-3' }),
                    mockNotebookCells.cell3, // Keep but reorder
                    createMockCell({ id: 'new-4' }),
                    createMockCell({ id: 'new-5' }),
                ];

                const result = saveNotebook('notebook', manyOriginal, manyNewCells);

                // Should create 5 new cells
                expect(result.createCells).toHaveLength(5);

                // Should update 2 cells (cell-1 modified, cell-3 reordered)
                expect(result.updateCells.size).toBe(2);

                // Should delete 3 cells (cell-2, cell-4, cell-5)
                expect(result.deleteCells).toHaveLength(3);

                // Verify order indices are correct
                expect(result.createCells[0].orderIndex).toBe(0);
                expect(result.createCells[1].orderIndex).toBe(1);
                expect(result.updateCells.get('cell-1')?.orderIndex).toBe(2);
                expect(result.createCells[2].orderIndex).toBe(3);
                expect(result.updateCells.get('cell-3')?.orderIndex).toBe(4);
                expect(result.createCells[3].orderIndex).toBe(5);
                expect(result.createCells[4].orderIndex).toBe(6);
            });
        });
    });

    describe('edge cases', () => {
        it('handles cells with null propertyData', () => {
            const originalWithNull = [{ ...mockNotebookCells.cell1, propertyData: undefined }];
            const newWithNull = [{ ...mockNotebookCells.cell1, propertyData: undefined }];

            const result = saveNotebook('notebook', originalWithNull, newWithNull);

            expect(result.updateCells.has('cell-1')).toBe(false); // Should be same
        });

        it('handles empty strings and special values in propertyData', () => {
            const originalCell = { ...mockNotebookCells.cell1, propertyData: { content: '' } };
            const newCell = { ...mockNotebookCells.cell1, propertyData: { content: '   ' } };

            const result = saveNotebook('notebook', [originalCell], [newCell]);

            expect(result.updateCells.has('cell-1')).toBe(true);
        });

        it('preserves createdAt when updating existing cells', () => {
            const result = saveNotebook('notebook', [mockNotebookCells.cell1], [mockNotebookCells.modifiedCell1]);

            const updateData = result.updateCells.get('cell-1');
            expect(updateData).toBeDefined();
            expect(updateData?.createdAt).toBeUndefined(); // Should not include createdAt in updates
        });
    });
});
