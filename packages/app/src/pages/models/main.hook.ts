import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { useNavigate } from 'react-router-dom';

export function useModelProfileMain() {
    const modelProfiles = useDatabaseTable(SqliteTable.modelConnection);
    const navigate = useNavigate();

    const handleCreateNew = () => {
        navigate('/models/create');
    };

    const navigateToHome = () => {
        navigate('/');
    };

    const navigateToModels = () => {
        navigate('/models');
    };

    const navigateToModelDetail = (modelId: string) => {
        navigate(`/models/id/${modelId}`);
    };

    const breadcrumbs = [
        { name: 'Home', onClick: navigateToHome },
        { name: 'Models', onClick: navigateToModels },
    ];

    return {
        modelProfiles,
        handleCreateNew,
        breadcrumbs,
        navigateToHome,
        navigateToModels,
        navigateToModelDetail,
    };
}
