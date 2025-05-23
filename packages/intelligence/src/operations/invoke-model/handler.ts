import type { MessageType, NewRecord } from '@abyss/records';
import { invokeModelAgainstThread } from '../../models/handler';
import type { InvokeModelParams } from './types';

/**
 * Given an existing thread, and a model connection, invoke the model against the thread.
 * This will result in a new set of messages from the model response being added to the thread.
 * While progressing, we block the thread to prevent other messages from being added to it.
 */

export async function invokeModelHandler(options: InvokeModelParams) {
    const { modelConnection, thread } = options;

    const log = thread.client.createLogStreamArtifact();
    log.log(`Invoking model ${modelConnection.id} against thread ${thread.id}`);

    // Block the thread to prevent other messages from being added to it while we invoke the model
    await thread.withBlock(modelConnection.id, async () => {
        const response = await invokeModelAgainstThread({ log, modelConnection, thread });
        log.log(`Model ${modelConnection.id} invoked against thread ${thread.id}`);

        // Add the response to the thread
        const newMessages: NewRecord<MessageType>[] = [];
        for (const block of response.parsed) {
            if (block.type === 'text') {
                newMessages.push({
                    type: 'text',
                    senderId: modelConnection.id,
                    payloadData: {
                        content: block.content,
                    },
                });
            } else if (block.type === 'tool') {
                log.log(`Output in the form of a tool call, but we don't support that in the direct invocation of a model.`, block.content);
                newMessages.push({
                    type: 'text',
                    senderId: modelConnection.id,
                    payloadData: {
                        content: `TOOL CALL REJECTED: ${JSON.stringify(block.content)}`,
                    },
                });
            }
        }

        log.log(`Adding ${newMessages.length} new messages to thread ${thread.id}`);
        const createdMessages = await thread.addMessagePartials(...newMessages);
        createdMessages.at(-1)?.update({
            referencedData: {
                log: log.id,
                snapshot: response.snapshot.id,
            },
        });
    });

    return { log };
}
