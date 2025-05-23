import { type ReferencedMessageThreadRecord, RichDocument, RichDocumentTemplate, type ToolCallRequestPartial } from '@abyss/records';
import type { MessageThreadRenderedTurn } from '@abyss/records/dist/records/chat-snapshot/chat-snapshot.type';
import { systemErrorPrompt } from './errors.prompt';
import { toolCallRequestPrompt, toolCallResponsePrompt, toolUseInstructionsPrompt } from './toolCall.prompt';
import { addToolDefinitionPrompt } from './toolDefinition.prompt';

// Turns a thread into a list of turns for consumption by the LLM
export async function buildConversationPrompt(thread: ReferencedMessageThreadRecord): Promise<MessageThreadRenderedTurn[]> {
    // Get all messages
    const db = thread.client;
    const messages = await thread.getAllMessages();

    // Output the prompt
    const turns: MessageThreadRenderedTurn[] = [];

    let currentTurnId = 'user';
    let prompt = new RichDocumentTemplate();
    let hasToolInstructions = false;

    const startNewTurn = (senderId: string) => {
        turns.push({ senderId: currentTurnId, messages: prompt.compile({}).cells });
        prompt = new RichDocumentTemplate();
        currentTurnId = senderId;
    };

    for (const message of messages) {
        // Start new turn if needed
        if (message.senderId !== currentTurnId) {
            startNewTurn(message.senderId);
        }

        // Add text to prompt
        if (message.type === 'text') {
            prompt.addText(message.payloadData.content);
        }

        if (message.type === 'readonly-document') {
            const documents = await db.tables.document.getMany(message.payloadData.documentIds);
            if (documents.length > 0) {
                prompt
                    .addHeader2('Additional Documents')
                    .addText('The following documents might be useful and were added for your reference:');
                for (const document of documents) {
                    const richDocument = new RichDocument(document.documentContentData);
                    const rendered = RichDocument.render(richDocument.cells);
                    prompt.addHeader3(document.name);
                    prompt.addCode(rendered);
                }
            }
        }
        if (message.type === 'new-tool-definition') {
            const toolDefinitions = await db.tables.toolDefinition.getMany(message.payloadData.tools.map(t => t.toolId));
            if (toolDefinitions.length > 0) {
                prompt.addSubDocument(addToolDefinitionPrompt.compile(toolDefinitions));
            }
            if (!hasToolInstructions) {
                prompt.addSubDocument(toolUseInstructionsPrompt.compile({}));
                hasToolInstructions = true;
            }
        }
        if (message.type === 'tool-call-request') {
            prompt.addSubDocument(toolCallRequestPrompt.compile(message));
        }
        if (message.type === 'system-error') {
            prompt.addSubDocument(systemErrorPrompt.compile(message));
        }
        if (message.type === 'tool-call-response') {
            const request = messages.find(
                m => m.type === 'tool-call-request' && m.payloadData.toolCallId === message.payloadData.toolCallId
            );
            if (request) {
                prompt.addSubDocument(
                    toolCallResponsePrompt.compile({
                        request: request as ToolCallRequestPartial,
                        response: message,
                    })
                );
            }
        }
    }

    turns.push({ senderId: currentTurnId, messages: prompt.compile({}).cells });
    return turns;
}
