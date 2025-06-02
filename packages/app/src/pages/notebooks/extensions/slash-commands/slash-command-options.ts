import { SqliteTable } from '@abyss/records';
import type { Editor, Range } from '@tiptap/core';
import { Database } from '@/main';

export interface Command {
    title: string;
    icon: string;
    command?: ({ editor, range }: { editor: Editor; range: Range }) => void;
    subCommands?: () => Promise<Command[]>;
}

export const getSuggestionItems = ({ query }: { query: string }): Command[] => {
    const commands: Command[] = [
        { title: 'Heading 1', icon: 'H1', command: onCreateHeading1 },
        { title: 'Heading 2', icon: 'H2', command: onCreateHeading2 },
        { title: 'Heading 3', icon: 'H3', command: onCreateHeading3 },
        { title: 'Paragraph', icon: 'P', command: onCreateParagraph },
        { title: 'New Page', icon: '+', command: onCreateNewPage },
        { title: 'Tool Reference', icon: 'ϟ', subCommands: getToolCommands },
    ];

    if (!query || query.trim() === '') {
        return commands;
    }

    const searchTerm = query.toLowerCase().trim();
    return commands.filter(item => item.title.toLowerCase().includes(searchTerm));
};

async function getToolCommands(): Promise<Command[]> {
    const tools = await Database.tables[SqliteTable.toolDefinition].list();

    if (tools.length === 0) {
        return [
            {
                title: 'No tools available',
                icon: '⚠️',
                command: () => {
                    console.log('No tools available');
                },
            },
        ];
    }

    return tools.map(tool => ({
        title: tool.name,
        icon: '🔧',
        command: ({ editor, range }) => onCreateToolReference({ editor, range, toolId: tool.id }),
    }));
}

function onCreateHeading1({ editor, range }: { editor: Editor; range: Range }) {
    editor.chain().focus().deleteRange(range).setNode('headingWrapped', { level: 1 }).run();
}

function onCreateHeading2({ editor, range }: { editor: Editor; range: Range }) {
    editor.chain().focus().deleteRange(range).setNode('headingWrapped', { level: 2 }).run();
}

function onCreateHeading3({ editor, range }: { editor: Editor; range: Range }) {
    editor.chain().focus().deleteRange(range).setNode('headingWrapped', { level: 3 }).run();
}

function onCreateParagraph({ editor, range }: { editor: Editor; range: Range }) {
    editor.chain().focus().deleteRange(range).setNode('paragraphWrapped').run();
}

async function onCreateNewPage({ editor, range }: { editor: Editor; range: Range }) {
    const newPage = await Database.tables[SqliteTable.notebookCell].create({
        type: 'page',
        parentCellId: null,
        orderIndex: 0,
        propertyData: {
            title: 'New Page',
        },
    });

    const dbData = {
        id: newPage.id,
        parentCellId: null,
        orderIndex: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        propertyData: newPage.propertyData,
    };
    editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([{ type: 'pageWrapped', attrs: { db: JSON.stringify(dbData) } }])
        .run();
}

async function onCreateToolReference({ editor, range, toolId }: { editor: Editor; range: Range; toolId: string }) {
    const newToolCell = await Database.tables[SqliteTable.notebookCell].create({
        type: 'tool',
        parentCellId: null,
        orderIndex: 0,
        propertyData: {
            toolId: toolId,
        },
    });

    const dbData = {
        id: newToolCell.id,
        parentCellId: null,
        orderIndex: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        propertyData: newToolCell.propertyData,
    };
    editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([{ type: 'toolWrapped', attrs: { db: JSON.stringify(dbData) } }])
        .run();
}
