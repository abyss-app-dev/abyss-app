import { SqliteTable } from '@abyss/records';
import { ReferencedAgentGraphExecutionRecord } from '@abyss/records/dist/records/agent-graph-execution/agent-graph-execution';
import type { AgentGraphDefinition } from '../../state-machine';
import { StateMachineRuntime } from '../../state-machine';
import { randomId } from '../../utils/ids';
import type { InvokeGraphFromUserMessageParams } from './types';

export async function invokeGraphFromUserMessage(options: InvokeGraphFromUserMessageParams) {
    const { agentGraph, thread } = options;

    // Load the graph
    const graph = await agentGraph.get();
    const graphDefinition: AgentGraphDefinition = graph.serialzedData as AgentGraphDefinition;

    // Find the node, if no node, skip
    const onThreadMessageNode = graphDefinition.nodes.find(node => node.type === 'onThreadMessage');
    if (!onThreadMessageNode) {
        await thread.addMessagePartials({
            type: 'text',
            senderId: 'system',
            payloadData: {
                content:
                    'This agent graph does not have an onThreadMessage node and so did not trigger when a user message was sent, this could be an error',
            },
        });
        return;
    }

    // Create a log stream
    const logStream = agentGraph.client.createLogStreamArtifact();

    // Create an agent graph execution
    const execution = await agentGraph.client.tables[SqliteTable.agentGraphExecution].create({
        agentGraphId: agentGraph.id,
        logId: logStream.id,
        status: 'inProgress',
    });
    const executionRef = new ReferencedAgentGraphExecutionRecord(execution.id, agentGraph.client);
    await thread.addMessagePartials({
        type: 'agent-graph-execution-reference',
        senderId: 'system',
        payloadData: {
            agentGraphExecutionId: execution.id,
        },
    });

    // Execute
    await thread.withBlock(agentGraph.id, async () => {
        const execution = new StateMachineRuntime({
            logStream,
            definition: graphDefinition,
            database: agentGraph.client,
        });

        try {
            await execution.signal(onThreadMessageNode.id, {
                thread: thread,
                onThreadMessage: randomId(),
            });
            await executionRef.update({ status: 'success' });
        } catch (e) {
            await executionRef.update({ status: 'failed' });
            throw e;
        }
    });

    return { log: logStream };
}
