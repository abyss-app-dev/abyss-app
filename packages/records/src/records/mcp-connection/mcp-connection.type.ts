import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';

export interface McpConnectionType extends BaseSqliteRecord {
    name: string;
    configData: LocalMcpConnectionConfig;
}

export interface LocalMcpConnectionConfig {
    type: 'stdio';
    command: string;
    args?: string[];
    env?: Record<string, string>;
}
