import type { LogStream } from '@abyss/records';
import type { MessageThreadRenderedTurn } from '@abyss/records/dist/records/chat-snapshot/chat-snapshot.type';

export interface StaticLanguageModelOptions {
    log: LogStream;
    turns: MessageThreadRenderedTurn[];
    response: string;
}
