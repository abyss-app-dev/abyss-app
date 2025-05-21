import type { ReferencedAgentGraphTable } from '../records/agent-graph/agent-graph';
import type { AgentGraphType } from '../records/agent-graph/agent-graph.type';
import type { ReferencedChatSnapshotTable } from '../records/chat-snapshot/chat-snapshot';
import type { ChatSnapshotType } from '../records/chat-snapshot/chat-snapshot.type';
import type { ReferencedDocumentTable } from '../records/document/databaseDocument';
import type { ReferencedMessageTable } from '../records/message/message';
import type { MessageType } from '../records/message/message.type';
import type { ReferencedMessageThreadTable } from '../records/message-thread/message-thread';
import type { MessageThreadType } from '../records/message-thread/message-thread.type';
import type { ReferencedMetricTable } from '../records/metric/metric';
import type { MetricType } from '../records/metric/metric.type';
import type { ReferencedModelConnectionTable } from '../records/model-connection/model-connection';
import type { ModelConnectionType } from '../records/model-connection/model-connection.type';
import type { ReferencedSettingsTable } from '../records/settings/settings';
import type { SettingsType } from '../records/settings/settings.type';
import type { ReferencedToolDefinitionTable } from '../records/tool-definition/tool-definition';
import type { ToolDefinitionType } from '../records/tool-definition/tool-definition.type';
import type { ReferencedSqliteRecord } from './reference-record';
import type { SQliteClient } from './sqlite-client';

export interface DBSidecarType {
    databaseVersionId: string;
    applicationVersionId: string;
}

export const DefaultSidecar: DBSidecarType = {
    databaseVersionId: 'NONE',
    applicationVersionId: 'NONE',
};

export interface BaseSqliteRecord {
    id: string;
    createdAt: number;
    updatedAt: number;
}

export type SqliteRecordClass<Ref = ReferencedSqliteRecord> = new (
    tableId: keyof SqliteTables,
    recordId: string,
    client: SQliteClient
) => Ref;

export type NewRecord<T extends BaseSqliteRecord> = Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export enum SqliteTable {
    settings = 'settings',
    modelConnection = 'modelConnection',
    agentGraph = 'agentGraph',
    messageThread = 'messageThread',
    metric = 'metric',
    message = 'message',
    toolDefinition = 'toolDefinition',
    document = 'document',
    chatSnapshot = 'chatSnapshot',
}

export interface SqliteTables {
    [SqliteTable.settings]: ReferencedSettingsTable;
    [SqliteTable.modelConnection]: ReferencedModelConnectionTable;
    [SqliteTable.agentGraph]: ReferencedAgentGraphTable;
    [SqliteTable.messageThread]: ReferencedMessageThreadTable;
    [SqliteTable.metric]: ReferencedMetricTable;
    [SqliteTable.message]: ReferencedMessageTable;
    [SqliteTable.toolDefinition]: ReferencedToolDefinitionTable;
    [SqliteTable.document]: ReferencedDocumentTable;
    [SqliteTable.chatSnapshot]: ReferencedChatSnapshotTable;
}

export interface SqliteTableRecordType {
    [SqliteTable.settings]: SettingsType;
    [SqliteTable.modelConnection]: ModelConnectionType;
    [SqliteTable.agentGraph]: AgentGraphType;
    [SqliteTable.messageThread]: MessageThreadType;
    [SqliteTable.metric]: MetricType;
    [SqliteTable.message]: MessageType;
    [SqliteTable.toolDefinition]: ToolDefinitionType;
    [SqliteTable.document]: DocumentType;
    [SqliteTable.chatSnapshot]: ChatSnapshotType;
}
