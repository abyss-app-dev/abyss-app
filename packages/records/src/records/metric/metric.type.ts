import type { BaseSqliteRecord } from '../../sqlite/sqlite.type';

export interface MetricType extends BaseSqliteRecord {
    name: string;
    dimensionData: Record<string, string>;
    value: number;
}
