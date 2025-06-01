import { type NotebookPageCellProperties, SqliteTable } from '@abyss/records';
import { useDatabaseRecord } from '@abyss/state-store';
import { PageNotebook } from '@abyss/ui-components';
import { NotebookText } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Database } from '@/main';
import { Notebook } from './notebook/notebook';

export function NotebookPage() {
    const { id } = useParams();

    const cell = useDatabaseRecord(SqliteTable.notebookCell, id as string);
    const cellParent = useDatabaseRecord(SqliteTable.notebookCell, cell.data?.parentCellId as string);
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
