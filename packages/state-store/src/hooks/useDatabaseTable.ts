import type { SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export function useDatabaseTable<T extends keyof SqliteTables>(table: T) {
    const database = useDatabase();

    const query = useQuery(async () => {
        return database.tables[table].list();
    }, [table]);

    useEffect(() => {
        return database.tables[table].subscribe(() => {
            query.refetch();
        });
    }, [database, table, query.setData]);

    return query;
}
