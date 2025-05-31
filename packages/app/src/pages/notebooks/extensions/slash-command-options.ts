import { Editor } from '@tiptap/core';

export interface Command {
    title: string;
    icon: string;
    command: ({ editor, range }: { editor: Editor; range: any }) => void;
}

export const getSuggestionItems = ({ query }: { query: string }): Command[] => {
    const commands: Command[] = [
        {
            title: 'Heading 1',
            icon: 'H1',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('headingWrapped', { level: 1 }).run();
            },
        },
        {
            title: 'Heading 2',
            icon: 'H2',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('headingWrapped', { level: 2 }).run();
            },
        },
        {
            title: 'Heading 3',
            icon: 'H3',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('headingWrapped', { level: 3 }).run();
            },
        },
        {
            title: 'Paragraph',
            icon: 'P',
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('paragraphWrapped').run();
            },
        },
    ];

    // Always return all commands if query is empty, null, or undefined
    if (!query || query.trim() === '') {
        return commands;
    }

    // Filter commands based on query
    const searchTerm = query.toLowerCase().trim();
    return commands.filter(item => item.title.toLowerCase().includes(searchTerm));
};
