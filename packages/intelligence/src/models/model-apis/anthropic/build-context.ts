import { RichDocument } from '@abyss/records';
import type { MessageThreadRenderedTurn } from '@abyss/records/dist/records/chat-snapshot/chat-snapshot.type';
import type { AnthropicMessage } from './types';

export async function buildAnthropicMessages(turns: MessageThreadRenderedTurn[]): Promise<AnthropicMessage[]> {
    const messages: AnthropicMessage[] = [];

    for (const turn of turns) {
        const isUser = turn.senderId === 'user' || turn.senderId === 'system';
        const lastMessage = messages[messages.length - 1];
        const turnContent = RichDocument.render(turn.messages);

        if (!turnContent) {
            continue;
        }

        if (lastMessage && lastMessage.role === 'user' && isUser) {
            lastMessage.content.push({ type: 'text', text: turnContent });
        } else if (lastMessage && lastMessage.role === 'assistant' && !isUser) {
            lastMessage.content.push({ type: 'text', text: turnContent });
        } else if (isUser) {
            messages.push({
                role: 'user',
                content: [{ type: 'text', text: turnContent || 'continue' }],
            });
        } else {
            messages.push({
                role: 'assistant',
                content: [{ type: 'text', text: turnContent || 'understood' }],
            });
        }
    }

    if (messages.at(-1)?.role === 'assistant') {
        messages.push({
            role: 'user',
            content: [{ type: 'text', text: 'continue' }],
        });
    }

    console.log(turns, messages);

    return messages;
}
