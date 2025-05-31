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
        {
            title: 'New Page',
            icon: '📄',
            command: ({ editor, range }) => {
                // Insert a mention to a dummy page
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent([
                        {
                            type: 'mention',
                            attrs: { id: 'page-new-' + Date.now() },
                        },
                        {
                            type: 'text',
                            text: ' ',
                        },
                    ])
                    .run();
            },
        },
        // React widgets commented out for now
        // {
        //     title: 'Example Widget',
        //     icon: '🔧',
        //     command: ({ editor, range }) => {
        //         editor.chain().focus().deleteRange(range).insertContent({
        //             type: 'reactCellWrapped',
        //             attrs: {
        //                 componentType: 'exampleWidget',
        //                 componentData: { count: 0, title: 'My Widget' }
        //             }
        //         }).run();
        //     },
        // },
        // {
        //     title: 'Chart Widget',
        //     icon: '📊',
        //     command: ({ editor, range }) => {
        //         editor.chain().focus().deleteRange(range).insertContent({
        //             type: 'reactCellWrapped',
        //             attrs: {
        //                 componentType: 'chartWidget',
        //                 componentData: { chartType: 'line', data: [] }
        //             }
        //         }).run();
        //     },
        // },
        // {
        //     title: 'Form Widget',
        //     icon: '📝',
        //     command: ({ editor, range }) => {
        //         editor.chain().focus().deleteRange(range).insertContent({
        //             type: 'reactCellWrapped',
        //             attrs: {
        //                 componentType: 'formWidget',
        //                 componentData: { fields: [] }
        //             }
        //         }).run();
        //     },
        // },
    ];

    // Always return all commands if query is empty, null, or undefined
    if (!query || query.trim() === '') {
        return commands;
    }

    // Filter commands based on query
    const searchTerm = query.toLowerCase().trim();
    return commands.filter(item => item.title.toLowerCase().includes(searchTerm));
};
