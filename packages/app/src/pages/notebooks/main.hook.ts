import { NotebookText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDatabase } from '@/state/database-access-utils';
import { getIconForSourceType } from '../../library/references';
import { Database } from '../../main';

export function useNotebookMain() {
    const cells = useDatabase.notebookCell.tableQuery(async cells => cells.getRootCells());
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect to create page if on the base chats path
    if (location.pathname === '/notebooks') {
        setTimeout(() => navigate('/notebooks/create'));
    }

    const handleCreateCell = () => {
        navigate('/notebooks/create');
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
