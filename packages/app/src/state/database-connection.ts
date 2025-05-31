import type { SQliteClient, SqliteTableRecordReference, SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Database } from '../main';

function useQuery<T>(callback: (database: SQliteClient) => Promise<T>, dependencies: unknown[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Store the latest callback in a ref to avoid re-renders
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await callbackRef.current(Database);
            if (result) {
                setData(result);
            }
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }, [...dependencies]);

    // Initial query
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData, setData };
}

export type UseDatabaseSubscription<T> = ReturnType<typeof useDatabaseSubscription<T>>;
export function useDatabaseSubscription<T>(callback: (database: SQliteClient) => Promise<T>, listeners: unknown[] = []) {
    const query = useQuery(callback, listeners);
    useEffect(() => Database.subscribeDatabase(() => query.refetch()), [query.refetch]);
    return query;
}

export type UseDatabaseTableSubscription<T extends keyof SqliteTables> = ReturnType<typeof useDatabaseTableSubscription<T>>;
export function useDatabaseTableSubscription<T extends keyof SqliteTables>(table: T, listeners: unknown[] = []) {
    const query = useQuery(() => Database.tables[table].list() as unknown as Promise<SqliteTableRecordType[T][]>, [table, ...listeners]);
    useEffect(() => {
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribe(() => query.refetch())
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [table, query.refetch]);
    return query;
}

export type UseDatabaseRecordSubscription<T extends keyof SqliteTables> = ReturnType<typeof useDatabaseRecordSubscription<T>>;
export function useDatabaseRecordSubscription<T extends keyof SqliteTables>(
    table: T,
    recordId: string | undefined,
    listeners: unknown[] = []
) {
    const query = useQuery<SqliteTableRecordType[T] | null>(async () => {
        if (recordId) {
            return Database.tables[table].get(recordId) as Promise<SqliteTableRecordType[T]>;
        }
        return null;
    }, [table, recordId, ...listeners]);
    useEffect(() => {
        if (!recordId) {
            return;
        }
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribeRecord(recordId, data => query.setData(data as SqliteTableRecordType[T] | null))
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [table, recordId, query.setData]);
    return query;
}

export type UseDatabaseTableQuery<T extends keyof SqliteTables, IResultType> = ReturnType<typeof useDatabaseTableQuery<T, IResultType>>;
export function useDatabaseTableQuery<T extends keyof SqliteTables, IResultType>(
    table: T,
    query: (database: SqliteTables[T]) => Promise<IResultType>,
    listeners: unknown[] = []
) {
    // Store the latest query function in a ref
    const queryRef = useRef(query);
    queryRef.current = query;

    const usedQuery = useQuery(async () => {
        return await queryRef.current(Database.tables[table]);
    }, [table, ...listeners]);

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

export function useDatabaseQuery<T>(callback: (database: SQliteClient) => Promise<T>) {
    const query = useQuery(callback, []);
    useEffect(() => {
        return Database.subscribeDatabase(() => query.refetch());
    }, [query.refetch]);
    return query;
}

export type UseDatabaseRecordQuery<T extends keyof SqliteTables, IResultType> = ReturnType<typeof useDatabaseRecordQuery<T, IResultType>>;
export function useDatabaseRecordQuery<T extends keyof SqliteTables, IResultType>(
    table: T,
    recordId: string,
    handler: (ref: SqliteTableRecordReference[T]) => Promise<IResultType>,
    dependencies: unknown[] = []
) {
    // Store the latest handler in a ref
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    const query = useQuery(async () => {
        return await handlerRef.current(Database.tables[table].ref(recordId) as SqliteTableRecordReference[T]);
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
