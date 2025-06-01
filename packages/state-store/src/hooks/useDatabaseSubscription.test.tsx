import { buildTestDB, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useDatabaseSubscription } from './useDatabaseSubscription';

describe('useDatabaseSubscription hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('basic subscription with database query', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const subscription = useDatabaseSubscription(async database => {
                            return database.tables[SqliteTable.settings].default();
                        });
                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription with query that returns null', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const subscription = useDatabaseSubscription(async () => {
                            return null;
                        });
                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription with query that throws error', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const subscription = useDatabaseSubscription(async () => {
                            throw new Error('Database query failed');
                        });
                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription with dependencies that change', async () => {
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

                        const subscription = useDatabaseSubscription(async () => {
                            return `Query result for dependency: ${dependency}`;
                        }, [dependency]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription with multiple dependencies', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [dep1, setDep1] = useState('a');
                        const [dep2, setDep2] = useState(1);

                        useEffect(() => {
                            if (dep1 === 'a' && dep2 === 1) {
                                setTimeout(() => {
                                    setDep1('b');
                                    setDep2(2);
                                });
                            }
                        }, [dep1, dep2]);

                        const subscription = useDatabaseSubscription(async () => {
                            return `Query result for deps: ${dep1}-${dep2}`;
                        }, [dep1, dep2]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('manually call refetch', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasRefetched, setHasRefetched] = useState(false);

                        const subscription = useDatabaseSubscription(async () => {
                            return `Initial data at ${Date.now()}`;
                        });

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
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasSetData, setHasSetData] = useState(false);

                        const subscription = useDatabaseSubscription(async () => {
                            return 'initial data';
                        });

                        useEffect(() => {
                            if (subscription.data && !subscription.loading && !hasSetData) {
                                setHasSetData(true);
                                setTimeout(() => subscription.setData('manually set data'));
                            }
                        }, [subscription.data, subscription.loading, subscription.setData, hasSetData]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription responds to database changes', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasTriggeredChange, setHasTriggeredChange] = useState(false);
                        const [refetchCount, setRefetchCount] = useState(0);

                        const subscription = useDatabaseSubscription(async database => {
                            const records = await database.tables[SqliteTable.settings].list();
                            return `Settings count: ${records.length}`;
                        });

                        // Track refetch calls by monitoring data changes
                        useEffect(() => {
                            if (subscription.data && !subscription.loading) {
                                setRefetchCount(prev => prev + 1);
                            }
                        }, [subscription.data, subscription.loading]);

                        // Trigger a database change that should cause subscription update
                        useEffect(() => {
                            if (subscription.data && !subscription.loading && !hasTriggeredChange) {
                                setHasTriggeredChange(true);
                                setTimeout(async () => {
                                    // Creating a new record should trigger database subscription
                                    await db.tables[SqliteTable.settings].default();
                                }, 100);
                            }
                        }, [subscription.data, subscription.loading, hasTriggeredChange]);

                        return {
                            loading: subscription.loading,
                            error: subscription.error,
                            data: subscription.data,
                            hasTriggeredChange,
                            refetchCount,
                        };
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription with complex database query', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const subscription = useDatabaseSubscription(async database => {
                            const settingsRecords = await database.tables[SqliteTable.settings].list();
                            return {
                                recordCount: settingsRecords.length,
                                firstRecord: settingsRecords[0] || null,
                                timestamp: Date.now(),
                            };
                        });

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('transition from data to failure', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [shouldFail, setShouldFail] = useState(false);

                        const subscription = useDatabaseSubscription(async () => {
                            if (shouldFail) {
                                throw new Error('Query now fails');
                            }
                            return 'successful data';
                        }, [shouldFail]);

                        useEffect(() => {
                            if (subscription.data === 'successful data') {
                                setTimeout(() => setShouldFail(true));
                            }
                        }, [subscription.data]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('transition from failure to data', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [shouldFail, setShouldFail] = useState(true);

                        const subscription = useDatabaseSubscription(async () => {
                            if (shouldFail) {
                                throw new Error('Initial failure');
                            }
                            return 'recovered data';
                        }, [shouldFail]);

                        useEffect(() => {
                            if (subscription.error) {
                                setTimeout(() => setShouldFail(false));
                            }
                        }, [subscription.error]);

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription with no dependencies uses empty array', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        // Test the default empty array for dependencies
                        const subscription = useDatabaseSubscription(async () => {
                            return 'data with no dependencies';
                        });

                        return subscription;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('subscription handles database reference changes', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [queryCount, setQueryCount] = useState(0);

                        const subscription = useDatabaseSubscription(async database => {
                            const newCount = queryCount + 1;
                            setQueryCount(newCount);
                            return `Query executed ${newCount} times with DB: ${!!database}`;
                        });

                        return { ...subscription, queryCount };
                    }}
                />
            </DatabaseProvider>
        );
    });
});
