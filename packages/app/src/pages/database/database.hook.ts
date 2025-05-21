import { useNavigate } from 'react-router-dom';
import { useDatabaseTables } from '../../state/database-access-utils';

export function useDatabasePage() {
    const navigate = useNavigate();
    const openDbTable = (tableName: string) => navigate(`/database/id/${tableName}`);

    // Page metadata
    const pageTitle = 'Local Database Explorer';
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Database', onClick: () => navigate('/database') },
    ];

    // Data fetching
    const allTables = useDatabaseTables();

    // Actions
    const openDbFolder = () => {
        // @ts-ignore
        window['abyss-fs'].openDbFolder();
    };

    return {
        pageTitle,
        pageBreadcrumbs,
        allTables,
        openDbFolder,
        navigate,
        openDbTable,
    };
}
