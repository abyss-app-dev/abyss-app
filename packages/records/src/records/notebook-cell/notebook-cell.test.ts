import { beforeEach, describe, expect, test } from 'vitest';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import { buildTestDB } from '../../sqlite/sqlite-client.mock';

let client: SQliteClient;

beforeEach(async () => {
    client = await buildTestDB();
});

describe('Notebook Cell Table', () => {
    test('can create a notebook cell', async () => {
        const cell = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        expect(cell).toBeDefined();
        expect(cell.id).toBeTypeOf('string');
        expect(cell.type).toBe('page');
        expect(cell.parentCellId).toBeNull();
        expect(cell.orderIndex).toBe(0);
    });

    test('can retrieve a notebook cell by id', async () => {
        const created = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: null,
            orderIndex: 0,
        });

        const retrieved = await client.tables.notebookCell.ref(created.id).get();
        expect(retrieved).toBeDefined();
        expect(retrieved.id).toBe(created.id);
        expect(retrieved.type).toBe('text');
    });

    test('can get children of a parent cell', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        const child1 = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: parent.id,
            orderIndex: 0,
        });

        const child2 = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: parent.id,
            orderIndex: 1,
        });

        const children = await client.tables.notebookCell.getChildren(parent.id);
        expect(children).toHaveLength(2);
        expect(children[0].id).toBe(child1.id);
        expect(children[0].orderIndex).toBe(0);
        expect(children[1].id).toBe(child2.id);
        expect(children[1].orderIndex).toBe(1);
    });

    test('can get children records of a parent cell', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        const child1 = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: parent.id,
            orderIndex: 0,
        });

        const childRecords = await client.tables.notebookCell.getChildrenRecords(parent.id);
        expect(childRecords).toHaveLength(1);
        expect(childRecords[0].id).toBe(child1.id);

        const childData = await childRecords[0].get();
        expect(childData.type).toBe('text');
    });

    test('returns empty array for parent with no children', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        const children = await client.tables.notebookCell.getChildren(parent.id);
        expect(children).toHaveLength(0);
    });
});

describe('Notebook Cell Record', () => {
    test('can set parent of a cell', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        const child = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: null,
            orderIndex: 0,
        });

        const childRecord = client.tables.notebookCell.ref(child.id);
        await childRecord.setParent(parent.id);

        const updatedChild = await childRecord.get();
        expect(updatedChild.parentCellId).toBe(parent.id);
    });

    test('can set order index of a cell', async () => {
        const cell = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: null,
            orderIndex: 0,
        });

        const cellRecord = client.tables.notebookCell.ref(cell.id);
        await cellRecord.setOrderIndex(5);

        const updatedCell = await cellRecord.get();
        expect(updatedCell.orderIndex).toBe(5);
    });

    test('insertAtStart sets cell as first child and shifts others', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        // Create new cell to insert at start
        const newCell = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: null,
            orderIndex: 0,
        });

        const newCellRecord = client.tables.notebookCell.ref(newCell.id);
        await newCellRecord.insertAtStart(parent.id);

        // Check the new cell is at index 0
        const updatedNewCell = await newCellRecord.get();
        expect(updatedNewCell.parentCellId).toBe(parent.id);
        expect(updatedNewCell.orderIndex).toBe(0);

        // Check existing children were shifted
        const children = await client.tables.notebookCell.getChildren(parent.id);
        expect(children).toHaveLength(1);
    });

    test('insertAtEnd sets cell as last child', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        // Create existing children
        const existingChild = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: parent.id,
            orderIndex: 0,
        });

        // Create new cell to insert at end
        const newCell = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: null,
            orderIndex: 0,
        });

        const newCellRecord = client.tables.notebookCell.ref(newCell.id);
        await newCellRecord.insertAtEnd(parent.id);

        const updatedNewCell = await newCellRecord.get();
        expect(updatedNewCell.parentCellId).toBe(parent.id);
        expect(updatedNewCell.orderIndex).toBe(1);

        const children = await client.tables.notebookCell.getChildren(parent.id);
        expect(children).toHaveLength(2);
        expect(children[0].id).toBe(existingChild.id);
        expect(children[1].id).toBe(newCell.id);
    });

    test('insertAt inserts cell at specific position and shifts others', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        // Create new cell to insert at position 1
        const newCell = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: null,
            orderIndex: 0,
        });

        const newCellRecord = client.tables.notebookCell.ref(newCell.id);
        await newCellRecord.insertAt(parent.id, 1);

        const children = await client.tables.notebookCell.getChildren(parent.id);
        expect(children).toHaveLength(1);
    });

    test('insertAt at position 0 works like insertAtStart', async () => {
        const parent = await client.tables.notebookCell.create({
            type: 'page',
            parentCellId: null,
            orderIndex: 0,
        });

        const newCell = await client.tables.notebookCell.create({
            type: 'text',
            parentCellId: null,
            orderIndex: 0,
        });

        const newCellRecord = client.tables.notebookCell.ref(newCell.id);
        await newCellRecord.insertAt(parent.id, 0);

        const children = await client.tables.notebookCell.getChildren(parent.id);
        expect(children).toHaveLength(1);
        expect(children[0].orderIndex).toBe(0);
        expect(children[0].id).toBe(newCell.id);
    });
});
