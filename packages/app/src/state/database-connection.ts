import type { SQliteClient, SqliteTableRecordReference, SqliteTableRecordType, SqliteTables } from '@abyss/records';
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
    });
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
    }, [table, recordId, ...listeners]);
    return query;
}

export type UseDatabaseTableQuery<T extends keyof SqliteTables, IResultType> = ReturnType<typeof useDatabaseTableQuery<T, IResultType>>;
export function useDatabaseTableQuery<T extends keyof SqliteTables, IResultType>(
    table: T,
    query: (database: SqliteTables[T]) => Promise<IResultType>,
    listeners: unknown[] = []
) {
    const usedQuery = useQuery(async () => {
        return await query(Database.tables[table]);
    });
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

export type UseDatabaseRecordQuery<T extends keyof SqliteTables, IResultType> = ReturnType<typeof useDatabaseRecordQuery<T, IResultType>>;
export function useDatabaseRecordQuery<T extends keyof SqliteTables, IResultType>(
    table: T,
    recordId: string,
    handler: (ref: SqliteTableRecordReference[T]) => Promise<IResultType>
) {
    const query = useQuery(async () => {
        return await handler(Database.tables[table].ref(recordId) as SqliteTableRecordReference[T]);
    });
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
    }, [recordId, table]);
    return query;
}
