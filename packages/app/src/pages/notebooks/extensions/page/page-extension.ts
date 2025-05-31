import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { wrappedExtension } from '../wrapExtension';
import { PageComponent } from './page-render';

const PageNode = Node.create({
    name: 'page',

    group: 'block',

    atom: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-page-id]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', HTMLAttributes, 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PageComponent);
    },
});

const CustomPageBase = wrappedExtension(PageNode);

export const CustomPage = CustomPageBase.extend({
    addNodeView() {
        return ReactNodeViewRenderer(PageComponent);
    },
});
