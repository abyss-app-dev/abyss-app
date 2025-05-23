import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Database } from '@/main';

export function useLogView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [rawLog, setRawLog] = useState('');

    useEffect(() => {
        if (id) {
            Database.getLogStream(id).then(setRawLog);
        }
    }, [id]);

    const breadcrumbs = [{ name: 'Home', onClick: () => navigate('/') }, { name: 'Logs' }, { name: id }];
    return { rawLog, breadcrumbs };
}
