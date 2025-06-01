import { buildTestDB, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useDatabaseRecordSubscription } from './useDatabaseRecordSubscription';

describe('useDatabaseRecordSubscription hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('subscribe to existing record with known ID', async () => {
        // Pre-create the record to get a known ID
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, defaultRecord.id);
                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscribe to non-existent record', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, 'settings::nonexistent');
                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('handle null record ID', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, undefined);
                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('record ID changes from null to valid', async () => {
        // Pre-create the record to get a known ID
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [recordId, setRecordId] = useState<string | undefined>(undefined);

                        useEffect(() => {
                            if (recordId === undefined) {
                                setTimeout(() => setRecordId(defaultRecord.id));
                            }
                        }, [recordId]);

                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, recordId);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('record ID changes from valid to null', async () => {
        // Pre-create the record to get a known ID
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [recordId, setRecordId] = useState<string | undefined>(defaultRecord.id);

                        useEffect(() => {
                            if (recordId === defaultRecord.id) {
                                setTimeout(() => setRecordId(undefined));
                            }
                        }, [recordId]);

                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, recordId);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription with dependencies that change', async () => {
        // Pre-create the record to get a known ID
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [dependency, setDependency] = useState(1);

                        useEffect(() => {
                            if (dependency === 1) {
                                setTimeout(() => setDependency(2));
                            }
                        }, [dependency]);

                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, defaultRecord.id, [dependency]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('manually call refetch once', async () => {
        // Pre-create the record to get a known ID
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasRefetched, setHasRefetched] = useState(false);

                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, defaultRecord.id);

                        useEffect(() => {
                            if (subscription.data && !subscription.loading && !hasRefetched) {
                                setHasRefetched(true);
                                setTimeout(() => subscription.refetch());
                            }
                        }, [subscription.data, subscription.loading, subscription.refetch, hasRefetched]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('manually call setData', async () => {
        // Pre-create the record to get a known ID
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasSetData, setHasSetData] = useState(false);

                        const subscription = useDatabaseRecordSubscription(SqliteTable.settings, defaultRecord.id);

                        useEffect(() => {
                            if (subscription.data && !subscription.loading && !hasSetData) {
                                setHasSetData(true);
                                setTimeout(() =>
                                    subscription.setData({
                                        id: defaultRecord.id,
                                        theme: 'manually-set-theme',
                                        lastPage: '/manual',
                                        createdAt: Date.now(),
                                        updatedAt: Date.now(),
                                    })
                                );
                            }
                        }, [subscription.data, subscription.loading, subscription.setData, hasSetData]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });
});
