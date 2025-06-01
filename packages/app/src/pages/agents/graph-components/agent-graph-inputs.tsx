import type { GraphPortDefinition } from '@abyss/intelligence/dist/state-machine/type-definition.type';
import { ChatModelSelector } from './custom-selectors/ChatModelSelector';
import { DocumentSetSelector } from './custom-selectors/DocumentSetSelector';
import { StringInput } from './custom-selectors/StringInput';
import { ToolSetSelector } from './custom-selectors/ToolSetSelector';

export interface SelectForAgentGraphProps {
    color: string;
    port: GraphPortDefinition;
    onSelect: (value: string) => void;
    value: string;
}

export function SelectForAgentGraph(props: SelectForAgentGraphProps) {
    if (props.port.dataType === 'model') {
        return <ChatModelSelector {...props} />;
    }

    if (props.port.dataType === 'string') {
        return <StringInput {...props} />;
    }

    if (props.port.dataType === 'tools') {
        return <ToolSetSelector {...props} />;
    }

    if (props.port.dataType === 'documents') {
        return <DocumentSetSelector {...props} />;
    }

    console.warn('Unknown data type', props.port.dataType);

    return null;
}
