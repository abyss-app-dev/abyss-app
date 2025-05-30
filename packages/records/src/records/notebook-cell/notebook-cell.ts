import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import { SqliteTable } from '../../sqlite/sqlite.type';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { NotebookCellType } from './notebook-cell.type';

export class ReferencedNotebookCellTable extends ReferencedSqliteTable<NotebookCellType> {
    constructor(client: SQliteClient) {
        super(SqliteTable.notebookCell, 'Hierarchical notebook cells', client);
    }

    public ref(id: string) {
        return new ReferencedNotebookCellRecord(id, this.client);
    }

    public async getRootCells(): Promise<NotebookCellType[]> {
        return this.getChildren('root');
    }

    public async getChildren(parentId: string): Promise<NotebookCellType[]> {
        const query = `SELECT * FROM ${this.tableId} WHERE parentCellId = ? ORDER BY orderIndex ASC`;
        const params = [parentId];
        const raw = await this.client.execute(query, params);
        const results = raw as Record<string, unknown>[];
        return results.map(r => ReferencedSqliteTable.deserialize(r)) as NotebookCellType[];
    }

    public async getChildrenRecords(parentId: string): Promise<ReferencedNotebookCellRecord[]> {
        const children = await this.getChildren(parentId);
        return children.map(c => new ReferencedNotebookCellRecord(c.id, this.client));
    }
}

export class ReferencedNotebookCellRecord extends ReferencedSqliteRecord<NotebookCellType> {
    constructor(id: string, client: SQliteClient) {
        super(SqliteTable.notebookCell, id, client);
    }

    public async setParent(parentId: string) {
        await this.update({ parentCellId: parentId });
    }

    public async setOrderIndex(orderIndex: number) {
        await this.update({ orderIndex });
    }

    public async insertAtStart(parentId: string) {
        const children = await this.client.tables.notebookCell.getChildrenRecords(parentId);
        const promises = children.map((c, index) => c.setOrderIndex(index + 1));
        await Promise.all(promises);
        await this.update({ parentCellId: parentId, orderIndex: 0 });
    }

    public async insertAtEnd(parentId: string) {
        const children = await this.client.tables.notebookCell.getChildrenRecords(parentId);
        await this.update({ parentCellId: parentId, orderIndex: children.length });
    }

    public async insertAt(parentId: string, orderIndex: number) {
        const children = await this.client.tables.notebookCell.getChildrenRecords(parentId);
        const promises: Promise<void>[] = [];
        for (let i = orderIndex; i < children.length; i++) {
            const child = children[i];
            promises.push(child.setOrderIndex(i + 1));
        }
        await this.update({ parentCellId: parentId, orderIndex });
        await Promise.all(promises);
    }
}
