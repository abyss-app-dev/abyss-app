import { Button, IconSection, Input, PageCrumbed } from '@abyss/ui-components';
import { Box, Globe, Settings, Trash } from 'lucide-react';
import { AnthropicLogo, GeminiLogo, OpenAILogo } from '../../library/logos';
import { AnthropicConfig } from './connectors/anthropic';
import { GeminiConfig } from './connectors/gemini';
import { OpenAIConfig } from './connectors/openai';
import { useModelProfileCreate } from './edit.hook';

const Providers = [
    {
        name: 'OpenAI',
        icon: <OpenAILogo logo="OpenAI" className="w-6 h-6" />,
        component: OpenAIConfig,
    },
    {
        name: 'Gemini',
        icon: <GeminiLogo logo="Gemini" className="w-6 h-6" />,
        component: GeminiConfig,
    },
    {
        name: 'Anthropic',
        icon: <AnthropicLogo logo="Anthropic" className="w-6 h-6" />,
        component: AnthropicConfig,
    },
] as const;

export function ModelProfileEditPage() {
    const { modelMetadata, saveHandler, breadcrumbs, deleteHandler } = useModelProfileCreate();
    const selectedProviderConfig = Providers.find(provider => provider.name === modelMetadata.providerId);

    const handleProviderSelect = (providerName: string) => {
        saveHandler({ providerId: providerName, modelId: '', connectionData: {} });
    };

    return (
        <PageCrumbed title={modelMetadata.id ? 'Edit Model Profile' : 'Create Model Profile'} breadcrumbs={breadcrumbs}>
            <IconSection title="Name" subtitle="The name for your model profile" icon={Box}>
                <Input label="Name" value={modelMetadata.name} onChange={value => saveHandler({ name: value })} />
            </IconSection>

            <IconSection title="Provider" subtitle="Select the provider for your model connection" icon={Globe}>
                <div className="flex flex-row gap-1">
                    {Providers.map(provider => (
                        <Button
                            key={provider.name}
                            onClick={() => handleProviderSelect(provider.name)}
                            variant="primary"
                            isInactive={modelMetadata.providerId !== provider.name}
                            className="gap-4"
                        >
                            {provider.icon}
                            {provider.name}
                        </Button>
                    ))}
                </div>
            </IconSection>

            <IconSection
                title="Provider Configuration"
                subtitle={
                    modelMetadata.providerId
                        ? `Configure the ${modelMetadata.providerId} provider. Configuration data is stored locally on your machine.`
                        : 'Select a provider to continue'
                }
                icon={Settings}
            >
                <div className={modelMetadata.providerId ? 'flex flex-col gap-4' : 'hidden'}>
                    {selectedProviderConfig?.component({
                        selectedModel: modelMetadata.modelId || '',
                        onModelChange: (modelId: string) => saveHandler({ modelId }),
                        config: (modelMetadata.connectionData || {}) as Record<string, unknown>,
                        onConfigChange: (config: Record<string, unknown>) => saveHandler({ connectionData: config }),
                    })}
                </div>
            </IconSection>

            {modelMetadata.id && (
                <IconSection title="Destructive Actions" icon={Trash}>
                    <Button variant="primary" icon={Trash} onClick={deleteHandler}>
                        Delete this model profile
                    </Button>
                </IconSection>
            )}
        </PageCrumbed>
    );
}
