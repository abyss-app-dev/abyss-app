import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDatabase } from '@/state/database-access-utils';

export function useSnapshotsPage() {
    const { id } = useParams();

    const [raw, setRaw] = useState<'raw' | 'parsed'>('parsed');
    const snapshot = useDatabase.chatSnapshot.record(id);

    const navigate = useNavigate();
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Snapshots', onClick: () => navigate('/') },
        { name: id },
    ];

    return { breadcrumbs: pageBreadcrumbs, record: snapshot, raw, setRaw };
}
