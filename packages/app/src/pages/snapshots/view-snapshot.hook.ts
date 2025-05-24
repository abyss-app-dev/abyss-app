import { useNavigate, useParams } from 'react-router';
import { useDatabase } from '@/state/database-access-utils';

export function useSnapshotsPage() {
    const { id } = useParams();

    const snapshot = useDatabase.chatSnapshot.record(id);

    const navigate = useNavigate();
    const pageBreadcrumbs = [{ name: 'Home', onClick: () => navigate('/') }, { name: 'Snapshots' }, { name: id }];

    console.log('snapshot', snapshot);
    return { breadcrumbs: pageBreadcrumbs, record: snapshot };
}
