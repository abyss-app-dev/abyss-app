import type { NotebookToolCellProperties } from '@abyss/records';
import { SqliteTable } from '@abyss/records';
import { useDatabaseRecord } from '@abyss/state-store';
import { NodeViewWrapper } from '@tiptap/react';
import { WrenchIcon } from 'lucide-react';

interface ToolComponentProps {
    node: any;
    updateAttributes: (attrs: any) => void;
    deleteNode: () => void;
}

export const ToolComponent: React.FC<ToolComponentProps> = ({ node }) => {
    const db = JSON.parse(node.attrs.db);
    const toolData = db.propertyData as NotebookToolCellProperties | undefined;
    const tool = useDatabaseRecord(SqliteTable.toolDefinition, toolData?.toolId || '');

    return (
        <NodeViewWrapper className="tool-node">
            <div className="inline-flex items-center px-2 bg-primary-300 hover:bg-primary-100 border border-primary-500 rounded cursor-pointer">
                <WrenchIcon className="w-4 h-4 mr-2" />
                <span className="text-primary-800" style={{ fontSize: '12px' }}>
                    {tool.data?.name || `Tool ${toolData?.toolId || 'Unknown'}`}
                </span>
            </div>
        </NodeViewWrapper>
    );
};
