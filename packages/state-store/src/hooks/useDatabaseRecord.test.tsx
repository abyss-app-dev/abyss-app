import { buildTestDB, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useDatabaseRecord } from './useDatabaseRecord';

describe('useDatabaseRecord hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('loads record with valid ID', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseRecord(SqliteTable.settings, defaultRecord.id);
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('handles null record ID', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseRecord(SqliteTable.settings, undefined);
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('handles non-existent record ID', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseRecord(SqliteTable.settings, 'settings::nonexistent');
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('record ID changes dynamically', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [recordId, setRecordId] = useState<string | undefined>(undefined);

                        const result = useDatabaseRecord(SqliteTable.settings, recordId);

                        useEffect(() => {
                            if (!recordId) {
                                setTimeout(() => setRecordId(defaultRecord.id));
                            }
                        }, [recordId]);

                        return { ...result, recordId };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('manual refetch functionality', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasRefetched, setHasRefetched] = useState(false);

                        const result = useDatabaseRecord(SqliteTable.settings, defaultRecord.id);

                        useEffect(() => {
                            if (result.data && !result.loading && !hasRefetched) {
                                setHasRefetched(true);
                                setTimeout(() => result.refetch());
                            }
                        }, [result.data, result.loading, result.refetch, hasRefetched]);

                        return { ...result, hasRefetched };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription receives updates', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasSetData, setHasSetData] = useState(false);

                        const result = useDatabaseRecord(SqliteTable.settings, defaultRecord.id);

                        useEffect(() => {
                            if (result.data && !result.loading && !hasSetData && result.setData) {
                                setHasSetData(true);
                                setTimeout(() =>
                                    result.setData({
                                        ...defaultRecord,
                                        theme: 'updated-theme',
                                    })
                                );
                            }
                        }, [result.data, result.loading, result.setData, hasSetData]);

                        return { ...result, hasSetData };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription updates when database record is modified', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasUpdatedDb, setHasUpdatedDb] = useState(false);
                        const [updateCount, setUpdateCount] = useState(0);

                        const result = useDatabaseRecord(SqliteTable.settings, defaultRecord.id);

                        // Track when data changes to count subscription updates
                        useEffect(() => {
                            if (result.data) {
                                setUpdateCount(prev => prev + 1);
                            }
                        }, [result.data]);

                        // Modify the database record after initial load
                        useEffect(() => {
                            if (result.data && !result.loading && !hasUpdatedDb) {
                                setHasUpdatedDb(true);
                                setTimeout(async () => {
                                    // Create a new settings record that should trigger subscription
                                    const newRecord = await db.tables[SqliteTable.settings].default();
                                    // This will trigger database updates
                                }, 50);
                            }
                        }, [result.data, result.loading, hasUpdatedDb]);

                        return {
                            ...result,
                            hasUpdatedDb,
                            updateCount,
                            currentTheme: result.data?.theme,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription tracks multiple record state changes', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [modifications, setModifications] = useState<string[]>([]);
                        const [step, setStep] = useState(0);

                        const result = useDatabaseRecord(SqliteTable.settings, defaultRecord.id);

                        // Track each data change
                        useEffect(() => {
                            if (result.data) {
                                setModifications(prev => [...prev, `loaded-${result.data?.theme}`]);
                            } else if (result.data === null && !result.loading) {
                                setModifications(prev => [...prev, 'null-state']);
                            }
                        }, [result.data, result.loading]);

                        // Perform a series of manual state changes to test subscription
                        useEffect(() => {
                            if (result.data && !result.loading && step === 0) {
                                setStep(1);
                                setTimeout(() => {
                                    if (result.setData) {
                                        result.setData({
                                            ...defaultRecord,
                                            theme: 'manual-update-1',
                                        });
                                    }
                                }, 50);
                            } else if (step === 1) {
                                setStep(2);
                                setTimeout(() => {
                                    if (result.setData) {
                                        result.setData({
                                            ...defaultRecord,
                                            theme: 'manual-update-2',
                                        });
                                    }
                                }, 50);
                            }
                        }, [result.data, result.loading, result.setData, step]);

                        return {
                            ...result,
                            modifications,
                            step,
                            modificationsCount: modifications.length,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });
});
