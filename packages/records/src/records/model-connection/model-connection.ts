import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { ModelConnectionType } from './model-connection.type';
export type NewModelConnectionArgs = Omit<ModelConnectionType, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deleted'>;

export class ReferencedModelConnectionTable extends ReferencedSqliteTable<ModelConnectionType> {
    constructor(client: SQliteClient) {
        super(
            SqliteTable.modelConnection,
            'A connection to a AI model including the model name, API key, and other relevant information',
            client
        );
    }

    public ref(id: string) {
        return new ReferencedModelConnectionRecord(id, this.client);
    }

    public async newModelConnection(args: NewModelConnectionArgs): Promise<ModelConnectionType> {
        return this.create(args);
    }
}

export class ReferencedModelConnectionRecord extends ReferencedSqliteRecord<ModelConnectionType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.modelConnection, id, client);
    }
}
