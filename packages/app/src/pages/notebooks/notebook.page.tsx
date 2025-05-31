import { useParams } from 'react-router-dom';
import { Notebook } from './notebook/notebook';

export function NotebookPage() {
    const { id } = useParams();
    return <Notebook notebookId={id || ''} />;
}
