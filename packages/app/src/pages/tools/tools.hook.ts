import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { useNavigate } from 'react-router';

export function useToolsPage() {
    // Navigation
    const navigate = useNavigate();
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Tools', onClick: () => navigate('/tools') },
    ];

    const tools = useDatabaseTable(SqliteTable.toolDefinition);
    const systemTools = tools.data?.filter(tool => tool.handlerType === 'abyss');

    return { breadcrumbs: pageBreadcrumbs, tools, systemTools };
}
