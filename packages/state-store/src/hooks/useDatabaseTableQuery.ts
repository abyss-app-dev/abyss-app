import type { SqliteTables } from '@abyss/records';
import { useCallback, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export type DatabaseTableQueryFunction<T extends keyof SqliteTables, R> = (table: SqliteTables[T]) => R | Promise<R>;

export function useDatabaseTableQuery<T extends keyof SqliteTables, R>(table: T, queryFunction: DatabaseTableQueryFunction<T, R>) {
    const database = useDatabase();

    // Use ref to store the latest query function to avoid dependency issues
    const queryFunctionRef = useRef(queryFunction);
    queryFunctionRef.current = queryFunction;

    // Stabilize the query function to prevent infinite re-renders
    const stableQueryFunction = useCallback((tableInstance: SqliteTables[T]) => queryFunctionRef.current(tableInstance), []);

    const query = useQuery(async () => {
        return stableQueryFunction(database.tables[table]);
    }, [table, stableQueryFunction]);

    useEffect(() => {
        return database.tables[table].subscribe(async () => {
            query.refetch();
        });
    }, [database, table, query.refetch]);

    return query;
}
