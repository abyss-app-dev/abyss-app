import type { SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useCallback, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { type Dependencies, useQuery } from './useQuery';

export type UseDatabaseRecordSubscription<T extends keyof SqliteTables> = ReturnType<typeof useDatabaseRecordSubscription<T>>;

export function useDatabaseRecordSubscription<T extends keyof SqliteTables>(
    table: T,
    recordId: string | undefined,
    dependencies: Dependencies = []
) {
    const database = useDatabase();

    // Query for our record itself
    const query = useQuery<SqliteTableRecordType[T] | null>(async () => {
        if (recordId) {
            return database.tables[table].get(recordId) as Promise<SqliteTableRecordType[T]>;
        }
        return null;
    }, [table, recordId, ...dependencies]);

    // Stable callback for subscription updates
    const updateData = useCallback(
        (data: unknown) => {
            query.setData(data as SqliteTableRecordType[T] | null);
        },
        [query.setData]
    );

    // Subscribe to our record itself and update our data on change
    useEffect(() => {
        if (!recordId) return;
        let unsubscribeCallback: () => void = () => {};
        database.tables[table].subscribeRecord(recordId, updateData).then(unsubscribe => {
            unsubscribeCallback = unsubscribe;
        });
        return () => unsubscribeCallback();
    }, [database, table, recordId, updateData]);

    return query;
}
