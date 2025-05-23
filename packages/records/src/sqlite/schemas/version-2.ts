export const AgentGraphExecutionTable = `
    CREATE TABLE IF NOT EXISTS AgentGraphExecution (
        id TEXT PRIMARY KEY,
        agentGraphId TEXT NOT NULL,
        logId TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
    )
`;
