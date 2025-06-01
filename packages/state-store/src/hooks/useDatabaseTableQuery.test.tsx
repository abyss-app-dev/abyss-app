import { buildTestDB, type ReferencedSettingsTable, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useDatabaseTableQuery } from './useDatabaseTableQuery';

describe('useDatabaseTableQuery hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('applies query function to table', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseTableQuery(SqliteTable.settings, table => `Table: ${table.constructor.name}`);
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('async query function on table', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseTableQuery(SqliteTable.settings, async table => {
                            await new Promise(resolve => setTimeout(resolve, 10));
                            return `Async table: ${table.constructor.name}`;
                        });
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('complex table query transformation', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseTableQuery(SqliteTable.settings, table => {
                            return {
                                tableName: table.constructor.name,
                                hasDefaultMethod: typeof table.default === 'function',
                                hasGetMethod: typeof table.get === 'function',
                                tableInfo: 'settings-table-metadata',
                            };
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
                                ? (table: ReferencedSettingsTable) => `v1-${table.constructor.name}`
                                : (table: ReferencedSettingsTable) => `v2-meta-${table.constructor.name}`;

                        const result = useDatabaseTableQuery(SqliteTable.settings, queryFn);

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

                        const result = useDatabaseTableQuery(SqliteTable.settings, table => `Refetch test: ${table.constructor.name}`);

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

    test('subscription updates with table processing', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasSetData, setHasSetData] = useState(false);

                        const result = useDatabaseTableQuery(SqliteTable.settings, table => `Processed: ${table.constructor.name}`);

                        useEffect(() => {
                            if (result.data && !result.loading && !hasSetData && result.setData) {
                                setHasSetData(true);
                                setTimeout(() => result.setData('manually-set-table-data'));
                            }
                        }, [result.data, result.loading, result.setData, hasSetData]);

                        return { ...result, hasSetData };
                    }}
                />
            </DatabaseProvider>
        );
    });
});
