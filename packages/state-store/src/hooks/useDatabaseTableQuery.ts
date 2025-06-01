import type { SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { type Dependencies, useQuery } from './useQuery';

export type UseDatabaseTableQuery<T extends keyof SqliteTables, IResultType> = ReturnType<typeof useDatabaseTableQuery<T, IResultType>>;

export function useDatabaseTableQuery<T extends keyof SqliteTables, IResultType>(
    table: T,
    query: (database: SqliteTables[T]) => Promise<IResultType>,
    dependencies: Dependencies = []
) {
    const database = useDatabase();

    const usedQuery = useQuery(async () => {
        return await query(database.tables[table]);
    }, [table, ...dependencies]);

    useEffect(() => {
        let unsubscribeCallback: () => void = () => {};
        database.tables[table]
            .subscribe(() => usedQuery.refetch())
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [database, table, usedQuery.refetch]);

    return usedQuery;
}
