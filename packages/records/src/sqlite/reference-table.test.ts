import { describe, expect, test } from 'vitest';
import { ReferencedSqliteTable } from './reference-table';
import type { SqliteTables } from './sqlite.type';
import { buildTestDB } from './sqlite-client.mock';

type DebugRecord = {
    id: string;
    createdAt: number;
    updatedAt: number;
    jsonData?: Record<string, unknown>;
};

const createDebugTable = `
    CREATE TABLE IF NOT EXISTS Debug (
        id TEXT PRIMARY KEY,
        jsonData TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
    )
`;

async function createDbgDb() {
    const client = await buildTestDB({ setupCommand: createDebugTable });
    const table = new ReferencedSqliteTable<DebugRecord>('debug' as keyof SqliteTables, 'test', client);
    return table;
}

describe('ReferencedTable::List', () => {
    test('Happy: List empty table', async () => {
        const table = await createDbgDb();
        expect(await table.list()).toEqual([]);
    });
    test('Happy: List table with one record', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test' });
        expect(await table.list()).toMatchObject([{ id: 'test' }]);
    });
    test('Happy: List table with multiple records', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test' });
        await table.create({ id: 'test2' });
        const items = await table.list();
        expect(items).toHaveLength(2);
        expect(items.map(item => item.id)).toContainEqual('test');
        expect(items.map(item => item.id)).toContainEqual('test2');
    });
    test('Happy: List table with serialized json data', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test', jsonData: { test: 'test' } });
        expect(await table.list()).toMatchObject([{ id: 'test', jsonData: { test: 'test' } }]);
    });
});

describe('ReferencedTable::Count', () => {
    test('Happy: Count empty table', async () => {
        const table = await createDbgDb();
        expect(await table.count()).toEqual(0);
    });
    test('Happy: Count table with one record', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test' });
        expect(await table.count()).toEqual(1);
    });
    test('Happy: Count table with multiple records', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test' });
        await table.create({ id: 'test2' });
        expect(await table.count()).toEqual(2);
    });
});

describe('ReferencedTable::Create', () => {
    test('Happy: Create a new record', async () => {
        const table = await createDbgDb();
        expect(await table.create({ id: 'test' })).toMatchObject({ id: 'test' });
    });
    test('Happy: Create multiple new records', async () => {
        const table = await createDbgDb();
        expect(await table.createMany([{ id: 'test' }, { id: 'test2' }])).toMatchObject([{ id: 'test' }, { id: 'test2' }]);
    });
    test('Happy: Override a new record with an existing id', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test' });
        await table.create({ id: 'test' });
    });
});

describe('ReferencedTable::PurgeAll', () => {
    test('Happy: Purge all records', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test' });
        await table.create({ id: 'test2' });
        await table.purgeAll();
        expect(await table.list()).toEqual([]);
    });
});

describe('ReferencedTable::Get', () => {
    test('Happy: Get a record', async () => {
        const table = await createDbgDb();
        await table.create({ id: 'test', jsonData: { test: 'test' } });
        expect(await table.get('test')).toMatchObject({ id: 'test' });
    });
});
