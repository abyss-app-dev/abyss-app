import type { LogStream, MessageType, ReferencedMessageThreadRecord, ReferencedModelConnectionRecord } from '@abyss/records';

export interface InvokeModelParams {
    log: LogStream;
    modelConnection: ReferencedModelConnectionRecord;
    thread: ReferencedMessageThreadRecord;
}

export interface InvokeModelInternalResult {
    inputStructured: unknown;
    outputStructured: unknown;
    outputString: string;
    metrics: Record<string, number>;
}

export interface InvokeModelChatResult extends InvokeModelInternalResult {
    outputParsed: MessageType[];
}
