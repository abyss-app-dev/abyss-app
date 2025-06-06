import type { InvokeModelInternalResult } from '../../types';
import { buildAnthropicMessages } from './build-context';
import type { AnthropicResponse, InvokeAnthropicProps } from './types';

export async function InvokeAnthropic(props: InvokeAnthropicProps): Promise<InvokeModelInternalResult> {
    const messages = await buildAnthropicMessages(props.turns);
    const modelId = props.modelId;
    const apiKey = props.apiKey;
    const log = props.log.child('anthropic-handler');
    log.log('Invoking Anthropic API', { messages });

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: modelId,
                messages,
                stream: false,
                max_tokens: 9000,
            }),
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        const parsed = JSON.parse(JSON.stringify(responseData)) as AnthropicResponse;
        log.log('Anthropic Raw API response', { response: parsed });

        // Create metrics
        const metrics = {
            inputTokens: parsed.usage?.input_tokens || 0,
            outputTokens: parsed.usage?.output_tokens || 0,
            totalTokens: (parsed.usage?.input_tokens || 0) + (parsed.usage?.output_tokens || 0),
        };
        const responseText = parsed.content[0]?.text || '';
        log.log('Anthropic API returned metrics', { metrics });

        // Return the result
        return {
            inputStructured: messages,
            outputStructured: parsed,
            outputString: responseText,
            metrics: metrics,
        };
    } catch (error) {
        log.error('Error invoking Anthropic API', { error });
        throw error;
    }
}
