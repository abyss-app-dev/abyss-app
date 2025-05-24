import type { NewRecord } from '@abyss/records';
import { Database } from '@/main';
import { LabelChatTool } from './tools/tool.labelchat';

export async function overwrite(record: NewRecord<any>) {
    if (!record.id) {
        throw new Error('Record ID is required');
    }
    const tableId = record.id.split('::')[0];
    await Database.tables[tableId as keyof typeof Database.tables].create(record as unknown as any);
}

export async function defineDefaults() {
    await overwrite(LabelChatTool);
}
