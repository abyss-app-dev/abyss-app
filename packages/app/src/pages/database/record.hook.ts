import { useDatabaseRecord } from '@abyss/state-store';
import { useNavigate, useParams } from 'react-router';
import type { Database } from '../../main';

export function useRecordPage() {
    const { id, recordId } = useParams();
    const navigate = useNavigate();

    const record = useDatabaseRecord(id as keyof typeof Database.tables, recordId as string);

    const breadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Database', onClick: () => navigate('/database') },
        { name: id, onClick: () => navigate(`/database/id/${id}`) },
        { name: recordId, onClick: () => navigate(`/database/id/${id}/record/${recordId}`) },
    ];

    return {
        record,
        breadcrumbs,
        type: recordId?.split(':')[0],
    };
}
