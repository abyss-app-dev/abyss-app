import type { AgentGraphExecutionReferencePartial } from '@abyss/records';
import { SqliteTable } from '@abyss/records';
import { useDatabaseRecord } from '@abyss/state-store';
import { ChatMessageExecutionReference } from '@abyss/ui-components';

interface AgentGraphExecutionReferenceProps {
    message: AgentGraphExecutionReferencePartial;
    navigate: (path: string) => void;
}

export function AgentGraphExecutionReference({ message, navigate }: AgentGraphExecutionReferenceProps) {
    const execution = useDatabaseRecord(SqliteTable.agentGraphExecution, message.payloadData.agentGraphExecutionId);
    const agentGraph = useDatabaseRecord(SqliteTable.agentGraph, execution.data?.agentGraphId);

    return (
        <ChatMessageExecutionReference
            status={execution.data?.status ?? 'notStarted'}
            agentName={agentGraph.data?.name ?? 'Agent'}
            onBodyClick={() => navigate(`/agents/id/${agentGraph.data?.id}`)}
            onLogsClick={() => navigate(`/logs/id/${execution.data?.logId}`)}
        />
    );
}
