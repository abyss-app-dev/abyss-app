import { SqliteTable } from '@abyss/records';
import { useDatabaseTableQuery } from '@abyss/state-store';
import { useNavigate } from 'react-router';
import { Database } from '../../main';

export function useSettingsPage() {
    // Navigation
    const navigate = useNavigate();
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Settings', onClick: () => navigate('/settings') },
    ];

    // Settings
    const settings = useDatabaseTableQuery(SqliteTable.settings, async table => table.default());

    // Theme
    const onChangeAppTheme = (theme: string) => {
        Database.tables.settings.ref().update({ theme });
    };

    return { breadcrumbs: pageBreadcrumbs, record: settings, onChangeAppTheme };
}
