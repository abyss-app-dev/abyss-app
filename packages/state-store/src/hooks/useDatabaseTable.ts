import type { SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export function useDatabaseTable<T extends keyof SqliteTables>(table: T) {
    const database = useDatabase();

    const query = useQuery<SqliteTableRecordType[T][]>(async () => {
        const tableRef = database.tables[table];
        return (await tableRef.list()) as SqliteTableRecordType[T][];
    }, [table]);

    useEffect(() => {
        return database.tables[table].subscribe(() => {
            query.refetch();
        });
    }, [database, table, query.setData]);

    return query;
}
