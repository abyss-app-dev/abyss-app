import type { SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export function useDatabaseRecord<T extends keyof SqliteTables>(table: T, recordId: string | undefined) {
    const database = useDatabase();

    const query = useQuery(async () => {
        if (!recordId) return null;
        return database.tables[table].get(recordId) as Promise<SqliteTableRecordType[T] | null>;
    }, [table, recordId]);

    useEffect(() => {
        if (!recordId) return;

        let unsubscribe: () => void = () => {};

        database.tables[table]
            .subscribeRecord(recordId, data => {
                query.setData(data as SqliteTableRecordType[T] | null);
            })
            .then(unsub => {
                unsubscribe = unsub;
            });

        return () => unsubscribe();
    }, [database, table, recordId, query.setData]);

    return query;
}
