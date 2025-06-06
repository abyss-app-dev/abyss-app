import { Input } from '@abyss/ui-components';

interface GeminiConfigProps {
    selectedModel: string;
    config: Record<string, unknown>;
    onModelChange: (model: string) => void;
    onConfigChange: (config: Record<string, unknown>) => void;
}

const DEFAULT_MODELS = [{ label: 'Gemini 2.5 Flash', content: 'gemini-2.5-flash-preview-04-17' }];

export function GeminiConfig({ selectedModel, config, onModelChange, onConfigChange }: GeminiConfigProps) {
    return (
        <>
            <Input label="Model ID" value={selectedModel} onChange={onModelChange} options={DEFAULT_MODELS} />
            <Input label="API Key" value={(config.apiKey as string) || ''} onChange={data => onConfigChange({ ...config, apiKey: data })} />
        </>
    );
}
