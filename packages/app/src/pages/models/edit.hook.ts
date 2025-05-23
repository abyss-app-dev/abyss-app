import type { ModelConnectionType } from '@abyss/records';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDatabase } from '@/state/database-access-utils';
import { Database } from '../../main';

export function useModelProfileCreate() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Load model profile and then update it if we see the one on disk change
    const modelProfile = useDatabase.modelConnection.record(id || '');
    const [modelMetadata, setModelMetadata] = useState<Partial<ModelConnectionType>>({});

    useEffect(() => {
        if (modelProfile.data) {
            setModelMetadata({ ...modelProfile.data });
        }
    }, [modelProfile.data]);

    useEffect(() => {
        if (id) {
            return;
        }
        if (!modelMetadata.providerId || !modelMetadata.modelId) {
            return;
        }
        Database.tables.modelConnection
            .create({
                name: modelMetadata.name || 'New Model',
                description: `A model connection for ${modelMetadata.providerId} ${modelMetadata.modelId}`,
                providerId: modelMetadata.providerId,
                modelId: modelMetadata.modelId,
                connectionData: modelMetadata.connectionData || {},
            })
            .then(record => {
                navigate(`/models/id/${record.id}`);
            });
    }, [modelMetadata, navigate]);

    // Save model profile
    const saveHandler = useCallback(
        (partial: Partial<ModelConnectionType>) => {
            if (modelMetadata.id) {
                Database.tables.modelConnection.ref(modelMetadata.id).update(partial);
            } else {
                setModelMetadata(current => ({ ...current, ...partial }));
            }
        },
        [modelMetadata]
    );

    // Delete model profile
    const deleteHandler = useCallback(() => {
        if (modelMetadata.id) {
            Database.tables.modelConnection.ref(modelMetadata.id).delete();
            navigate('/models');
        }
    }, [modelMetadata]);

    const breadcrumbs = [
        { name: 'Home', onClick: () => navigate('/') },
        { name: 'Models', onClick: () => navigate('/models') },
        { name: modelMetadata.id || 'new' },
        { name: modelMetadata.id ? 'Edit' : 'Create' },
    ];

    return {
        modelMetadata,
        saveHandler,
        deleteHandler,
        breadcrumbs,
    };
}
