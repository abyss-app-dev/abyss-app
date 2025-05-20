import type { ReferencedMessageThreadRecord } from '@abyss/records';
import { buildConversationPrompt } from '../../prompts/buildConversationPrompt';
import type { AnthropicMessage } from './types';

export async function buildAnthropicMessages(thread: ReferencedMessageThreadRecord): Promise<AnthropicMessage[]> {
    const db = thread.client;
    const conversationTurns = await buildConversationPrompt(thread);

    const messages: AnthropicMessage[] = [];

    for (const turn of conversationTurns) {
        const isUser = turn.senderId === 'user' || turn.senderId === 'system';
        const lastMessage = messages[messages.length - 1];

        if (lastMessage && lastMessage.role === 'user' && isUser) {
            const message = await turn.prompt.render(db);
            if (message) {
                lastMessage.content.push({ type: 'text', text: message });
            }
        } else if (lastMessage && lastMessage.role === 'assistant' && !isUser) {
            const message = await turn.prompt.render(db);
            if (message) {
                lastMessage.content.push({ type: 'text', text: message });
            }
        } else if (isUser) {
            const message = await turn.prompt.render(db);
            messages.push({
                role: 'user',
                content: [{ type: 'text', text: message || 'continue' }],
            });
        } else {
            const message = await turn.prompt.render(db);
            messages.push({
                role: 'assistant',
                content: [{ type: 'text', text: message || 'understood' }],
            });
        }
    }

    if (messages.at(-1)?.role === 'assistant') {
        messages.push({
            role: 'user',
            content: [{ type: 'text', text: 'continue' }],
        });
    }

    return messages;
}
