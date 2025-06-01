import { SqliteTable, type SqliteTableRecordReference, type SqliteTables } from '@abyss/records';
import { UseDatabaseRecordQuery, useDatabaseRecordQuery } from './sqlite-listeners/use-db-record-query copy';
import { UseDatabaseRecordSubscription, useDatabaseRecordSubscription } from './sqlite-listeners/use-db-record-subscription';
import { UseDatabaseTableQuery, useDatabaseTableQuery } from './sqlite-listeners/use-db-table-query';
import { Dependencies } from './sqlite-listeners/use-query';

type TableNamesAsStrings = keyof SqliteTables;
type UseDatabase = {
    [K in TableNamesAsStrings]: {
        // Scans a database, getting all results from that db
        scan: () => UseDatabaseTableQuery<K, SqliteTableRecordReference[K][]>;

        // Gets a single record from the database by its ID
        record: (id: string | undefined) => UseDatabaseRecordSubscription<K>;

        // Gets a reference to a record from the database by its ID, and then runs a query on that record as specified by caller
        recordQuery: <IResultType>(
            id: string | undefined,
            handler: (ref: SqliteTableRecordReference[K]) => Promise<IResultType>,
            dependencies?: unknown[]
        ) => UseDatabaseRecordQuery<K, IResultType>;

        // Gets a reference to a table, and then runs a query on that table as specified by caller
        tableQuery: <IResultType>(
            handler: (ref: SqliteTables[K]) => Promise<IResultType>,
            dependencies?: unknown[]
        ) => UseDatabaseTableQuery<K, IResultType>;
    };
};

export const useDatabase = {} as UseDatabase;

const tableKeys = Object.keys(SqliteTable) as TableNamesAsStrings[];

for (const tableKey of tableKeys) {
    useDatabase[tableKey] = {
        scan: () => useDatabaseTableQuery(tableKey, async db => db.tables[tableKey].list()),
        record: (id: string | undefined) => useDatabaseRecordSubscription(tableKey, id),
        recordQuery: <IResultType>(
            id: string,
            handler: (ref: SqliteTableRecordReference[typeof tableKey]) => Promise<IResultType>,
            dependencies: Dependencies = []
        ) => useDatabaseRecordQuery(tableKey, id, handler, dependencies),
        tableQuery: <IResultType>(handler: (ref: SqliteTables[typeof tableKey]) => Promise<IResultType>, dependencies: Dependencies = []) =>
            useDatabaseTableQuery(tableKey, handler, dependencies),
    };
}

/// Custom Accessors

export const useDatabaseSettings = () => useDatabaseTableQuery(SqliteTable.settings, async db => db.tables.settings.default());

export function useDatabaseTables() {
    return useDatabaseQuery(async database => database.describeTables());
}
