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
            handler: (ref: SqliteTableRecordReference[K]) => Promise<IResultType>,
            dependencies?: unknown[]
        ) => UseDatabaseRecordQuery<K, IResultType>;
        tableQuery: <IResultType>(
            handler: (ref: SqliteTables[K]) => Promise<IResultType>,
            dependencies?: unknown[]
        ) => UseDatabaseTableQuery<K, IResultType>;
    };
};

export const useDatabase = {} as UseDatabase;

const tableKeys = Object.keys(SqliteTable) as TableNamesAsStrings[];

for (const tableKey of tableKeys) {
    (useDatabase as any)[tableKey] = {
        scan: () => useDatabaseTableSubscription(tableKey),
        record: (id: string | undefined) => useDatabaseRecordSubscription(tableKey, id),
        recordQuery: <IResultType>(
            id: string,
            handler: (ref: SqliteTableRecordReference[typeof tableKey]) => Promise<IResultType>,
            dependencies: unknown[] = []
        ) => useDatabaseRecordQuery(tableKey, id, handler, dependencies),
        tableQuery: <IResultType>(handler: (ref: SqliteTables[typeof tableKey]) => Promise<IResultType>, dependencies: unknown[] = []) =>
            useDatabaseTableQuery(tableKey, handler, dependencies),
    };
}

/// Custom Accessors

export const useDatabaseSettings = () => useDatabaseTableQuery(SqliteTable.settings, async db => db.tables.settings.default());

export function useDatabaseTables() {
    return useDatabaseQuery(async database => database.describeTables());
}
