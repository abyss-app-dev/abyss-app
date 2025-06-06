import { Input } from '@abyss/ui-components';

interface OpenAIConfigProps {
    selectedModel: string;
    config: Record<string, unknown>;
    onModelChange: (model: string) => void;
    onConfigChange: (config: Record<string, unknown>) => void;
}

const DEFAULT_MODELS = [
    { label: 'GPT 4o', content: 'gpt-4o-2024-08-06' },
    { label: 'O4 Mini', content: 'o4-mini-2025-04-16' },
];

export function OpenAIConfig({ selectedModel, config, onModelChange, onConfigChange }: OpenAIConfigProps) {
    return (
        <>
            <Input label="Model ID" value={selectedModel} onChange={onModelChange} options={DEFAULT_MODELS} />
            <Input label="API Key" value={(config.apiKey as string) || ''} onChange={data => onConfigChange({ ...config, apiKey: data })} />
        </>
    );
}
