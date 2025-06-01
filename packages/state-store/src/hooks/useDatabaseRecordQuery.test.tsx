import { buildTestDB, type SettingsType, type SQliteClient, SqliteTable } from '@abyss/records';
import { useEffect, useState } from 'react';
import { beforeEach, describe, test } from 'vitest';
import { DatabaseProvider } from '../context/DatabaseContext';
import { StateRecorder } from '../mocking/state-recorder';
import { TestRecorder } from '../mocking/wrapped-component';
import { useDatabaseRecordQuery } from './useDatabaseRecordQuery';

describe('useDatabaseRecordQuery hook', () => {
    let db: SQliteClient;
    let recorder: StateRecorder;

    beforeEach(async () => {
        db = await buildTestDB();
        recorder = new StateRecorder();
    });

    test('applies query function to record', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseRecordQuery(SqliteTable.settings, defaultRecord.id, record =>
                            record ? `theme: ${record.theme}` : 'no record'
                        );
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('handles null record with query function', async () => {
        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseRecordQuery(SqliteTable.settings, undefined, record =>
                            record ? `theme: ${record.theme}` : 'no record found'
                        );
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('query function with complex transformation', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseRecordQuery(SqliteTable.settings, defaultRecord.id, record => {
                            if (!record) return { status: 'missing' };
                            return {
                                id: record.id,
                                displayName: `Settings for ${record.theme}`,
                                isDefault: record.theme === 'default',
                                pageInfo: record.lastPage || 'no page',
                            };
                        });
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('async query function', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const result = useDatabaseRecordQuery(SqliteTable.settings, defaultRecord.id, async record => {
                            await new Promise(resolve => setTimeout(resolve, 10));
                            return record ? `async-${record.theme}` : 'async-no-record';
                        });
                        return result;
                    }}
                />
            </DatabaseProvider>
        );
    });

    test('query function changes dynamically', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [version, setVersion] = useState(1);

                        const queryFn =
                            version === 1
                                ? (record: SettingsType | null) => (record ? `v1-${record.theme}` : 'v1-no-record')
                                : (record: SettingsType | null) => (record ? `v2-${record.id}` : 'v2-no-record');

                        const result = useDatabaseRecordQuery(SqliteTable.settings, defaultRecord.id, queryFn);

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

    test('subscription updates with query processing', async () => {
        const defaultRecord = await db.tables[SqliteTable.settings].default();

        await recorder.renderToSnapshot(
            <DatabaseProvider database={db}>
                <TestRecorder
                    recorder={recorder}
                    functionToTest={() => {
                        const [hasSetData, setHasSetData] = useState(false);

                        const result = useDatabaseRecordQuery(SqliteTable.settings, defaultRecord.id, record =>
                            record ? `processed-${record.theme}` : 'processed-null'
                        );

                        useEffect(() => {
                            if (result.data && !result.loading && !hasSetData && result.setData) {
                                setHasSetData(true);
                                setTimeout(() => result.setData('manually-set-processed-data'));
                            }
                        }, [result.data, result.loading, result.setData, hasSetData]);

                        return { ...result, hasSetData };
                    }}
                />
            </DatabaseProvider>
        );
    });
});
