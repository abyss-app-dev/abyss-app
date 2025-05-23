import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';
import type { Cell } from '../document/richDocument.types';

export interface ChatSnapshotType extends BaseSqliteRecord {
    messagesData: MessageThreadRenderedTurn[];
}

export interface MessageThreadRenderedTurn {
    senderId: string;
    messages: Cell[];
}
