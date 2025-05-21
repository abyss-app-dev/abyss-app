// General access

import { SqliteTable, type SqliteTables } from '@abyss/records';
import {
    type UseDatabaseRecordSubscription,
    type UseDatabaseTableSubscription,
    useDatabaseQuery,
    useDatabaseRecordSubscription,
    useDatabaseTableQuery,
    useDatabaseTableSubscription,
} from './database-connection';

type TableNamesAsStrings = keyof SqliteTables;
type UseDatabase = {
    [K in TableNamesAsStrings]: {
        scan: () => UseDatabaseTableSubscription<K>;
        record: (id: string) => UseDatabaseRecordSubscription<K>;
    };
};

export const useDatabase = {} as UseDatabase;

const tableKeys = Object.keys(SqliteTable) as TableNamesAsStrings[];

for (const tableKey of tableKeys) {
    useDatabase[tableKey] = {
        //@ts-ignore
        scan: () => useDatabaseTableSubscription<typeof tableKey>(tableKey),
        //@ts-ignore
        record: (id: string) => useDatabaseRecordSubscription<typeof tableKey>(tableKey, id),
    };
}

/// Custom Accessors

export const useDatabaseSettings = () => useDatabaseTableQuery(SqliteTable.settings, async db => db.tables.settings.default());

export function useDatabaseTables() {
    return useDatabaseQuery(async database => database.describeTables());
}
