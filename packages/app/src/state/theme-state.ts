import { useEffect } from 'react';
import { Database } from '../main';
import { useDatabase, useDatabaseSettings } from './database-access-utils';

export async function applyTheme() {
    const userSettings = await Database.tables.settings.default();
    document.documentElement.setAttribute('data-theme', userSettings.theme || 'abyss');
}

export async function useTheme() {
    const userSettings = useDatabaseSettings();
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', userSettings?.data?.theme || 'abyss');
    }, [userSettings?.data?.theme]);
}
