import type { SystemErrorPartial } from '@abyss/records';
import { ChatMessageSystemError } from '@abyss/ui-components';
import { getActionItems } from './_actionItems';

interface SystemErrorMessageSectionProps {
    message: SystemErrorPartial;
    navigate: (path: string) => void;
}

export function SystemErrorMessageSection({ message, navigate }: SystemErrorMessageSectionProps) {
    const errorText = `${message.payloadData.error}: ${message.payloadData.message}`;

    return (
        <div className="flex flex-col gap-2">
            <ChatMessageSystemError text={errorText} actionItems={getActionItems(message.referencedData, navigate)} />
            {message.payloadData.body && <div className="pl-4 text-sm text-gray-600">{message.payloadData.body}</div>}
        </div>
    );
}
