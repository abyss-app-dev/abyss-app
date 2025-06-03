export const McpConnectionTable = `
    CREATE TABLE IF NOT EXISTS McpConnection (
        id TEXT PRIMARY KEY,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        name TEXT NOT NULL,
        configData TEXT NOT NULL
    )
`;
