import { SqliteTable } from '@abyss/records';
import { useDatabaseTableQuery } from '@abyss/state-store';
import { useEffect } from 'react';
import { Database } from '../main';

export async function applyTheme() {
    const userSettings = await Database.tables.settings.default();
    document.documentElement.setAttribute('data-theme', userSettings.theme || 'abyss');
}

export async function useTheme() {
    const userSettings = useDatabaseTableQuery(SqliteTable.settings, async table => table.default());
    console.log(userSettings);
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', userSettings?.data?.theme || 'abyss');
    }, [userSettings?.data?.theme]);
}
