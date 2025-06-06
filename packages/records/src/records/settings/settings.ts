import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { SettingsType } from './settings.type';

export class ReferencedSettingsTable extends ReferencedSqliteTable<SettingsType> {
    private static DEFAULT_ID = 'settings::default';

    constructor(client: SQliteClient) {
        super(SqliteTable.settings, 'Application settings', client);
    }

    async default() {
        const defaultRef = this.ref();
        const exists = await defaultRef.exists();
        if (exists) {
            return await defaultRef.get();
        }
        return await this.create({
            id: ReferencedSettingsTable.DEFAULT_ID,
            lastPage: '/',
            theme: '',
        });
    }

    async update(settings: Partial<SettingsType>) {
        const defaultValue = await this.default();
        const defaultRef = new ReferencedSettingsRecord(defaultValue.id, this.client);
        await defaultRef.update(settings);
    }

    ref() {
        return new ReferencedSettingsRecord(ReferencedSettingsTable.DEFAULT_ID, this.client);
    }
}

export class ReferencedSettingsRecord extends ReferencedSqliteRecord<SettingsType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.settings, id, client);
    }
}
