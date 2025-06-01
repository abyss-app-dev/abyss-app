import type { SqliteTableRecordReference, SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { Database } from '@/main';
import { type Dependencies, useQuery } from './use-query';

export type UseDatabaseRecordQuery<T extends keyof SqliteTables, IResultType> = ReturnType<typeof useDatabaseRecordQuery<T, IResultType>>;
export function useDatabaseRecordQuery<T extends keyof SqliteTables, IResultType>(
    table: T,
    recordId: string,
    handler: (ref: SqliteTableRecordReference[T]) => Promise<IResultType>,
    dependencies: Dependencies = []
) {
    const query = useQuery(async () => {
        return await handler(Database.tables[table].ref(recordId) as SqliteTableRecordReference[T]);
    }, [table, recordId, ...dependencies]);

    useEffect(() => {
        if (!recordId) {
            return;
        }
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribeRecord(recordId, () => query.refetch())
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [recordId, table, query.refetch]);
    return query;
}
