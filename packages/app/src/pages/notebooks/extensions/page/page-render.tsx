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
    const pageId = node.attrs.pageId;
    const page = useDatabase.notebookCell.record(pageId);
    const navigate = useNavigate();
    const pageData = page.data?.propertyData as NotebookPageCellProperties | undefined;

    const handleClick = () => {
        navigate(`/notebooks/id/${pageId}`);
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
