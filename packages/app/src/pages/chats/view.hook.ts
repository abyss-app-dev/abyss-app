import { SqliteTable } from '@abyss/records';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Database } from '@/main';
import { useDatabase } from '@/state/database-access-utils';
import { chatWithAiModel } from '../../state/operations';

export function useChatView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const thread = useDatabase.messageThread.record(id);
    const turns = useDatabase.messageThread.recordQuery(id || '', ref => ref.getTurns());

    const [message, setMessage] = useState('');

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
        }
    };

    const navigateToHome = () => {
        navigate('/');
    };

    const navigateToChats = () => {
        navigate('/chats');
    };

    const navigateToParticipant = () => {
        if (thread.data?.participantId) {
            if (thread.data.participantId.startsWith('modelConnection::')) {
                navigate(`/database/id/modelConnection/record/${thread.data.participantId}`);
            } else if (thread.data.participantId.startsWith('agentGraph::')) {
                navigate(`/agents/id/${thread.data.participantId}`);
            }
        }
    };

    const handleSendMessage = () => {
        if (message.trim() === '') {
            return;
        }
        setMessage('');
        if (thread.data?.participantId?.startsWith('modelConnection::')) {
            chatWithAiModel(message, Database.tables[SqliteTable.messageThread].ref(thread.data.id));
        } else {
            // chatWithAgentGraph(message, thread.data?.participantId || '', thread.data?.id || '');
        }
    };

    const breadcrumbs = [
        { name: 'Home', onClick: navigateToHome },
        { name: 'Chats', onClick: navigateToChats },
        { name: thread.data?.participantId || 'Chat', onClick: () => {} },
    ];

    return {
        turns,
        thread,
        message,
        setMessage,
        handleKeyPress,
        navigateToParticipant,
        breadcrumbs,
        navigateToHome,
        navigateToChats,
        handleSendMessage,
    };
}
