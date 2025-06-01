import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { useLocation, useNavigate } from 'react-router-dom';
import { getIconForSourceType } from '../../library/references';
import { Database } from '../../main';

export function useChatMain() {
    const threads = useDatabaseTable(SqliteTable.messageThread);
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect to create page if on the base chats path
    if (location.pathname === '/chats') {
        setTimeout(() => navigate('/chats/create'));
    }

    const handleCreateChat = () => {
        navigate('/chats/create');
    };

    const handleDeleteChat = (chatId: string) => {
        Database.tables.messageThread.ref(chatId).delete();
    };

    const sidebarItems = (threads.data || []).map(entry => {
        return {
            id: entry.id,
            title: entry.name,
            icon: getIconForSourceType(entry.participantId || ''),
            url: `/chats/id/${entry.id}`,
            isInProgress: !!entry.blockerId,
            onCancel: () => handleDeleteChat(entry.id),
        };
    });

    return {
        sidebarItems,
        handleCreateChat,
        handleDeleteChat,
    };
}
