import type { AgentGraphExecutionReferencePartial } from '@abyss/records';
import { ChatMessageExecutionReference } from '@abyss/ui-components';
import { useDatabase } from '@/state/database-access-utils';

interface AgentGraphExecutionReferenceProps {
    message: AgentGraphExecutionReferencePartial;
    navigate: (path: string) => void;
}

export function AgentGraphExecutionReference({ message, navigate }: AgentGraphExecutionReferenceProps) {
    const execution = useDatabase.agentGraphExecution.record(message.payloadData.agentGraphExecutionId);
    const agentGraph = useDatabase.agentGraph.record(execution.data?.agentGraphId);

    return <ChatMessageExecutionReference 
        status={execution.data?.status ?? 'notStarted'} 
        agentName={agentGraph.data?.name ?? 'Agent'} 
        onBodyClick={() => navigate(`/agents/id/${agentGraph.data?.id}`)} 
        onLogsClick={() => navigate(`/logs/id/${execution.data?.logId}`)} 
    />;
}
