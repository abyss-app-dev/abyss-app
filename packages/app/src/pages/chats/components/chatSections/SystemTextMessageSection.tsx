import type { TextPartial } from '@abyss/records';
import { ChatMessageSystemText } from '@abyss/ui-components';
import { getActionItems } from './_actionItems';

interface SystemTextMessageSectionProps {
    message: TextPartial;
    navigate: (path: string) => void;
}

export function SystemTextMessageSection({ message, navigate }: SystemTextMessageSectionProps) {
    return <ChatMessageSystemText text={message.payloadData.content} actionItems={getActionItems(message.referencedData, navigate)} />;
}
