import { type NotebookPageCellProperties, SqliteTable } from '@abyss/records';
import { useDatabaseTableQuery } from '@abyss/state-store';
import { NotebookText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Database } from '../../main';

export function useNotebookMain() {
    const cells = useDatabaseTableQuery(SqliteTable.notebookCell, async cells => cells.getRootCells());
    const navigate = useNavigate();

    const handleCreateCell = async () => {
        const newCell = await Database.tables.notebookCell.create({
            type: 'page',
            parentCellId: 'root',
            orderIndex: 0,
            propertyData: { title: 'New Notebook' },
        });
        navigate(`/notebooks/id/${newCell.id}`);
    };

    const handleDeleteCell = (cellId: string) => {
        Database.tables.notebookCell.ref(cellId).delete();
    };

    const sidebarItems = (cells.data || [])
        .filter(entry => entry.type === 'page')
        .map(entry => {
            const cellData: NotebookPageCellProperties = entry.propertyData as NotebookPageCellProperties;
            return {
                id: entry.id,
                title: cellData.title || 'New Notebook',
                icon: NotebookText,
                url: `/notebooks/id/${entry.id}`,
                onCancel: () => handleDeleteCell(entry.id),
            };
        });

    return {
        sidebarItems,
        handleCreateCell,
        handleDeleteCell,
    };
}
