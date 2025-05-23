import type { ToolCallRequestPartial, ToolCallResponsePartial } from '@abyss/records';
import { ChatToolCall } from '@abyss/ui-components';
import { getActionItems } from './_actionItems';

interface ToolCallRequestSectionProps {
    request: ToolCallRequestPartial;
    response?: ToolCallResponsePartial;
    navigate: (path: string) => void;
}

export function ToolCallRequestSection({ request, response, navigate }: ToolCallRequestSectionProps) {
    return (
        <ChatToolCall
            toolName={request.payloadData.toolId}
            status={response?.payloadData.status ?? 'notStarted'}
            inputData={request.payloadData.parameters}
            outputText={response?.payloadData.result || ''}
            actionItems={getActionItems(
                {
                    ...request.referencedData,
                    ...response?.referencedData,
                },
                navigate
            )}
        />
    );
}
