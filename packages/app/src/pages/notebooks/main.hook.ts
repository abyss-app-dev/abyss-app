import { NotebookText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/state/database-access-utils';
import { Database } from '../../main';

export function useNotebookMain() {
    const cells = useDatabase.notebookCell.tableQuery(async cells => cells.getRootCells());
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

    const sidebarItems = (cells.data || []).map(entry => {
        return {
            id: entry.id,
            title: entry.type,
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
