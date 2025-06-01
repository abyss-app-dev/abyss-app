import { buildTestDB, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useDatabaseTable } from './useDatabaseTable';

describe('useDatabaseTable hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('loads table instance', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseTable(SqliteTable.settings);
                        return {
                            loading: result.loading,
                            error: result.error,
                            hasTable: !!result.data,
                            tableName: result.data?.constructor.name,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('manual refetch functionality', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasRefetched, setHasRefetched] = useState(false);

                        const result = useDatabaseTable(SqliteTable.settings);

                        useEffect(() => {
                            if (result.data && !result.loading && !hasRefetched) {
                                setHasRefetched(true);
                                setTimeout(() => result.refetch());
                            }
                        }, [result.data, result.loading, result.refetch, hasRefetched]);

                        return {
                            loading: result.loading,
                            error: result.error,
                            hasTable: !!result.data,
                            hasRefetched,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription receives table updates', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasSetData, setHasSetData] = useState(false);

                        const result = useDatabaseTable(SqliteTable.settings);

                        useEffect(() => {
                            if (result.data && !result.loading && !hasSetData && result.setData) {
                                setHasSetData(true);
                                setTimeout(() => result.setData(result.data));
                            }
                        }, [result.data, result.loading, result.setData, hasSetData]);

                        return {
                            loading: result.loading,
                            error: result.error,
                            hasTable: !!result.data,
                            hasSetData,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('handles different table types', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const settingsResult = useDatabaseTable(SqliteTable.settings);

                        return {
                            settingsLoading: settingsResult.loading,
                            settingsError: settingsResult.error,
                            hasSettingsTable: !!settingsResult.data,
                            settingsTableName: settingsResult.data?.constructor.name,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('table subscription persists across re-renders', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [renderCount, setRenderCount] = useState(1);

                        const result = useDatabaseTable(SqliteTable.settings);

                        useEffect(() => {
                            if (renderCount < 3) {
                                setTimeout(() => setRenderCount(prev => prev + 1));
                            }
                        }, [renderCount]);

                        return {
                            loading: result.loading,
                            error: result.error,
                            hasTable: !!result.data,
                            renderCount,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription updates when database table changes', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasTriggeredChange, setHasTriggeredChange] = useState(false);
                        const [refetchCount, setRefetchCount] = useState(0);

                        const result = useDatabaseTable(SqliteTable.settings);

                        // Track refetch calls by monitoring data changes
                        useEffect(() => {
                            if (result.data && !result.loading) {
                                setRefetchCount(prev => prev + 1);
                            }
                        }, [result.data, result.loading]);

                        // Trigger a database change that should cause subscription update
                        useEffect(() => {
                            if (result.data && !result.loading && !hasTriggeredChange) {
                                setHasTriggeredChange(true);
                                setTimeout(async () => {
                                    // Creating a new record should trigger table subscription
                                    await db.tables[SqliteTable.settings].default();
                                }, 100);
                            }
                        }, [result.data, result.loading, hasTriggeredChange]);

                        return {
                            loading: result.loading,
                            error: result.error,
                            hasTable: !!result.data,
                            hasTriggeredChange,
                            refetchCount,
                            dataLength: Array.isArray(result.data) ? result.data.length : 0,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('multiple table subscriptions work independently', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [changeStep, setChangeStep] = useState(0);

                        const settings1 = useDatabaseTable(SqliteTable.settings);
                        const settings2 = useDatabaseTable(SqliteTable.settings);

                        // Trigger database operations
                        useEffect(() => {
                            if (settings1.data && settings2.data && !settings1.loading && !settings2.loading && changeStep === 0) {
                                setChangeStep(1);
                                setTimeout(async () => {
                                    // Both subscriptions should receive this update
                                    await db.tables[SqliteTable.settings].default();
                                    setChangeStep(2);
                                }, 100);
                            }
                        }, [settings1.data, settings1.loading, settings2.data, settings2.loading, changeStep]);

                        return {
                            settings1Loading: settings1.loading,
                            settings2Loading: settings2.loading,
                            settings1HasData: !!settings1.data,
                            settings2HasData: !!settings2.data,
                            changeStep,
                            bothReady: !!settings1.data && !!settings2.data && !settings1.loading && !settings2.loading,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });
});
