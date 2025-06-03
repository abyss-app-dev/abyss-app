import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { useNavigate } from 'react-router';

export function useAddMcpPage() {
    const navigate = useNavigate();

    // Navigation
    const pageBreadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Tools', onClick: () => navigate('/tools') },
        { name: 'Add MCP Connection', onClick: () => navigate('/tools/mcp') },
    ];

    return { breadcrumbs: pageBreadcrumbs, navigate };
}
