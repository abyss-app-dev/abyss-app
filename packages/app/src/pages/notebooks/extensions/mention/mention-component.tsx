import type { NotebookPageCellProperties } from '@abyss/records';
import { useNavigate } from 'react-router';
import { useDatabase } from '@/state/database-access-utils';

export function PageMention({ pageId }: { pageId: string }) {
    const page = useDatabase.notebookCell.record(pageId);
    const navigate = useNavigate();
    const content = page.data?.propertyData as NotebookPageCellProperties | undefined;
    console.log(content, pageId, page);
    return <span onClick={() => navigate(`/notebooks/id/${pageId}`)}>{content?.title}</span>;
}
