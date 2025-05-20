import { ReferencedSqliteRecord } from '../../sqlite/reference-record';
import { ReferencedSqliteTable } from '../../sqlite/reference-table';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import type { DatabaseDocumentType } from './document.type';
import { RichDocument } from './richDocument';

export class ReferencedDocumentTable extends ReferencedSqliteTable<DatabaseDocumentType> {
    constructor(client: SQliteClient) {
        super('document', 'A document', client);
    }

    public ref(id: string) {
        return new ReferencedDocumentRecord(id, this.client);
    }

    public async new(name: string) {
        return await this.create({
            name,
            documentContentData: [],
        });
    }

    public async nextVersion(previousId: string) {
        const previous = await this.client.tables.document.ref(previousId).get();
        const next = await this.create({
            name: previous.name,
            lastVersionId: previous.id,
            documentContentData: previous.documentContentData,
        });
        return next;
    }
}

export class ReferencedDocumentRecord extends ReferencedSqliteRecord<DatabaseDocumentType> {
    constructor(id: string, client: SQliteClient) {
        super('document', id, client);
    }

    public async getRichDocument() {
        const data = await this.get();
        return new RichDocument(data.documentContentData);
    }

    public async getLast() {
        const data = await this.get();
        if (!data.lastVersionId) return null;
        return new ReferencedDocumentRecord(data.lastVersionId, this.client);
    }

    public async getNext() {
        const data = await this.get();
        if (!data.nextVersionId) return null;
        return new ReferencedDocumentRecord(data.nextVersionId, this.client);
    }

    public async overwrite(document: RichDocument) {
        await this.update({ documentContentData: document.cells });
    }

    public async createNextVersion() {
        const currentData = await this.get();
        if (currentData.nextVersionId) {
            throw new Error('Cannot save a new version; a next version already exists.');
        }
        const nextVersion = await this.client.tables.document.create({
            name: currentData.name,
            lastVersionId: currentData.id,
            documentContentData: currentData.documentContentData,
        });

        await this.update({ nextVersionId: nextVersion.id });
        return new ReferencedDocumentRecord(nextVersion.id, this.client);
    }
}
