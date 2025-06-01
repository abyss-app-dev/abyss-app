import { type NotebookPageCellProperties, SqliteTable } from '@abyss/records';
import { PageNotebook } from '@abyss/ui-components';
import { NotebookText } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Database } from '@/main';
import { useDatabase } from '@/state/database-access-utils';
import { Notebook } from './notebook/notebook';

export function NotebookPage() {
    const { id } = useParams();
    const cell = useDatabase.notebookCell.record(id as string);
    const cellParent = useDatabase.notebookCell.record(cell.data?.parentCellId as string);
    const cellData: NotebookPageCellProperties = cell.data?.propertyData as NotebookPageCellProperties;
    const navigate = useNavigate();

    const onChangeNotebookName = useCallback(
        (name: string) => {
            const newCellContent: NotebookPageCellProperties = {
                title: name,
            };
            Database.tables[SqliteTable.notebookCell].ref(id as string).update({
                propertyData: newCellContent,
            });
        },
        [id]
    );

    const lastPage =
        cell.data?.parentCellId && !cellParent.error && cellParent.data?.type === 'page'
            ? {
                  name: (cellParent.data?.propertyData as NotebookPageCellProperties).title || 'Notebooks',
                  onClick: () => navigate(`/notebooks/id/${cellParent.data?.id}`),
              }
            : undefined;

    console.log(lastPage, cell.data?.parentCellId, cellParent);

    return (
        <PageNotebook
            title={cellData?.title || ''}
            icon={<NotebookText className="h-5 w-5" />}
            isEditable
            onTitleChange={onChangeNotebookName}
            lastPage={lastPage}
        >
            <Notebook notebookId={id || ''} />
        </PageNotebook>
    );
}
