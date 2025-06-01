import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { useNavigate } from 'react-router-dom';
import { Database } from '../../main';

export function useAgentsPage() {
    const agents = useDatabaseTable(SqliteTable.agentGraph);
    const navigate = useNavigate();

    const onOpenRecordStr = (record: string) => {
        if (record.startsWith('logStream::')) {
            navigate(`/logs/id/${record}`);
        } else if (record.startsWith('agentGraph::')) {
            navigate(`/agents/id/${record}`);
        }
    };

    const handleCreateAgent = async () => {
        const agent = await Database.tables.agentGraph.create({ name: 'New Agent', serialzedData: [] });
        navigate(`/agents/id/${agent.id}`);
    };

    return {
        agents,
        handleCreateAgent,
        navigate,
        onOpenRecordStr,
    };
}
