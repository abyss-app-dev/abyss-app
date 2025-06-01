import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import type { DbQuery, Dependencies } from './useQuery';
import { useQuery } from './useQuery';

export type UseDatabaseSubscription<T> = ReturnType<typeof useDatabaseSubscription<T>>;

export function useDatabaseSubscription<T>(callback: DbQuery<T>, listeners: Dependencies = []) {
    const database = useDatabase();
    const query = useQuery(callback, listeners);

    useEffect(() => {
        return database.subscribeDatabase(() => query.refetch());
    }, [database, query.refetch]);

    return query;
}
