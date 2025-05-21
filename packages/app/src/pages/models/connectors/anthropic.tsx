import { Input } from '@abyss/ui-components';

interface AnthropicConfigProps {
    selectedModel: string;
    config: Record<string, unknown>;
    onModelChange: (model: string) => void;
    onConfigChange: (config: Record<string, unknown>) => void;
}

const DEFAULT_MODELS = [{ label: 'Claude 3.7', content: 'claude-3-7-sonnet-20250219' }];

export function AnthropicConfig({ selectedModel, config, onModelChange, onConfigChange }: AnthropicConfigProps) {
    return (
        <>
            <Input label="Model ID" value={selectedModel} onChange={onModelChange} options={DEFAULT_MODELS} />
            <Input label="API Key" value={(config.apiKey as string) || ''} onChange={data => onConfigChange({ ...config, apiKey: data })} />
        </>
    );
}
