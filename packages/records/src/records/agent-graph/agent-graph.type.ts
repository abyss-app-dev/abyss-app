import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';

export interface AgentGraphType extends BaseSqliteRecord {
    name: string;
    serialzedData: unknown;
}
