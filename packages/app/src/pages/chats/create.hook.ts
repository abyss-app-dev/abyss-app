import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from '../../main';
import { chatWithAgentGraph, chatWithAiModel } from '../../state/operations';

export function useChatCreate() {
    const navigate = useNavigate();
    const allModels = useDatabaseTable(SqliteTable.modelConnection);
    const allAgents = useDatabaseTable(SqliteTable.agentGraph);

    const [chatType, setChatType] = useState<'model' | 'agent'>('model');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (allModels.data?.length && chatType === 'model') {
            setSelectedModel(allModels.data[0].id);
        }
        if (allAgents.data?.length && chatType === 'agent') {
            setSelectedAgent(allAgents.data[0].id);
        }
    }, [allModels.data, allAgents.data, chatType]);

    const handleSubmit = async () => {
        const sourceId = chatType === 'model' ? selectedModel : selectedAgent;
        if (!sourceId || !message) {
            return;
        }
        const chatRecord = await Database.tables.messageThread.new(sourceId);
        const chatRef = Database.tables[SqliteTable.messageThread].ref(chatRecord.id);
        if (chatType === 'model') {
            chatWithAiModel(message, chatRef);
        } else {
            chatWithAgentGraph(message, chatRef);
        }
        navigate(`/chats/id/${chatRecord.id}`);
    };

    const breadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Chats', onClick: () => navigate('/chats') },
        { name: 'New Conversation', onClick: () => navigate('/chats/create') },
    ];

    const modelOptions =
        allModels.data?.map(model => ({
            value: model.id,
            label: model.name,
        })) || [];

    const agentOptions =
        allAgents.data?.map(agent => ({
            value: agent.id,
            label: agent.name,
        })) || [];

    const isSubmitDisabled = chatType === 'model' ? !selectedModel : !selectedAgent;

    return {
        chatType,
        setChatType,
        selectedModel,
        setSelectedModel,
        selectedAgent,
        setSelectedAgent,
        message,
        setMessage,
        handleSubmit,
        breadcrumbs,
        modelOptions,
        agentOptions,
        isSubmitDisabled,
    };
}
