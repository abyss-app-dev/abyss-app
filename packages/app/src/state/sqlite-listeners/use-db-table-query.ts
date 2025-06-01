import type { SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { Database } from '@/main';
import { type Dependencies, useQuery } from './use-query';

export type UseDatabaseTableQuery<T extends keyof SqliteTables, IResultType> = ReturnType<typeof useDatabaseTableQuery<T, IResultType>>;
export function useDatabaseTableQuery<T extends keyof SqliteTables, IResultType>(
    table: T,
    query: (database: SqliteTables[T]) => Promise<IResultType>,
    dependencies: Dependencies = []
) {
    const usedQuery = useQuery(async () => {
        return await query(Database.tables[table]);
    }, [table, ...dependencies]);

    useEffect(() => {
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribe(() => usedQuery.refetch())
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [table, usedQuery.refetch]);
    return usedQuery;
}
