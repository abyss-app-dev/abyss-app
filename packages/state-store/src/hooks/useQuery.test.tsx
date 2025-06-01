import { buildTestDB, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useQuery } from './useQuery';

describe('useQuery hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('load data from database using a query', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const queryResults = useQuery(db => db.tables[SqliteTable.settings].default());
                        return queryResults;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('query results in error', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const queryResults = useQuery(() => {
                            throw new Error('Query failed');
                        });
                        return queryResults;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('query has dependencies that change', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [dependency, setDependency] = useState(1);
                        const queryResults = useQuery(() => Promise.resolve(dependency), [dependency]);
                        useEffect(() => {
                            setTimeout(() => setDependency(2));
                        }, [dependency]);
                        return queryResults;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('query has handler which changes', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [dependency, setDependency] = useState(1);
                        const queryResults = useQuery(() => Promise.resolve(dependency), [dependency]);
                        useEffect(() => {
                            setTimeout(() => setDependency(2));
                        }, [dependency]);
                        return queryResults;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('call refetch to reload data', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const queryResults = useQuery(() => Promise.resolve('initial data'));
                        useEffect(() => {
                            if (queryResults.data === 'initial data') {
                                setTimeout(() => queryResults.refetch());
                            }
                        }, [queryResults.data, queryResults.refetch]);
                        return queryResults;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('call setData to manually update state', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const queryResults = useQuery(() => Promise.resolve('initial data'));
                        useEffect(() => {
                            if (queryResults.data === 'initial data') {
                                setTimeout(() => queryResults.setData('manually set data'));
                            }
                        }, [queryResults.data, queryResults.setData]);
                        return queryResults;
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
                        const queryResults = useQuery(() => {
                            if (shouldFail) {
                                throw new Error('Query now fails');
                            }
                            return Promise.resolve('successful data');
                        }, [shouldFail]);

                        useEffect(() => {
                            if (queryResults.data === 'successful data') {
                                setTimeout(() => setShouldFail(true));
                            }
                        }, [queryResults.data]);

                        return queryResults;
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
                        const queryResults = useQuery(() => {
                            if (shouldFail) {
                                throw new Error('Initial failure');
                            }
                            return Promise.resolve('recovered data');
                        }, [shouldFail]);

                        useEffect(() => {
                            if (queryResults.error) {
                                setTimeout(() => setShouldFail(false));
                            }
                        }, [queryResults.error]);

                        return queryResults;
                    }}
                />
            </DatabaseProvider>
        );
    });
});
