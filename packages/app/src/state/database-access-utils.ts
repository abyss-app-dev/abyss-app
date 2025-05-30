// General access

import { SqliteTable, type SqliteTableRecordReference, type SqliteTables } from '@abyss/records';
import {
    type UseDatabaseRecordQuery,
    type UseDatabaseRecordSubscription,
    type UseDatabaseTableQuery,
    type UseDatabaseTableSubscription,
    useDatabaseQuery,
    useDatabaseRecordQuery,
    useDatabaseRecordSubscription,
    useDatabaseTableQuery,
    useDatabaseTableSubscription,
} from './database-connection';

type TableNamesAsStrings = keyof SqliteTables;
type UseDatabase = {
    [K in TableNamesAsStrings]: {
        scan: () => UseDatabaseTableSubscription<K>;
        record: (id: string | undefined) => UseDatabaseRecordSubscription<K>;
        recordQuery: <IResultType>(
            id: string,
            handler: (ref: SqliteTableRecordReference[K]) => Promise<IResultType>
        ) => UseDatabaseRecordQuery<K, IResultType>;
        tableQuery: <IResultType>(handler: (ref: SqliteTables[K]) => Promise<IResultType>) => UseDatabaseTableQuery<K, IResultType>;
    };
};

export const useDatabase = {} as UseDatabase;

const tableKeys = Object.keys(SqliteTable) as TableNamesAsStrings[];

for (const tableKey of tableKeys) {
    useDatabase[tableKey] = {
        //@ts-ignore
        scan: () => useDatabaseTableSubscription<typeof tableKey>(tableKey),
        //@ts-ignore
        record: (id: string | undefined) => useDatabaseRecordSubscription<typeof tableKey>(tableKey, id),
        //@ts-ignore
        recordQuery: <IResultType>(id: string, handler: (ref: SqliteTableRecordReference[typeof tableKey]) => Promise<IResultType>) =>
            useDatabaseRecordQuery<typeof tableKey, IResultType>(tableKey, id, handler),
        //@ts-ignore
        tableQuery: <IResultType>(handler: (ref: SqliteTables[typeof tableKey]) => Promise<IResultType>) =>
            useDatabaseTableQuery<typeof tableKey, IResultType>(tableKey, handler),
    };
}

/// Custom Accessors

export const useDatabaseSettings = () => useDatabaseTableQuery(SqliteTable.settings, async db => db.tables.settings.default());

export function useDatabaseTables() {
    return useDatabaseQuery(async database => database.describeTables());
}
