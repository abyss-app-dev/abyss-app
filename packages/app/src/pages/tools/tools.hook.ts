import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { useNavigate } from 'react-router';

export function useToolsPage() {
    const navigate = useNavigate();

    // Navigation
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Tools', onClick: () => navigate('/tools') },
    ];

    const tools = useDatabaseTable(SqliteTable.toolDefinition);
    const systemTools = tools.data?.filter(tool => tool.handlerType === 'abyss');

    const mcpConnections = useDatabaseTable(SqliteTable.mcpConnection);

    return { breadcrumbs: pageBreadcrumbs, tools, systemTools, mcpConnections, navigate };
}
