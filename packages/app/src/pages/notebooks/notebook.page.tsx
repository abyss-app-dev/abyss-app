import { type NotebookPageCellProperties, SqliteTable } from '@abyss/records';
import { PageNotebook } from '@abyss/ui-components';
import { NotebookText } from 'lucide-react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Database } from '@/main';
import { useDatabase } from '@/state/database-access-utils';
import { Notebook } from './notebook/notebook';

export function NotebookPage() {
    const { id } = useParams();
    const cell = useDatabase.notebookCell.record(id as string);
    const cellData: NotebookPageCellProperties = cell.data?.propertyData as NotebookPageCellProperties;

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

    return (
        <PageNotebook
            title={cellData?.title || ''}
            icon={<NotebookText className="h-5 w-5" />}
            isEditable
            onTitleChange={onChangeNotebookName}
        >
            <Notebook notebookId={id || ''} />
        </PageNotebook>
    );
}
