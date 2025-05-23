import { useNavigate } from 'react-router';
import { useDatabase } from '@/state/database-access-utils';

export function useToolsPage() {
    // Navigation
    const navigate = useNavigate();
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Tools', onClick: () => navigate('/tools') },
    ];

    const tools = useDatabase.toolDefinition.scan();
    const systemTools = tools.data?.filter(tool => tool.handlerType === 'abyss');

    return { breadcrumbs: pageBreadcrumbs, tools, systemTools };
}
