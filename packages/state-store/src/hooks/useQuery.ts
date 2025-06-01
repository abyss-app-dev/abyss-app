import type { SQliteClient } from '@abyss/records';
import { useCallback, useEffect, useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export type DbQuery<T> = (database: SQliteClient) => Promise<T>;
export type Dependencies = unknown[];

export function useQuery<T>(callback: DbQuery<T>, dependencies: Dependencies = []) {
    const database = useDatabase();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await callback(database);
            setData(result);
            setError(null);
            setLoading(false);
        } catch (error) {
            setError(error as Error);
            setData(null);
            setLoading(false);
        }
    }, [database, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData, setData };
}
