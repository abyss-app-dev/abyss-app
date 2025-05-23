import { AlignLeft, type LucideIcon, TextIcon } from 'lucide-react';

export interface ActionItem {
    icon: LucideIcon;
    tooltip: string;
    onClick: () => void;
}

export function getActionItems(message: Record<string, string> | undefined, navigate: (path: string) => void): ActionItem[] {
    if (!message) return [];

    const map = {
        log: (value: string) => ({
            icon: TextIcon,
            tooltip: 'Execution logs',
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
        const actionItem = map[key as keyof typeof map]?.(message[key]);
        if (!actionItem) {
            console.warn('Unknown action item key', key);
        } else {
            result.push(actionItem);
        }
    }
    return result;
}
