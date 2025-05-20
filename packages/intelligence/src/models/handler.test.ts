import { buildTestDB, ReferencedMessageThreadRecord, ReferencedModelConnectionRecord } from '@abyss/records';
import { expect, test } from 'vitest';
import { invokeModelAgainstThread } from './handler';

test('invokeModelAgainstThread', async () => {
    const db = await buildTestDB();
    const log = db.createLogStreamArtifact('test');

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
        providerId: 'test',
        modelId: 'static',
        accessFormat: 'static',
        connectionData: {
            response: 'My cached response! wow!',
        },
    });
    const modelConnectionRef = new ReferencedModelConnectionRecord(modelConnection.id, db);

    const result = await invokeModelAgainstThread({
        log,
        thread: threadRef,
        modelConnection: modelConnectionRef,
    });
    expect(result.parsed.length).toBe(1);
    expect(result.parsed[0].type).toBe('text');
    expect(result.parsed[0].content).toBe('My cached response! wow!');
});
