import { buildTestDB, ReferencedMessageThreadRecord, ReferencedModelConnectionRecord } from '@abyss/records';
import { test } from 'vitest';
import { invokeModelHandler } from './handler';

test('invokeModelAgainstThread', async () => {
    const db = await buildTestDB();

    // Sample thread
    const thread = await db.tables.messageThread.new();
    const threadRef = new ReferencedMessageThreadRecord(thread.id, db);
    await threadRef.addMessagePartials({
        senderId: 'user',
        type: 'text',
        payloadData: {
            content: 'hey there?',
        },
    });
    await threadRef.addMessagePartials({
        senderId: 'assistant',
        type: 'text',
        payloadData: {
            content: 'hey there!',
        },
    });

    // Sample static model connection
    const modelConnection = await db.tables.modelConnection.create({
        name: 'test',
        description: 'test',
        providerId: 'static',
        modelId: 'static',
        connectionData: {
            response: 'My cached response! wow!',
        },
    });
    const modelConnectionRef = new ReferencedModelConnectionRecord(modelConnection.id, db);

    await invokeModelHandler({
        thread: threadRef,
        modelConnection: modelConnectionRef,
    });
});
