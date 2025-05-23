import type { TextPartial } from '@abyss/records';
import { ChatMessageText } from '@abyss/ui-components';
import { getActionItems } from './_actionItems';

interface UserMessageSectionProps {
    message: TextPartial;
    navigate: (path: string) => void;
}

export function UserMessageSection({ message, navigate }: UserMessageSectionProps) {
    return (
        <ChatMessageText 
            text={message.payloadData.content} 
            actionItems={getActionItems(message.referencedData, navigate)} 
        />
    );
} 