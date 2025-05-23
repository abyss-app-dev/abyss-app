import { Bot, Check, Loader2, TextIcon, X } from 'lucide-react';
import React from 'react';
import { Button } from '../../inputs/Button';
import type { ActionItem } from '../ChatMessageText';

export interface ChatMessageExecutionReferenceProps {
    status: 'notStarted' | 'inProgress' | 'success' | 'failed';
    agentName: string;
    onBodyClick?: () => void;
    onLogsClick?: () => void;
    className?: string;
}

export const ChatMessageExecutionReference: React.FC<ChatMessageExecutionReferenceProps> = ({
    status,
    agentName,
    onBodyClick,
    onLogsClick,
    className = '',
}) => {
    const isRunning = status === 'inProgress';
    const isError = status === 'failed';
    const isComplete = status === 'success';

    const getStatusIcon = () => {
        if (isRunning) return <Loader2 className="w-4 h-4 animate-spin text-primary-500" />;
        if (isError) return <X className="w-4 h-4 text-red-500" />;
        if (isComplete) return <Check className="w-4 h-4 text-green-500" />;
        return null;
    };

    const actionItems: ActionItem[] = [];
    if (onLogsClick) {
        actionItems.push({
            icon: TextIcon,
            tooltip: 'View logs',
            onClick: onLogsClick,
        });
    }

    return (
        <div className={`relative w-full rounded text-xs ${className}`}>
            <button
                type="button"
                className="flex items-center gap-2 py-2 px-2 text-text-500 bg-background-200 rounded-t cursor-pointer hover:bg-background-200 w-full text-left"
                onClick={onBodyClick}
            >
                {getStatusIcon()}
                <Bot className="w-4 h-4 text-text-500" />
                <span className="capitalize flex-grow">{agentName}</span>
            </button>

            {actionItems.length > 0 && (
                <div className="w-full flex justify-end gap-1 z-10 pointer-events-auto">
                    {actionItems.map((action, index) => (
                        <Button
                            key={index}
                            variant="secondary"
                            icon={action.icon}
                            tooltip={action.tooltip}
                            onClick={action.onClick}
                            className="p-1 h-5 w-5 min-w-0 min-h-0 flex items-center justify-center"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
