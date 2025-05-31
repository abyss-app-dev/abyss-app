import { type Editor, Extension, type Range } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { getSuggestionItems } from './slash-command-options';
import { renderItems } from './slash-commands-popup';

export const SlashCommands = Extension.create({
    name: 'slashCommands',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                allowSpaces: false,
                allowedPrefixes: [' '],
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }) => {
                    props.command({ editor, range });
                },
                items: getSuggestionItems,
                render: renderItems,
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});
