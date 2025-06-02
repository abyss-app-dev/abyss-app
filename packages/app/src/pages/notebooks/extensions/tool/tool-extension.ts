import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { wrappedExtension } from '../wrapExtension';
import { ToolComponent } from './tool-render';

const ToolNode = Node.create({
    name: 'tool',

    group: 'block',

    atom: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-tool-id]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', HTMLAttributes, 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ToolComponent);
    },
});

const CustomToolBase = wrappedExtension(ToolNode);

export const CustomTool = CustomToolBase.extend({
    addNodeView() {
        return ReactNodeViewRenderer(ToolComponent);
    },
});
