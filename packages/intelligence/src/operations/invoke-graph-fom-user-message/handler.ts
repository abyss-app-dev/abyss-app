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
    const onThreadMessageNode = graphDefinition.nodes.find(node => node.id === 'onThreadMessage');
    if (!onThreadMessageNode) {
        return;
    }

    // Create a log stream
    const logStream = agentGraph.client.createLogStreamArtifact();

    // Execute
    const execution = new StateMachineRuntime({
        logStream,
        definition: graphDefinition,
        database: agentGraph.client,
    });

    await execution.signal(onThreadMessageNode.id, {
        thread: thread,
        onThreadMessage: randomId(),
    });

    return { log: logStream };
}
