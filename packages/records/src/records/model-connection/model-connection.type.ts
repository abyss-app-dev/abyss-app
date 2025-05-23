import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';

export interface ModelConnectionType extends BaseSqliteRecord {
    name: string;
    description: string;
    providerId: string;
    modelId: string;
    connectionData: unknown;
}
