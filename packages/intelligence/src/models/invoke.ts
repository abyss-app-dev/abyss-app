import { SqliteTable } from '@abyss/records';
import { InvokeAnthropic } from './model-apis/anthropic/handler';
import { InvokeStatic } from './model-apis/static/handler';
import { buildConversationPrompt } from './prompts/buildConversationPrompt';
import type { InvokeModelParams } from './types';

export async function invokeLLM(params: InvokeModelParams) {
    const log = params.log.child('invokeRouter');
    log.log(`Using ${params.modelConnection.id} to invoke ${params.thread.id}`);

    const connection = await params.modelConnection.get();
    const standardTurns = await buildConversationPrompt(params.thread);
    const snapshot = await params.thread.client.tables[SqliteTable.chatSnapshot].create({ messagesData: standardTurns });
    const snapshotRef = params.thread.client.tables[SqliteTable.chatSnapshot].ref(snapshot.id);

    // Invoke LLM
    try {
        if (connection.providerId.toLowerCase() === 'anthropic') {
            log.log('Invoking Anthropic API handler');
            const anthropicResult = await InvokeAnthropic({
                log,
                turns: standardTurns,
                modelId: connection.modelId,
                //@ts-ignore
                apiKey: connection.connectionData.apiKey,
            });
            log.log('Anthropic API handler invoke completed', anthropicResult);
            return { ...anthropicResult, snapshot: snapshotRef };
        }
        if (connection.providerId.toLowerCase() === 'static') {
            log.log('Invoking Static API handler');
            const staticResult = await InvokeStatic({
                log,
                turns: standardTurns,
                //@ts-ignore
                response: connection.connectionData.response,
            });
            log.log('Static API handler invoke completed', staticResult);
            return { ...staticResult, snapshot: snapshotRef };
        }

        log.warn(`Unknown AI access format: ${connection.providerId}`);
        throw new Error(`Unknown AI access format: ${connection.providerId}`);
    } catch (error) {
        log.error('Error invoking LLM', { error });
        throw error;
    }
}
