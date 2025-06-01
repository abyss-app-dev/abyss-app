import type { NotebookPageCellProperties } from '@abyss/records';
import { NodeViewWrapper } from '@tiptap/react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/state/database-access-utils';

interface PageComponentProps {
    node: any;
    updateAttributes: (attrs: any) => void;
    deleteNode: () => void;
}

export const PageComponent: React.FC<PageComponentProps> = ({ node }) => {
    const db = JSON.parse(node.attrs.db);
    const page = useDatabase.notebookCell.record(db.id);
    const navigate = useNavigate();
    const pageData = page.data?.propertyData as NotebookPageCellProperties | undefined;

    const handleClick = () => {
        navigate(`/notebooks/id/${db.id}`);
    };

    return (
        <NodeViewWrapper className="page-node">
            <div
                className="inline-flex items-center px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded cursor-pointer"
                onClick={handleClick}
            >
                <span className="text-blue-800 font-medium">{pageData?.title || 'Untitled Page'}</span>
            </div>
        </NodeViewWrapper>
    );
};
