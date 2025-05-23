import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { AgentGraphExecutionType } from './agent-graph-execution.type';

export class ReferencedAgentGraphExecutionTable extends ReferencedSqliteTable<AgentGraphExecutionType> {
    constructor(client: SQliteClient) {
        super(SqliteTable.agentGraphExecution, 'An execution of an agent graph', client);
    }

    public ref(id: string) {
        return new ReferencedAgentGraphExecutionRecord(id, this.client);
    }
}

export class ReferencedAgentGraphExecutionRecord extends ReferencedSqliteRecord<AgentGraphExecutionType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.agentGraphExecution, id, client);
    }
}
