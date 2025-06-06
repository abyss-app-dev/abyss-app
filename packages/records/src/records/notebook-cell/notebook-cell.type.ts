import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';

export type NotebookCellVariant = 'page' | 'text' | 'heading1' | 'heading2' | 'heading3' | 'tool' | 'agent';

export interface NotebookCellType<T extends NotebookCellVariant = NotebookCellVariant> extends BaseSqliteRecord {
    type: T;

    // Hierarchical structure
    parentCellId: string | null;
    orderIndex: number;

    // Properties
    propertyData?: NotebookCellProperties;
}

export interface NotebookPageCellProperties {
    title: string;
}

export interface NotebookTextCellProperties {
    textSections: NoteBookTextSectionProperties[];
}

export interface NotebookHeading1CellProperties {
    text: string;
}

export interface NotebookHeading2CellProperties {
    text: string;
}

export interface NotebookHeading3CellProperties {
    text: string;
}

export interface NotebookToolCellProperties {
    toolId: string;
}

export interface NotebookAgentCellProperties {
    agentId: string;
    content: string;
}

export type NotebookCellProperties =
    | NotebookPageCellProperties
    | NotebookTextCellProperties
    | NotebookHeading1CellProperties
    | NotebookHeading2CellProperties
    | NotebookHeading3CellProperties
    | NotebookToolCellProperties
    | NotebookAgentCellProperties;

export interface NoteBookTextSectionTextProperties {
    type: 'text';
    text: string;
}

export interface NoteBookTextSectionMentionPageProperties {
    type: 'mentionPage';
    pageId: string;
}

export type NoteBookTextSectionProperties = NoteBookTextSectionTextProperties | NoteBookTextSectionMentionPageProperties;
