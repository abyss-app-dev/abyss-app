export const NotebookCellTable = `
    CREATE TABLE IF NOT EXISTS NotebookCell (
        id TEXT PRIMARY KEY,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        type TEXT NOT NULL,
        parentCellId TEXT,
        orderIndex INTEGER NOT NULL,
        propertyData TEXT
    )
`;
