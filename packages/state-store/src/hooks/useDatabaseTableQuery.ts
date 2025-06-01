import type { SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export type DatabaseTableQueryFunction<T extends keyof SqliteTables, R> = (table: SqliteTables[T]) => R | Promise<R>;

export function useDatabaseTableQuery<T extends keyof SqliteTables, R>(table: T, queryFunction: DatabaseTableQueryFunction<T, R>) {
    const database = useDatabase();

    const query = useQuery(async () => {
        return queryFunction(database.tables[table]);
    }, [table, queryFunction]);

    useEffect(() => {
        return database.tables[table].subscribe(async () => {
            query.refetch();
        });
    }, [database, table, queryFunction, query.setData]);

    return query;
}
