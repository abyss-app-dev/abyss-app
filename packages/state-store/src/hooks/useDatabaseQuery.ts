import type { SQliteClient } from '@abyss/records';
import { useCallback, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export type DatabaseQueryFunction<R> = (database: SQliteClient) => R | Promise<R>;

export function useDatabaseQuery<R>(queryFunction: DatabaseQueryFunction<R>) {
    const database = useDatabase();

    // Use ref to store the latest query function to avoid dependency issues
    const queryFunctionRef = useRef(queryFunction);
    queryFunctionRef.current = queryFunction;

    // Stabilize the query function to prevent infinite re-renders
    const stableQueryFunction = useCallback((db: SQliteClient) => queryFunctionRef.current(db), []);

    const query = useQuery(async () => {
        return stableQueryFunction(database);
    }, [stableQueryFunction]);

    // Stabilize the subscription callback
    const handleSubscriptionUpdate = useCallback(async () => {
        const result = await stableQueryFunction(database);
        query.setData(result);
    }, [stableQueryFunction, database, query.setData]);

    useEffect(() => {
        const unsubscribe = database.subscribeDatabase(handleSubscriptionUpdate);
        return unsubscribe;
    }, [database, handleSubscriptionUpdate]);

    return query;
}
