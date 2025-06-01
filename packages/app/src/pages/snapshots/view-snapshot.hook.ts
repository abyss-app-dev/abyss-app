import { SqliteTable } from '@abyss/records';
import { useDatabaseRecord } from '@abyss/state-store';
import { useNavigate, useParams } from 'react-router';

export function useSnapshotsPage() {
    const { id } = useParams();

    const snapshot = useDatabaseRecord(SqliteTable.chatSnapshot, id);

    const navigate = useNavigate();
    const pageBreadcrumbs = [{ name: 'Home', onClick: () => navigate('/') }, { name: 'Snapshots' }, { name: id }];

    console.log('snapshot', snapshot);
    return { breadcrumbs: pageBreadcrumbs, record: snapshot };
}
