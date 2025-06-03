import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { wrappedExtension } from '../wrapExtension';
import { AgentComponent } from './agent-render';

const AgentNode = Node.create({
    name: 'agent',

    group: 'block',

    content: 'text*',

    parseHTML() {
        return [
            {
                tag: 'div[data-agent-id]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', HTMLAttributes, 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(AgentComponent);
    },
});

const CustomAgentBase = wrappedExtension(AgentNode);

export const CustomAgent = CustomAgentBase.extend({
    addNodeView() {
        return ReactNodeViewRenderer(AgentComponent);
    },
});
