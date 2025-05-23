import { ChatMessageText } from '@abyss/ui-components';
import { getActionItems } from './_actionItems';
import type { NavigateFunction, TextPartial } from './types';

interface AiMessageTextSectionProps {
    message: TextPartial;
    navigate: NavigateFunction;
}

export function AiMessageTextSection({ message, navigate }: AiMessageTextSectionProps) {
    if (message.payloadData.content.length === 0) {
        return (
            <ChatMessageText text={'empty string'} className="opacity-40" actionItems={getActionItems(message.referencedData, navigate)} />
        );
    }
    return <ChatMessageText text={message.payloadData.content} actionItems={getActionItems(message.referencedData, navigate)} />;
}
