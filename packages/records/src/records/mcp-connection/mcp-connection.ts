import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { McpConnectionType } from './mcp-connection.type';

export class ReferencedMcpConnectionTable extends ReferencedSqliteTable<McpConnectionType> {
    constructor(client: SQliteClient) {
        super(
            SqliteTable.mcpConnection,
            'A connection to a Model Context Protocol (MCP) server that provides tools, resources, and prompts',
            client
        );
    }

    public ref(id: string) {
        return new ReferencedMcpConnectionRecord(id, this.client);
    }
}

export class ReferencedMcpConnectionRecord extends ReferencedSqliteRecord<McpConnectionType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.mcpConnection, id, client);
    }
}
