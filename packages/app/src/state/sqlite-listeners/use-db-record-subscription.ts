import type { SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { Database } from '@/main';
import { type Dependencies, useQuery } from './use-query';

export type UseDatabaseRecordSubscription<T extends keyof SqliteTables> = ReturnType<typeof useDatabaseRecordSubscription<T>>;
export function useDatabaseRecordSubscription<T extends keyof SqliteTables>(
    table: T,
    recordId: string | undefined,
    dependencies: Dependencies = []
) {
    // Query for our record itself
    const query = useQuery<SqliteTableRecordType[T] | null>(async () => {
        if (recordId) {
            return Database.tables[table].get(recordId) as Promise<SqliteTableRecordType[T]>;
        }
        return null;
    }, [table, recordId, ...dependencies]);

    // Subscribe to our record itself and update our data on change
    useEffect(() => {
        if (!recordId) return;
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribeRecord(recordId, data => query.setData(data as SqliteTableRecordType[T] | null))
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [table, recordId, query.setData, ...dependencies]);

    return query;
}
