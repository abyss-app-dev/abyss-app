import type { ReadonlyNotebookCellsPartial } from '@abyss/records';
import { ChatMessageSystemText } from '@abyss/ui-components';

interface ReadonlyNotebookCellsSectionProps {
    message: ReadonlyNotebookCellsPartial;
    navigate: (path: string) => void;
}

export function ReadonlyNotebookCellsSection({ message }: ReadonlyNotebookCellsSectionProps) {
    return <ChatMessageSystemText text={`Added context from notebook cells: ${message.payloadData.cellIds.join(', ')}`} />;
}
