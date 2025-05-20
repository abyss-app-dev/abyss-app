import type { LogStream, MessageType, ReferencedMessageThreadRecord, ReferencedModelConnectionRecord } from '@abyss/records';
import type { RichDocument } from '@abyss/records/dist/records/document/richDocument';

export interface ConversationTurn {
    senderId: string;
    prompt: RichDocument;
}

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
