import type { NotebookCellType } from '../notebook-cell.type';

// Base timestamp for consistent testing
const baseTimestamp = 1700000000000;

export const mockNotebookCells: Record<string, NotebookCellType> = {
    cell1: {
        id: 'cell-1',
        type: 'text',
        parentCellId: 'notebook',
        orderIndex: 0,
        propertyData: { content: 'First cell content' },
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp,
    },
    cell2: {
        id: 'cell-2',
        type: 'heading1',
        parentCellId: 'notebook',
        orderIndex: 1,
        propertyData: { content: 'Heading 1' },
        createdAt: baseTimestamp + 1000,
        updatedAt: baseTimestamp + 1000,
    },
    cell3: {
        id: 'cell-3',
        type: 'text',
        parentCellId: 'notebook',
        orderIndex: 2,
        propertyData: { content: 'Third cell content' },
        createdAt: baseTimestamp + 2000,
        updatedAt: baseTimestamp + 2000,
    },
    cell4: {
        id: 'cell-4',
        type: 'heading2',
        parentCellId: 'notebook',
        orderIndex: 3,
        propertyData: { content: 'Heading 2' },
        createdAt: baseTimestamp + 3000,
        updatedAt: baseTimestamp + 3000,
    },
    cell5: {
        id: 'cell-5',
        type: 'text',
        parentCellId: 'notebook',
        orderIndex: 4,
        propertyData: { content: 'Fifth cell content' },
        createdAt: baseTimestamp + 4000,
        updatedAt: baseTimestamp + 4000,
    },
    newCell1: {
        id: 'new-cell-1',
        type: 'text',
        parentCellId: 'notebook',
        orderIndex: 0,
        propertyData: { content: 'New first cell' },
        createdAt: baseTimestamp + 5000,
        updatedAt: baseTimestamp + 5000,
    },
    newCell2: {
        id: 'new-cell-2',
        type: 'heading3',
        parentCellId: 'notebook',
        orderIndex: 1,
        propertyData: { content: 'New heading 3' },
        createdAt: baseTimestamp + 6000,
        updatedAt: baseTimestamp + 6000,
    },
    modifiedCell1: {
        id: 'cell-1',
        type: 'text',
        parentCellId: 'notebook',
        orderIndex: 0,
        propertyData: { content: 'Modified first cell content' },
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp + 7000,
    },
    modifiedCell2: {
        id: 'cell-2',
        type: 'heading2', // Changed from heading1
        parentCellId: 'notebook',
        orderIndex: 1,
        propertyData: { content: 'Modified Heading' },
        createdAt: baseTimestamp + 1000,
        updatedAt: baseTimestamp + 8000,
    },
};

// Test scenario configurations
export const testScenarios = {
    emptyOriginal: {
        original: [],
        parentId: 'notebook',
    },

    singleCellOriginal: {
        original: [mockNotebookCells.cell1],
        parentId: 'notebook',
    },

    multipleCellsOriginal: {
        original: [mockNotebookCells.cell1, mockNotebookCells.cell2, mockNotebookCells.cell3],
        parentId: 'notebook',
    },

    manyCellsOriginal: {
        original: [
            mockNotebookCells.cell1,
            mockNotebookCells.cell2,
            mockNotebookCells.cell3,
            mockNotebookCells.cell4,
            mockNotebookCells.cell5,
        ],
        parentId: 'notebook',
    },
};

// New cell state configurations for different test cases
export const newCellStates = {
    empty: [],

    singleNew: [mockNotebookCells.newCell1],

    multipleNew: [mockNotebookCells.newCell1, mockNotebookCells.newCell2],

    sameAsOriginal: [mockNotebookCells.cell1],

    modifiedContent: [mockNotebookCells.modifiedCell1],

    reordered: [mockNotebookCells.cell2, mockNotebookCells.cell1, mockNotebookCells.cell3],

    mixed: [
        mockNotebookCells.cell1, // unchanged
        mockNotebookCells.modifiedCell2, // modified
        mockNotebookCells.newCell1, // new
        // cell3 is deleted (not included)
    ],

    duplicateIds: [
        mockNotebookCells.cell1,
        { ...mockNotebookCells.cell1, propertyData: { content: 'Duplicate content' } }, // Same ID, different content
    ],

    newCellAtStart: [mockNotebookCells.newCell1, mockNotebookCells.cell1, mockNotebookCells.cell2],

    complexChanges: [
        mockNotebookCells.newCell1, // new at start
        mockNotebookCells.modifiedCell1, // modified
        mockNotebookCells.cell3, // unchanged but reordered
        mockNotebookCells.newCell2, // new at end
        // cell2 and cell4 are deleted
    ],
};

export function createMockCell(overrides: Partial<NotebookCellType>): NotebookCellType {
    return {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        parentCellId: 'notebook',
        orderIndex: 0,
        propertyData: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...overrides,
    };
}

export function createMultipleMockCells(count: number, parentId = 'notebook'): NotebookCellType[] {
    return Array.from({ length: count }, (_, index) =>
        createMockCell({
            parentCellId: parentId,
            orderIndex: index,
            propertyData: { content: `Cell ${index + 1} content` },
        })
    );
}
