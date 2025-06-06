import {
    RichDocumentTemplate,
    type ToolDefinitionInputProperty,
    type ToolDefinitionOutputProperty,
    type ToolDefinitionType,
} from '@abyss/records';

const buildObjectFromProperties = (properties: ToolDefinitionInputProperty[] | ToolDefinitionOutputProperty[]) => {
    const object: Record<string, string> = {};
    for (const property of properties) {
        object[property.name] = property.description;
    }
    return object;
};

const buildExampleUsageFromProperties = (properties: ToolDefinitionInputProperty[]) => {
    const object: Record<string, string> = {};
    for (const property of properties) {
        let exampleContent = '';
        if (property.type === 'string') {
            exampleContent = '<![CDATA[Hello, world!]]>';
        } else if (property.type === 'number') {
            exampleContent = '123';
        } else if (property.type === 'boolean') {
            exampleContent = 'true';
        }
        object[property.name] = exampleContent;
    }
    return object;
};

export const toolDefinitionTemplate = new RichDocumentTemplate<ToolDefinitionType>()
    .addHeader3(params => `${params.shortName} (new tool definition)`)
    .addText(params => params.description)
    .addXMLElement((params: ToolDefinitionType) => ({ 'input-schema': buildObjectFromProperties(params.inputSchemaData) }))
    .addXMLElement(
        (params: ToolDefinitionType) =>
            Object.keys(params.outputSchemaData).length > 0 && { 'output-schema': buildObjectFromProperties(params.outputSchemaData) }
    )
    .addText('If you want to use this tool, you could respond with data like below')
    .addXMLElement((params: ToolDefinitionType) => ({ [params.shortName]: buildExampleUsageFromProperties(params.inputSchemaData) }));

export const addToolDefinitionPrompt = new RichDocumentTemplate<ToolDefinitionType[]>()
    .addHeader2('Tool Definitions Added')
    .addText('You were just given access to the following new tool definitions, below are the details on how to use them')
    .addSubDocument((params: ToolDefinitionType[]) => params.map(tool => toolDefinitionTemplate.compile(tool)));
