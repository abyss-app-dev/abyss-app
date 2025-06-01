import type { NotebookPageCellProperties } from '@abyss/records';
import { SqliteTable } from '@abyss/records';
import { useDatabaseRecord } from '@abyss/state-store';
import { useNavigate } from 'react-router';

export function PageMention({ pageId }: { pageId: string }) {
    const page = useDatabaseRecord(SqliteTable.notebookCell, pageId);
    const navigate = useNavigate();
    const content = page.data?.propertyData as NotebookPageCellProperties | undefined;
    console.log(content, pageId, page);
    return <span onClick={() => navigate(`/notebooks/id/${pageId}`)}>{content?.title}</span>;
}
