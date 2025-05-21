import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { AgentGraphType } from './agent-graph.type';

export class ReferencedAgentGraphTable extends ReferencedSqliteTable<AgentGraphType> {
    constructor(client: SQliteClient) {
        super(SqliteTable.agentGraph, 'A graph representing an agent workflow with nodes and edges', client);
    }

    public ref(id: string) {
        return new ReferencedAgentGraphRecord(id, this.client);
    }
}

export class ReferencedAgentGraphRecord extends ReferencedSqliteRecord<AgentGraphType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.agentGraph, id, client);
    }
}
