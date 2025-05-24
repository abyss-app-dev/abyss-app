import type { LogStream, ReferencedMessageThreadRecord, SQliteClient, ToolCallRequestPartial } from '@abyss/records';

export interface UnprocessedToolCallHandlerParams {
    callerId: string;
    thread: ReferencedMessageThreadRecord;
    log: LogStream;
}

export interface ToolHandlerExecutionParams {
    callerId: string;
    thread: ReferencedMessageThreadRecord;
    request: ToolCallRequestPartial['payloadData'];
    database: SQliteClient;
    log: LogStream;
}

export interface ToolHandlerExecutionResult {
    raw: string;
}
