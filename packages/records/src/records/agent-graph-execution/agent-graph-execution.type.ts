import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';
import type { Status } from '../../utils/shared.type';

export interface AgentGraphExecutionType extends BaseSqliteRecord {
    agentGraphId: string;
    logId: string;
    status: Status;
}
