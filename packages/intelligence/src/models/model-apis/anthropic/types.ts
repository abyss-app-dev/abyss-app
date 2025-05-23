import type { LogStream } from '@abyss/records';
import type { MessageThreadRenderedTurn } from '@abyss/records/dist/records/chat-snapshot/chat-snapshot.type';

export interface InvokeAnthropicProps {
    log: LogStream;
    turns: MessageThreadRenderedTurn[];
    modelId: string;
    apiKey: string;
}

export interface AnthropicResponse {
    content: Array<{
        text: string;
    }>;
    usage?: {
        input_tokens: number;
        output_tokens: number;
    };
}

export interface AnthropicMessage {
    role: 'user' | 'assistant';
    content: AnthropicContent[];
}

export type AnthropicContent = AnthropicTextContent;

export interface AnthropicTextContent {
    type: 'text';
    text?: string;
}

export interface ConversationTurn {
    role: 'user' | 'assistant';
    content: AnthropicContent[];
}
