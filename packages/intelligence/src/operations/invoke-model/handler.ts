import { ReferencedMessageRecord } from '@abyss/records';
import { invokeModelAgainstThread } from '../../models/handler';
import { Logger } from '../../utils/logs';
import type { InvokeModelParams } from './types';

/**
 * Given an existing thread, and a model connection, invoke the model against the thread.
 * This will result in a new set of messages from the model response being added to the thread.
 * While progressing, we block the thread to prevent other messages from being added to it.
 */

export async function invokeModelHandler(options: InvokeModelParams) {
    const { modelConnection, thread } = options;

    const log = Logger.base.child('invokeModel');
    log.debug(`Invoking model ${modelConnection.id} against thread ${thread.id}`);

    // Load data
    const modelRecord = await modelConnection.get();
    const threadRecord = await thread.get();

    // Block the thread to prevent other messages from being added to it while we invoke the model
    thread.withBlock(modelConnection.id, async () => {
        // const response = await invokeModelAgainstThread(modelConnection, threadData);
    });
}
