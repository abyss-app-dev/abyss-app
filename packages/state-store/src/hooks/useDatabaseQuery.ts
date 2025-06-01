import type { SQliteClient } from '@abyss/records';
import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export type DatabaseQueryFunction<R> = (database: SQliteClient) => R | Promise<R>;

export function useDatabaseQuery<R>(queryFunction: DatabaseQueryFunction<R>) {
    const database = useDatabase();

    const query = useQuery(async () => {
        return queryFunction(database);
    }, [queryFunction]);

    useEffect(() => {
        const unsubscribe = database.subscribeDatabase(async () => {
            const result = await queryFunction(database);
            query.setData(result);
        });

        return unsubscribe;
    }, [database, queryFunction, query.setData]);

    return query;
}
