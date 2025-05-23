import type { RemoveToolDefinitionPartial } from '@abyss/records';
import { ChatMessageSystemText } from '@abyss/ui-components';
import { getActionItems } from './_actionItems';

interface RemovedToolDefinitionProps {
    message: RemoveToolDefinitionPartial;
    navigate: (path: string) => void;
}

export function RemovedToolDefinition({ message, navigate }: RemovedToolDefinitionProps) {
    return (
        <ChatMessageSystemText
            text={`Removed access to tools: ${message.payloadData.tools.join(', ')}`}
            actionItems={getActionItems(message.referencedData, navigate)}
        />
    );
} 