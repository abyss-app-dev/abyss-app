import type { ReferencedMessageThreadRecord, ReferencedModelConnectionRecord } from '@abyss/records';

export interface InvokeModelParams {
    modelConnection: ReferencedModelConnectionRecord;
    thread: ReferencedMessageThreadRecord;
}
