import type { LogStream, ReferencedMessageThreadRecord } from '@abyss/records';

export interface StaticLanguageModelOptions {
    log: LogStream;
    thread: ReferencedMessageThreadRecord;
    response: string;
}
