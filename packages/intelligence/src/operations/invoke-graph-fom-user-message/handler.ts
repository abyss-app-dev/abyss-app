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

    // Execute
    await thread.withBlock(agentGraph.id, async () => {
        const execution = new StateMachineRuntime({
            logStream,
            definition: graphDefinition,
            database: agentGraph.client,
        });

        await execution.signal(onThreadMessageNode.id, {
            thread: thread,
            onThreadMessage: randomId(),
        });
    });

    return { log: logStream };
}
