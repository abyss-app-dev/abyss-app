import type { NotebookPageCellProperties } from '@abyss/records';
import { SqliteTable } from '@abyss/records';
import { useDatabaseRecord } from '@abyss/state-store';
import { NodeViewWrapper } from '@tiptap/react';
import { FileInputIcon, TextIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageComponentProps {
    node: any;
    updateAttributes: (attrs: any) => void;
    deleteNode: () => void;
}

export const PageComponent: React.FC<PageComponentProps> = ({ node }) => {
    const db = JSON.parse(node.attrs.db);
    const page = useDatabaseRecord(SqliteTable.notebookCell, db.id);
    const navigate = useNavigate();
    const pageData = page.data?.propertyData as NotebookPageCellProperties | undefined;

    const handleClick = () => {
        navigate(`/notebooks/id/${db.id}`);
    };

    return (
        <NodeViewWrapper className="page-node">
            <div
                className="inline-flex items-center px-2 bg-primary-300 hover:bg-primary-100 border border-primary-500 rounded cursor-pointer"
                onClick={handleClick}
            >
                <TextIcon className="w-4 h-4 mr-2" />
                <span className="text-primary-800" style={{ fontSize: '12px' }}>
                    {pageData?.title || 'Untitled Page'}
                </span>
            </div>
        </NodeViewWrapper>
    );
};
