import { Button, IconSection, PageCrumbed, Tile, TileGrid } from '@abyss/ui-components';
import { Box, Plus } from 'lucide-react';
import { Logo } from '../../library/logos';
import { useModelProfileMain } from './main.hook';

export function ModelProfileMainPage() {
    const { modelProfiles, handleCreateNew, breadcrumbs, navigateToModelDetail } = useModelProfileMain();

    return (
        <PageCrumbed title="Connected Models" breadcrumbs={breadcrumbs}>
            <IconSection
                title="Connected Models"
                icon={Box}
                action={<Button variant="secondary" icon={Plus} onClick={handleCreateNew} tooltip="New Connection" />}
                subtitle="Models registered here are accessable to Abyss and consumable for agent orchestrations"
            >
                {modelProfiles.data && modelProfiles.data.length > 0 ? (
                    <TileGrid>
                        {modelProfiles.data.map(model => (
                            <Tile
                                key={model.id}
                                title={model.name || 'Untitled'}
                                onClick={() => navigateToModelDetail(model.id)}
                                icon={<Box className="w-4 h-4" />}
                                footer={<Logo logo={model.providerId} className="w-6 h-6" />}
                            >
                                {model.description}
                            </Tile>
                        ))}
                    </TileGrid>
                ) : (
                    <div className="text-text-700">No model profiles found</div>
                )}
            </IconSection>
        </PageCrumbed>
    );
}
