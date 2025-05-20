import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';
import type { Cell } from './richDocument.types';

export interface DatabaseDocumentType extends BaseSqliteRecord {
    name: string;
    lastVersionId?: string;
    nextVersionId?: string;
    documentContentData: Cell[];
}
