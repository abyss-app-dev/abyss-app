import { SqliteTable } from '@abyss/records';
import type { Editor, Range } from '@tiptap/core';
import { Database } from '@/main';

export interface Command {
    title: string;
    icon: string;
    command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

export const getSuggestionItems = ({ query }: { query: string }): Command[] => {
    const commands: Command[] = [
        { title: 'Heading 1', icon: 'H1', command: onCreateHeading1 },
        { title: 'Heading 2', icon: 'H2', command: onCreateHeading2 },
        { title: 'Heading 3', icon: 'H3', command: onCreateHeading3 },
        { title: 'Paragraph', icon: 'P', command: onCreateParagraph },
        { title: 'New Page', icon: '+', command: onCreateNewPage },
    ];

    if (!query || query.trim() === '') {
        return commands;
    }

    const searchTerm = query.toLowerCase().trim();
    return commands.filter(item => item.title.toLowerCase().includes(searchTerm));
};

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
    editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([{ type: 'pageWrapped', attrs: { pageId: newPage.id } }])
        .run();
}
