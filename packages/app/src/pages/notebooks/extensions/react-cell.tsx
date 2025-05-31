import { Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useDatabase } from '@/state/database-access-utils';
import { withDbAttribute } from '../notebook/wrapAttribute';

interface ReactCellComponentProps {
    node: any;
    updateAttributes: (attrs: any) => void;
    deleteNode: () => void;
}

const ReactCellComponent: React.FC<ReactCellComponentProps> = ({ node, updateAttributes, deleteNode }) => {
    const { componentType, componentData } = node.attrs;

    const record = useDatabase.settings.tableQuery(async settings => settings.default());

    const handleUpdate = (updates: any) => {
        updateAttributes({
            componentData: { ...componentData, ...updates },
        });
    };

    return <NodeViewWrapper className="react-cell">{JSON.stringify(record)}</NodeViewWrapper>;
};

const ReactCellNode = Node.create({
    name: 'reactCell',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            componentType: {
                default: 'exampleWidget',
                parseHTML: element => element.getAttribute('data-component-type'),
                renderHTML: attributes => {
                    if (!attributes.componentType) {
                        return {};
                    }
                    return { 'data-component-type': attributes.componentType };
                },
            },
            componentData: {
                default: {},
                parseHTML: element => {
                    const data = element.getAttribute('data-component-data');
                    return data ? JSON.parse(data) : {};
                },
                renderHTML: attributes => {
                    if (!attributes.componentData) {
                        return {};
                    }
                    return { 'data-component-data': JSON.stringify(attributes.componentData) };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-component-type]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', HTMLAttributes, 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ReactCellComponent);
    },
});

const CustomReactCellBase = withDbAttribute(ReactCellNode);

export const CustomReactCell = CustomReactCellBase.extend({
    addNodeView() {
        return ReactNodeViewRenderer(ReactCellComponent);
    },
});
