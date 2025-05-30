import { useNavigate } from 'react-router-dom';

export function useNotebookCreate() {
    const navigate = useNavigate();
    const breadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Chats', onClick: () => navigate('/chats') },
        { name: 'New Conversation', onClick: () => navigate('/chats/create') },
    ];

    return {
        breadcrumbs,
    };
}
