import type { SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useCallback, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export type DatabaseRecordQueryFunction<T extends keyof SqliteTables, R> = (record: SqliteTableRecordType[T] | null) => R | Promise<R>;

export function useDatabaseRecordQuery<T extends keyof SqliteTables, R>(
    table: T,
    recordId: string | undefined,
    queryFunction: DatabaseRecordQueryFunction<T, R>
) {
    const database = useDatabase();

    // Use ref to store the latest query function to avoid dependency issues
    const queryFunctionRef = useRef(queryFunction);
    queryFunctionRef.current = queryFunction;

    // Stabilize the query function to prevent infinite re-renders
    const stableQueryFunction = useCallback((record: SqliteTableRecordType[T] | null) => queryFunctionRef.current(record), []);

    const query = useQuery(async () => {
        if (!recordId) return stableQueryFunction(null);
        const record = (await database.tables[table].get(recordId)) as SqliteTableRecordType[T] | null;
        return stableQueryFunction(record);
    }, [table, recordId, stableQueryFunction]);

    // Stabilize the subscription callback
    const handleRecordUpdate = useCallback(
        async (data: unknown) => {
            const result = await stableQueryFunction(data as SqliteTableRecordType[T] | null);
            query.setData(result);
        },
        [stableQueryFunction, query.setData]
    );

    useEffect(() => {
        if (!recordId) return;

        let unsubscribe: () => void = () => {};

        database.tables[table].subscribeRecord(recordId, handleRecordUpdate).then(unsub => {
            unsubscribe = unsub;
        });

        return () => unsubscribe();
    }, [database, table, recordId, handleRecordUpdate]);

    return query;
}
