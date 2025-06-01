import { buildTestDB, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useDatabaseQuery } from './useDatabaseQuery';

describe('useDatabaseQuery hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('applies query function to database', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseQuery(database => `Database: ${Object.keys(database.tables).length} tables`);
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('async query function on database', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseQuery(async database => {
                            await new Promise(resolve => setTimeout(resolve, 10));
                            return `Async DB: ${Object.keys(database.tables).length} tables`;
                        });
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('complex database query transformation', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseQuery(database => {
                            const tableNames = Object.keys(database.tables);
                            return {
                                tableCount: tableNames.length,
                                tableNames,
                                hasSettings: 'settings' in database.tables,
                                databaseType: 'sqlite',
                            };
                        });
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('query function with database access', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseQuery(async database => {
                            try {
                                const settingsRecord = await database.tables[SqliteTable.settings].default();
                                return `Found settings: ${settingsRecord.id}`;
                            } catch (error) {
                                return 'No settings found';
                            }
                        });
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('query function changes dynamically', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [version, setVersion] = useState(1);

                        const queryFn =
                            version === 1
                                ? (database: any) => `v1-tables: ${Object.keys(database.tables).length}`
                                : (database: any) => `v2-db-info: ${typeof database}`;

                        const result = useDatabaseQuery(queryFn);

                        useEffect(() => {
                            if (version === 1) {
                                setTimeout(() => setVersion(2));
                            }
                        }, [version]);

                        return { ...result, version };
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

                        const result = useDatabaseQuery(database => `Refetch test: ${Object.keys(database.tables).length} tables`);

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

    test('subscription updates with database processing', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasSetData, setHasSetData] = useState(false);

                        const result = useDatabaseQuery(database => `Processed DB: ${Object.keys(database.tables).length} tables`);

                        useEffect(() => {
                            if (result.data && !result.loading && !hasSetData && result.setData) {
                                setHasSetData(true);
                                setTimeout(() => result.setData('manually-set-database-data'));
                            }
                        }, [result.data, result.loading, result.setData, hasSetData]);

                        return { ...result, hasSetData };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription updates when database changes occur', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasTriggeredChange, setHasTriggeredChange] = useState(false);
                        const [queryResults, setQueryResults] = useState<string[]>([]);

                        const result = useDatabaseQuery(database => {
                            const tableCount = Object.keys(database.tables).length;
                            return `DB-Query: ${tableCount} tables at ${Date.now()}`;
                        });

                        // Track query results to see subscription updates
                        useEffect(() => {
                            if (result.data && !result.loading) {
                                setQueryResults(prev => [...prev, result.data as string]);
                            }
                        }, [result.data, result.loading]);

                        // Trigger a database change
                        useEffect(() => {
                            if (result.data && !result.loading && !hasTriggeredChange) {
                                setHasTriggeredChange(true);
                                setTimeout(async () => {
                                    // Creating a new record should trigger database subscription
                                    await db.tables[SqliteTable.settings].default();
                                }, 100);
                            }
                        }, [result.data, result.loading, hasTriggeredChange]);

                        return {
                            ...result,
                            hasTriggeredChange,
                            queryResultsCount: queryResults.length,
                            latestResult: queryResults[queryResults.length - 1],
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('multiple database queries receive independent updates', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [operationStep, setOperationStep] = useState(0);

                        const query1 = useDatabaseQuery(db => `Query1: ${Object.keys(db.tables).join(',')}`);
                        const query2 = useDatabaseQuery(db => `Query2: DB-${typeof db}`);

                        // Track when both queries are ready and trigger database change
                        useEffect(() => {
                            if (query1.data && query2.data && !query1.loading && !query2.loading && operationStep === 0) {
                                setOperationStep(1);
                                setTimeout(async () => {
                                    // Both queries should receive this update
                                    await db.tables[SqliteTable.settings].default();
                                    setOperationStep(2);
                                }, 100);
                            }
                        }, [query1.data, query1.loading, query2.data, query2.loading, operationStep]);

                        return {
                            query1Loading: query1.loading,
                            query2Loading: query2.loading,
                            query1HasData: !!query1.data,
                            query2HasData: !!query2.data,
                            operationStep,
                            bothReady: !!query1.data && !!query2.data && !query1.loading && !query2.loading,
                            query1Result: query1.data,
                            query2Result: query2.data,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('database query processes actual database state changes', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [operationPhase, setOperationPhase] = useState('initial');
                        const [recordCount, setRecordCount] = useState(0);

                        const result = useDatabaseQuery(async database => {
                            try {
                                // Get actual record from database
                                const defaultRecord = await database.tables[SqliteTable.settings].default();
                                return {
                                    hasDefaultRecord: !!defaultRecord,
                                    recordId: defaultRecord?.id,
                                    recordTheme: defaultRecord?.theme,
                                    queryTime: Date.now(),
                                };
                            } catch (error) {
                                return { error: 'Failed to query database', queryTime: Date.now() };
                            }
                        });

                        // Track how many times query runs
                        useEffect(() => {
                            if (result.data && !result.loading) {
                                setRecordCount(prev => prev + 1);
                            }
                        }, [result.data, result.loading]);

                        // Trigger database operations
                        useEffect(() => {
                            if (result.data && !result.loading && operationPhase === 'initial') {
                                setOperationPhase('triggering-change');
                                setTimeout(async () => {
                                    // Create another record to trigger subscription
                                    await db.tables[SqliteTable.settings].default();
                                    setOperationPhase('change-triggered');
                                }, 100);
                            }
                        }, [result.data, result.loading, operationPhase]);

                        return {
                            ...result,
                            operationPhase,
                            recordCount,
                            hasResult: !!result.data,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });
});
