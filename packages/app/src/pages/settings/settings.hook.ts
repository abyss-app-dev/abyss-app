import { useNavigate } from 'react-router';
import { useDatabase, useDatabaseSettings } from '@/state/database-access-utils';
import { Database } from '../../main';

export function useSettingsPage() {
    // Navigation
    const navigate = useNavigate();
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Settings', onClick: () => navigate('/settings') },
    ];

    // Settings
    const settings = useDatabaseSettings();

    // Theme
    const onChangeAppTheme = (theme: string) => {
        Database.tables.settings.ref().update({ theme });
    };

    return { breadcrumbs: pageBreadcrumbs, record: settings, onChangeAppTheme };
}
