import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { MessageType } from './message.type';

export class ReferencedMessageTable extends ReferencedSqliteTable<MessageType> {
    constructor(client: SQliteClient) {
        super(SqliteTable.message, 'A message in which belongs to a message thread', client);
    }

    public ref(id: string) {
        return new ReferencedMessageRecord(id, this.client);
    }
}

export class ReferencedMessageRecord extends ReferencedSqliteRecord<MessageType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.message, id, client);
    }
}
