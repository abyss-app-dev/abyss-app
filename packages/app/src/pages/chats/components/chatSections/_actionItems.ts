import { AlignLeft, Globe } from 'lucide-react';
import type { ActionItem, ActionItemMap, NavigateFunction } from './types';

export function getActionItems(message: Record<string, string> | undefined, navigate: NavigateFunction): ActionItem[] {
    if (!message) return [];

    const map: ActionItemMap = {
        logStreamId: (value: string) => ({
            icon: Globe,
            tooltip: 'LLM logs',
            onClick: () => {
                navigate(`/logs/id/${value}`);
            },
        }),
        chatSnapshotId: (value: string) => ({
            icon: AlignLeft,
            tooltip: 'Chat Snapshot',
            onClick: () => {
                navigate(`/snapshots/id/${value}`);
            },
        }),
    };

    const result: ActionItem[] = [];

    for (const key of Object.keys(message)) {
        const actionItem = map[key as keyof ActionItemMap]?.(message[key]);
        if (!actionItem) {
            console.error('Unknown action item key', key);
        } else {
            result.push(actionItem);
        }
    }
    return result;
}
