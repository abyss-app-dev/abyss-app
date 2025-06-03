import type { NotebookAgentCellProperties } from '@abyss/records';
import { SqliteTable } from '@abyss/records';
import { useDatabaseRecord } from '@abyss/state-store';
import { NodeViewWrapper } from '@tiptap/react';
import { Bot } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AgentComponentProps {
    node: any;
    updateAttributes: (attrs: any) => void;
    deleteNode: () => void;
    editor: any;
    getPos: () => number;
}

export const AgentComponent: React.FC<AgentComponentProps> = ({ node, updateAttributes, editor, getPos }) => {
    const db = JSON.parse(node.attrs.db);
    const agentData = db.propertyData as NotebookAgentCellProperties | undefined;
    const agent = useDatabaseRecord(SqliteTable.agentGraph, agentData?.agentId || '');
    const contentRef = useRef<HTMLDivElement>(null);
    const isInitializing = useRef(true);

    // Initialize content from database
    useEffect(() => {
        if (contentRef.current && agentData?.content && isInitializing.current) {
            contentRef.current.textContent = agentData.content;
            isInitializing.current = false;
        }
    }, [agentData?.content]);

    // Handle content updates
    const handleContentChange = () => {
        if (contentRef.current && !isInitializing.current) {
            const content = contentRef.current.textContent || '';

            // Update the database properties
            const updatedDb = {
                ...db,
                propertyData: {
                    ...db.propertyData,
                    content: content,
                },
            };

            updateAttributes({ db: JSON.stringify(updatedDb) });

            // Also update the TipTap node content
            const pos = getPos();
            const nodeSize = node.nodeSize;

            editor.commands.command(({ tr }: any) => {
                // Clear existing content
                if (nodeSize > 2) {
                    // Has content
                    tr.delete(pos + 1, pos + nodeSize - 1);
                }

                // Insert new content if there is any
                if (content) {
                    tr.insertText(content, pos + 1);
                }

                return true;
            });
        }
    };

    return (
        <NodeViewWrapper className="agent-node">
            <div className="agent-cell">
                <div className="agent-header">
                    <Bot className="w-4 h-4" />
                    <span className="agent-name">{agent.data?.name || `Agent ${agentData?.agentId || 'Unknown'}`}</span>
                </div>
                <div className="agent-content">
                    <div
                        ref={contentRef}
                        className="agent-input"
                        contentEditable
                        suppressContentEditableWarning={true}
                        onInput={handleContentChange}
                        onBlur={handleContentChange}
                        data-placeholder="Type your input for the agent..."
                    />
                </div>
            </div>
        </NodeViewWrapper>
    );
};
