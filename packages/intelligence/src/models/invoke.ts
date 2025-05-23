import { InvokeAnthropic } from './model-apis/anthropic/handler';
import { InvokeStatic } from './model-apis/static/handler';
import type { InvokeModelInternalResult, InvokeModelParams } from './types';

export async function invokeLLM(params: InvokeModelParams): Promise<InvokeModelInternalResult> {
    const log = params.log.child('invokeRouter');
    log.log(`Using ${params.modelConnection.id} to invoke ${params.thread.id}`);

    const connection = await params.modelConnection.get();

    // Invoke LLM
    try {
        if (connection.providerId.toLowerCase() === 'anthropic') {
            log.log('Invoking Anthropic API handler');
            const anthropicResult = await InvokeAnthropic({
                log,
                thread: params.thread,
                modelId: connection.modelId,
                //@ts-ignore
                apiKey: connection.connectionData.apiKey,
            });
            log.log('Anthropic API handler invoke completed', anthropicResult);
            return anthropicResult;
        }
        if (connection.providerId.toLowerCase() === 'static') {
            log.log('Invoking Static API handler');
            const staticResult = await InvokeStatic({
                log,
                thread: params.thread,
                //@ts-ignore
                response: connection.connectionData.response,
            });
            log.log('Static API handler invoke completed', staticResult);
            return staticResult;
        }

        log.warn(`Unknown AI access format: ${connection.providerId}`);
        throw new Error(`Unknown AI access format: ${connection.providerId}`);
    } catch (error) {
        log.error('Error invoking LLM', { error });
        throw error;
    }
}
