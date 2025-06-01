import type { MessageThreadTurn } from '@abyss/records';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './ChatSectionHeader';
import { AgentGraphExecutionReference } from './chatSections/AgentGraphExecutionReference';
import { AiMessageTextSection } from './chatSections/AiMessageTextSection';
import { NewToolDefinition } from './chatSections/NewToolDefinition';
import { ReadonlyDocumentSection } from './chatSections/ReadonlyDocumentSection';
import { ReadonlyNotebookCellsSection } from './chatSections/ReadonlyNotebookCellsSection';
import { RemovedToolDefinition } from './chatSections/RemovedToolDefinition';
import { SystemErrorMessageSection } from './chatSections/SystemErrorMessageSection';
import { SystemTextMessageSection } from './chatSections/SystemTextMessageSection';
import { ToolCallRequestSection } from './chatSections/ToolCallRequestSection';
import { UserMessageSection } from './chatSections/UserMessageSection';

export function ChatHistoryRenderer({ turns }: { turns: MessageThreadTurn[] | null }) {
    const elements: React.ReactNode[] = [];
    const navigate = useNavigate();
    let lastRenderedTurn = '';

    const findToolResponse = (callId: string) => {
        if (!turns) return undefined;
        for (const turn of turns) {
            for (const message of turn.messages) {
                if (message.type === 'tool-call-response' && message.payloadData.toolCallId === callId) {
                    return message;
                }
            }
        }
        return undefined;
    };

    if (!turns) return null;
    for (let i = 0; i < turns.length; i++) {
        const turn = turns[i];
        const elementsThisTurn: React.ReactNode[] = [];

        if (lastRenderedTurn === turn.senderId || turn.senderId === 'system') {
            // skip header
        } else {
            // Set header for section
            elementsThisTurn.push(
                <SectionHeader key={`header-${i}`} sender={turn.senderId} timestamp={new Date(turn.messages[0].createdAt)} />
            );
            lastRenderedTurn = turn.senderId;
        }

        // Render messages themselves
        for (let j = 0; j < turn.messages.length; j++) {
            const message = turn.messages[j];
            if (turn.senderId.toLowerCase() === 'user') {
                if (message.type === 'text') {
                    elementsThisTurn.push(<UserMessageSection key={`user-${i}-${j}`} message={message} navigate={navigate} />);
                } else {
                    console.error('Unknown user message type', message);
                }
            } else if (turn.senderId.toLowerCase() === 'system') {
                if (message.type === 'text') {
                    elementsThisTurn.push(<SystemTextMessageSection key={`system-${i}-${j}`} message={message} navigate={navigate} />);
                } else if (message.type === 'new-tool-definition') {
                    if (message.payloadData.tools.length !== 0) {
                        elementsThisTurn.push(
                            <NewToolDefinition key={`tool-definition-${i}-${j}`} message={message} navigate={navigate} />
                        );
                    }
                } else if (message.type === 'remove-tool-definition') {
                    if (message.payloadData.tools.length !== 0) {
                        elementsThisTurn.push(
                            <RemovedToolDefinition key={`tool-definition-${i}-${j}`} message={message} navigate={navigate} />
                        );
                    }
                } else if (message.type === 'system-error') {
                    elementsThisTurn.push(
                        <SystemErrorMessageSection key={`system-error-${i}-${j}`} message={message} navigate={navigate} />
                    );
                } else if (message.type === 'tool-call-response') {
                    // no-op
                } else if (message.type === 'readonly-document') {
                    if (message.payloadData.documentIds.length > 0) {
                        elementsThisTurn.push(
                            <ReadonlyDocumentSection key={`readonly-document-${i}-${j}`} message={message} navigate={navigate} />
                        );
                    }
                } else if (message.type === 'readonly-notebook-cells') {
                    if (message.payloadData.cellIds.length > 0) {
                        elementsThisTurn.push(
                            <ReadonlyNotebookCellsSection key={`readonly-notebook-cells-${i}-${j}`} message={message} navigate={navigate} />
                        );
                    }
                } else if (message.type === 'agent-graph-execution-reference') {
                    elementsThisTurn.push(
                        <AgentGraphExecutionReference
                            key={`agent-graph-execution-reference-${i}-${j}`}
                            message={message}
                            navigate={navigate}
                        />
                    );
                } else {
                    console.error('Unknown system message type', message);
                }
            } else if (turn.senderId.startsWith('agentGraph:')) {
                if (message.type === 'text') {
                    elementsThisTurn.push(<AiMessageTextSection key={`agent-${i}-${j}`} message={message} navigate={navigate} />);
                } else if (message.type === 'tool-call-request') {
                    elementsThisTurn.push(
                        <ToolCallRequestSection
                            key={`tool-call-request-${i}-${j}`}
                            request={message}
                            response={findToolResponse(message.payloadData.toolCallId)}
                            navigate={navigate}
                        />
                    );
                } else if (message.type === 'tool-call-response') {
                    // no-op
                } else {
                    console.error('Unknown agent graph message type', message);
                }
            } else if (turn.senderId.startsWith('modelConnection:')) {
                if (message.type === 'text') {
                    elementsThisTurn.push(<AiMessageTextSection key={`model-${i}-${j}`} message={message} navigate={navigate} />);
                } else {
                    console.error('Unknown model connection message type', message);
                }
            } else {
                console.error('Unknown message type sender', turn.senderId, message);
            }
        }

        elements.push(...elementsThisTurn);
    }

    return <div className="flex flex-col gap-2">{elements}</div>;
}
