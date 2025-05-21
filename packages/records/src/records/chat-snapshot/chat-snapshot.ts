import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { ChatSnapshotType } from './chat-snapshot.type';

export class ReferencedChatSnapshotTable extends ReferencedSqliteTable<ChatSnapshotType> {
    constructor(client: SQliteClient) {
        super(SqliteTable.chatSnapshot, 'A point in time record of a conversation as it was serialized for an LLM', client);
    }

    public ref(id: string) {
        return new ReferencedChatSnapshotRecord(id, this.client);
    }
}

export class ReferencedChatSnapshotRecord extends ReferencedSqliteRecord<ChatSnapshotType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.chatSnapshot, id, client);
    }
}
