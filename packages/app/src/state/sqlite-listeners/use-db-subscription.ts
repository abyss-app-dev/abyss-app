import { useEffect } from 'react';
import { Database } from '@/main';
import type { DbQuery, Dependencies } from './use-query';
import { useQuery } from './use-query';

export type UseDatabaseSubscription<T> = ReturnType<typeof useDatabaseSubscription<T>>;

export function useDatabaseSubscription<T>(callback: DbQuery<T>, listeners: Dependencies = []) {
    const query = useQuery(callback, listeners);
    useEffect(() => Database.subscribeDatabase(() => query.refetch()), [query.refetch]);
    return query;
}
