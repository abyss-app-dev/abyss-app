import type { ReferencedAgentGraphRecord, ReferencedMessageThreadRecord } from '@abyss/records';

export interface InvokeGraphFromUserMessageParams {
    agentGraph: ReferencedAgentGraphRecord;
    thread: ReferencedMessageThreadRecord;
}
