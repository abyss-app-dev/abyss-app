import type { ReadonlyDocumentPartial } from '@abyss/records';
import { ChatMessageSystemText } from '@abyss/ui-components';

interface ReadonlyDocumentSectionProps {
    message: ReadonlyDocumentPartial;
    navigate: (path: string) => void;
}

export function ReadonlyDocumentSection({ message }: ReadonlyDocumentSectionProps) {
    return <ChatMessageSystemText text={`Added readonly references to documents: ${message.payloadData.documentIds.join(', ')}`} />;
}
