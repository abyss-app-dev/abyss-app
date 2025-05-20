import { describe, expect, test } from 'vitest';
import { buildTestDB } from '../../sqlite/sqlite-client.mock';

describe('Tool Definition Table Reference', () => {
    describe('when we create a new tool definition', () => {
        test('can get a reference to a tool definition through table.ref(id)', async () => {
            const client = await buildTestDB();
            const toolDefinition = await client.tables.toolDefinition.newToolDefinition({
                name: 'test',
                description: 'test',
                handlerType: 'abyss',
                inputSchemaData: [],
                outputSchemaData: [],
            });
            const ref = client.tables.toolDefinition.ref(toolDefinition.id);
            const result = await ref.get();
            expect(result.name).toEqual('test');
        });

        test('infers shortName from the name when creating a tool definition', async () => {
            const client = await buildTestDB();
            const toolDefinition = await client.tables.toolDefinition.newToolDefinition({
                name: 'Test tool definition',
                description: 'test',
                handlerType: 'abyss',
                inputSchemaData: [],
                outputSchemaData: [],
            });
            expect(toolDefinition.shortName).toContain('test-tool-definition-');
        });
    });
});
