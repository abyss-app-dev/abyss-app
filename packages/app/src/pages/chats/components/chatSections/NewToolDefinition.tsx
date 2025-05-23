import type { NewToolDefinitionPartial } from '@abyss/records';
import { ChatMessageSystemText } from '@abyss/ui-components';
import { getActionItems } from './_actionItems';

interface NewToolDefinitionProps {
    message: NewToolDefinitionPartial;
    navigate: (path: string) => void;
}

export function NewToolDefinition({ message, navigate }: NewToolDefinitionProps) {
    return (
        <ChatMessageSystemText
            text={'Added access to tools: ' + message.payloadData.tools.map(t => t.shortName).join(', ')}
            actionItems={getActionItems(message.referencedData, navigate)}
        />
    );
} 