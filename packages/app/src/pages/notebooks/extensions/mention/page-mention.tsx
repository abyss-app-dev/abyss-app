import { Mention } from '@tiptap/extension-mention';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { PageMention } from './mention-component';

// React component for rendering page mentions
interface PageMentionComponentProps {
    node: any;
    updateAttributes: (attrs: any) => void;
    deleteNode: () => void;
}

const PageMentionComponent: React.FC<PageMentionComponentProps> = ({ node }) => {
    const pageId = node.attrs.id;
    return (
        <NodeViewWrapper className="mention page-mention" data-page-id={pageId}>
            <PageMention pageId={pageId} />
        </NodeViewWrapper>
    );
};

export const PageMentionExtension = Mention.extend({
    name: 'mentionPage',
    addNodeView() {
        return ReactNodeViewRenderer(PageMentionComponent);
    },
});

// .configure({
//     HTMLAttributes: {
//         class: 'mention page-mention',
//     },
//     renderText: () => '-',
//     suggestion: {
//         char: '@',
//         pluginKey: new PluginKey('pageMention'),

//         command: ({ editor, range, props }) => {
//             editor
//                 .chain()
//                 .focus()
//                 .insertContentAt(range, [
//                     {
//                         type: 'mention',
//                         attrs: props,
//                     },
//                     {
//                         type: 'text',
//                         text: ' ',
//                     },
//                 ])
//                 .run();
//         },

//         items: ({ query }) => {
//             // For now using dummy data, but this should be replaced with actual database query
//             const DUMMY_PAGES = [
//                 { id: 'page-1', title: 'Getting Started' },
//                 { id: 'page-2', title: 'Project Overview' },
//                 { id: 'page-3', title: 'Meeting Notes' },
//                 { id: 'page-4', title: 'Technical Documentation' },
//                 { id: 'page-5', title: 'Ideas & Brainstorming' },
//             ];

//             return DUMMY_PAGES.filter(page => page.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
//         },

//         render: () => {
//             let component: HTMLDivElement;
//             let popup: any;

//             return {
//                 onStart: (props: any) => {
//                     component = document.createElement('div');
//                     component.className = 'mention-dropdown';

//                     popup = tippy('body', {
//                         getReferenceClientRect: props.clientRect,
//                         appendTo: () => document.body,
//                         content: component,
//                         showOnCreate: true,
//                         interactive: true,
//                         trigger: 'manual',
//                         placement: 'bottom-start',
//                     });
//                 },

//                 onUpdate(props: any) {
//                     const { items, command } = props;

//                     component.innerHTML = '';

//                     if (items.length === 0) {
//                         const noResults = document.createElement('div');
//                         noResults.className = 'mention-item mention-no-results';
//                         noResults.textContent = 'No pages found';
//                         component.appendChild(noResults);
//                         return;
//                     }

//                     items.forEach((item: any, index: number) => {
//                         const button = document.createElement('button');
//                         button.className = `mention-item ${index === 0 ? 'is-selected' : ''}`;
//                         button.innerHTML = `
//                             <span class="mention-icon">📄</span>
//                             <span class="mention-title">${item.title}</span>
//                         `;

//                         button.addEventListener('click', () => {
//                             command({ id: item.id });
//                         });

//                         component.appendChild(button);
//                     });

//                     popup[0].setProps({
//                         getReferenceClientRect: props.clientRect,
//                     });
//                 },

//                 onKeyDown(props: any) {
//                     const { event } = props;

//                     if (event.key === 'Escape') {
//                         popup[0].hide();
//                         return true;
//                     }

//                     if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
//                         const items = component.querySelectorAll('.mention-item:not(.mention-no-results)');
//                         const selected = component.querySelector('.mention-item.is-selected');
//                         let newIndex = 0;

//                         if (selected) {
//                             const currentIndex = Array.from(items).indexOf(selected);
//                             newIndex =
//                                 event.key === 'ArrowUp'
//                                     ? (currentIndex - 1 + items.length) % items.length
//                                     : (currentIndex + 1) % items.length;
//                         }

//                         items.forEach((item, index) => {
//                             item.classList.toggle('is-selected', index === newIndex);
//                         });

//                         return true;
//                     }

//                     if (event.key === 'Enter') {
//                         const selected = component.querySelector('.mention-item.is-selected:not(.mention-no-results)');
//                         if (selected) {
//                             (selected as HTMLElement).click();
//                         }
//                         return true;
//                     }

//                     return false;
//                 },

//                 onExit() {
//                     popup[0].destroy();
//                 },
//             };
//         },
//     },
// });
