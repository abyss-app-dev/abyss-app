import type { SQliteClient } from '@abyss/records';
import { useCallback, useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useOnce } from './useOnce';

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
        } catch (error) {
            setError(error as Error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [callback, database, ...dependencies]);

    // Initial query called 1x
    useOnce(fetchData, [callback, database, ...dependencies]);

    return { data, loading, error, refetch: fetchData, setData };
}
