import type { ToolDefinitionType } from '@abyss/records';
import type { ToolHandler } from './tool-handler';

export function getToolHandler(toolDefinition: ToolDefinitionType): ToolHandler {
    if (toolDefinition.handlerType === 'abyss') {
        switch (toolDefinition.id) {
            case 'toolDefinition::helloworld-tool':
                throw new Error(`No tool handler found for tool definition ${toolDefinition.id}`);
        }
    }

    throw new Error(
        `No tool handler found for tool definition, there is no way for Abyss to resolve this tool at this time ${toolDefinition.id}`
    );
}
