import { Operations } from '@abyss/intelligence';
import { type ReferencedMessageThreadRecord, SqliteTable } from '@abyss/records';
import { Database } from '../main';

export async function chatWithAiModel(humanMessage: string, threadRef: ReferencedMessageThreadRecord) {
    // Add the user message to the thread
    await threadRef.addMessagePartials({
        type: 'text',
        senderId: 'user',
        payloadData: {
            content: humanMessage,
        },
    });

    // Get the model connection from the thread
    const thread = await threadRef.get();
    const modelConnectionId = thread.participantId;
    if (!modelConnectionId) {
        throw new Error('Model connection not found');
    }
    const modelConnectionRef = Database.tables[SqliteTable.modelConnection].ref(modelConnectionId);

    // Invoke the model
    return Operations.invokeModel({ modelConnection: modelConnectionRef, thread: threadRef });
}

export async function chatWithAgentGraph(humanMessage: string, threadRef: ReferencedMessageThreadRecord) {
    // Add the user message to the thread
    await threadRef.addMessagePartials({
        type: 'text',
        senderId: 'user',
        payloadData: {
            content: humanMessage,
        },
    });

    // Get the agent graph from the thread
    const thread = await threadRef.get();
    const agentGraphId = thread.participantId;
    if (!agentGraphId) {
        throw new Error('Agent graph not found');
    }
    const agentGraphRef = Database.tables[SqliteTable.agentGraph].ref(agentGraphId);

    // Invoke the agent graph
    return Operations.invokeGraphFromUserMessage({ agentGraph: agentGraphRef, thread: threadRef });
}
