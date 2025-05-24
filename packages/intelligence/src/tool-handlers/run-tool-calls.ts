import { ReferencedMessageRecord } from '@abyss/records';
import { getToolHandler } from './tool-router';
import type { UnprocessedToolCallHandlerParams } from './types';

export async function runUnproccessedToolCalls(options: UnprocessedToolCallHandlerParams) {
    const { callerId, thread, log } = options;
    log.log(`Running unprocessed tool calls for thread ${thread.id}`);

    const unprocessedToolCalls = await thread.getUnprocessedToolCalls();
    const activeToolDefinitions = await thread.getAllActiveToolDefinitions();

    log.log(`Found ${unprocessedToolCalls.length} unprocessed tool calls`);

    for (const toolCall of unprocessedToolCalls) {
        log.log(`Processing tool call ${toolCall.payloadData.toolCallId}`);

        // Create the response object
        const messageRecord = await thread.client.tables.message.create({
            type: 'tool-call-response',
            payloadData: {
                toolCallId: toolCall.payloadData.toolCallId,
                shortName: toolCall.payloadData.shortName,
                status: 'inProgress',
                result: '',
            },
            senderId: options.callerId,
        });
        const messageRecordRef = new ReferencedMessageRecord(messageRecord.id, thread.client);
        await thread.addMessages(messageRecordRef);

        try {
            // Get the handler
            const toolDefinitionRef = activeToolDefinitions.find(t => t.id === toolCall.payloadData.toolId);
            console.log('toolDefinitionRef', { activeToolDefinitions, toolCall });
            if (!toolDefinitionRef) {
                throw new Error(
                    `Tool definition ${toolCall.payloadData.toolId} not found in the current context, it either doesnt exist or was removed.`
                );
            }
            const toolDefinition = await toolDefinitionRef.get();
            const toolHandler = getToolHandler(toolDefinition);

            // Execute the tool
            const result = await toolHandler.execute({
                callerId,
                thread,
                request: toolCall.payloadData,
                log: log.child('handler'),
                database: thread.client,
            });

            // Mark the tool call as processed
            await messageRecordRef.update({
                payloadData: {
                    toolCallId: toolCall.payloadData.toolCallId,
                    shortName: toolCall.payloadData.shortName,
                    status: 'success',
                    result: result.raw,
                },
            });
        } catch (error) {
            await messageRecordRef.update({
                payloadData: {
                    toolCallId: toolCall.payloadData.toolCallId,
                    shortName: toolCall.payloadData.shortName,
                    status: 'failed',
                    result: (error as Error).message,
                },
            });
        }
    }
}
