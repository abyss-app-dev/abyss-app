import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';

export type NotebookCellVariant = 'page' | 'text' | 'heading1' | 'heading2' | 'heading3';

export interface NotebookCellType extends BaseSqliteRecord {
    type: NotebookCellVariant;

    // Hierarchical structure
    parentCellId: string | null;
    orderIndex: number;

    // Properties
    propertyData?: Record<string, unknown>;
}
