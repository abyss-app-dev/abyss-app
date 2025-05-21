import type { SQliteClient, SqliteTable, SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useEffect, useState } from 'react';
import { Database } from '../main';

function useQuery<T>(callback: (database: SQliteClient) => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            const result = await callback(Database);
            if (result) {
                setData(result);
            }
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    // Initial query
    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData, setData };
}

export type UseDatabaseSubscription<T> = ReturnType<typeof useDatabaseSubscription<T>>;
export function useDatabaseSubscription<T>(callback: (database: SQliteClient) => Promise<T>, listeners: unknown[] = []) {
    const query = useQuery(callback);
    useEffect(() => Database.subscribeDatabase(() => query.refetch()), [...listeners]);
    return query;
}

export type UseDatabaseTableSubscription<T extends keyof SqliteTables> = ReturnType<typeof useDatabaseTableSubscription<T>>;
export function useDatabaseTableSubscription<T extends keyof SqliteTables>(table: T, listeners: unknown[] = []) {
    // biome-ignore lint/suspicious/noExplicitAny: This is a helper function to avoid linting errors
    const query = useQuery(() => Database.tables[table].list() as unknown as Promise<SqliteTableRecordType[T][]>);
    useEffect(() => {
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribe(() => query.refetch())
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [table, ...listeners]);
    return query;
}

export type UseDatabaseRecordSubscription<T extends keyof SqliteTables> = ReturnType<typeof useDatabaseRecordSubscription<T>>;
export function useDatabaseRecordSubscription<T extends keyof SqliteTables>(table: T, recordId: string, listeners: unknown[] = []) {
    const query = useQuery<SqliteTableRecordType[T] | null>(async () => {
        if (recordId) {
            return Database.tables[table].get(recordId) as Promise<SqliteTableRecordType[T]>;
        }
        return null;
    });
    useEffect(() => {
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribeRecord(recordId, data => query.setData(data as SqliteTableRecordType[T] | null))
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [table, recordId, ...listeners]);
    return query;
}

export function useDatabaseTableQuery<T extends keyof SqliteTables, ResponseType>(
    table: T,
    query: (database: SQliteClient) => Promise<ResponseType>,
    listeners: unknown[] = []
) {
    const usedQuery = useQuery(query);
    useEffect(() => {
        let unsubscribeCallback: () => void = () => {};
        Database.tables[table]
            .subscribe(() => usedQuery.refetch())
            .then(unsubscribe => {
                unsubscribeCallback = unsubscribe;
            });
        return () => unsubscribeCallback();
    }, [table, ...listeners]);
    return usedQuery;
}

export function useDatabaseQuery<T>(callback: (database: SQliteClient) => Promise<T>) {
    const query = useQuery(callback);
    useEffect(() => {
        return Database.subscribeDatabase(() => query.refetch());
    }, []);
    return query;
}
