import type { SqliteTableRecordType, SqliteTables } from '@abyss/records';
import { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useQuery } from './useQuery';

export type DatabaseRecordQueryFunction<T extends keyof SqliteTables, R> = (record: SqliteTableRecordType[T] | null) => R | Promise<R>;

export function useDatabaseRecordQuery<T extends keyof SqliteTables, R>(
    table: T,
    recordId: string | undefined,
    queryFunction: DatabaseRecordQueryFunction<T, R>
) {
    const database = useDatabase();

    const query = useQuery(async () => {
        if (!recordId) return queryFunction(null);
        const record = (await database.tables[table].get(recordId)) as SqliteTableRecordType[T] | null;
        return queryFunction(record);
    }, [table, recordId, queryFunction]);

    useEffect(() => {
        if (!recordId) return;

        let unsubscribe: () => void = () => {};

        database.tables[table]
            .subscribeRecord(recordId, async data => {
                const result = await queryFunction(data as SqliteTableRecordType[T] | null);
                query.setData(result);
            })
            .then(unsub => {
                unsubscribe = unsub;
            });

        return () => unsubscribe();
    }, [database, table, recordId, queryFunction, query.setData]);

    return query;
}
