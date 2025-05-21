import type { LogStream, ReferencedMessageThreadRecord, ToolCallRequestPartial } from '@abyss/records';

export interface UnprocessedToolCallHandlerParams {
    callerId: string;
    thread: ReferencedMessageThreadRecord;
    log: LogStream;
}

export interface ToolHandlerExecutionParams {
    callerId: string;
    thread: ReferencedMessageThreadRecord;
    request: ToolCallRequestPartial['payloadData'];
    log: LogStream;
}

export interface ToolHandlerExecutionResult {
    raw: string;
}
