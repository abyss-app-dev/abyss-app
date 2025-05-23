import { Button, ButtonGroup, ChatMessageText, PageCrumbed } from '@abyss/ui-components';
import type { default as React } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { SectionHeader } from '../chats/components/ChatSectionHeader';
import { useSnapshotsPage } from './view-snapshot.hook';

// Define the rehype plugin to wrap orphan text nodes
function rehypeWrapOrphanText() {
    return (tree: any) => {
        if (tree.type === 'root' && Array.isArray(tree.children)) {
            const newChildren: any[] = [];
            let paragraphNodes: any[] = []; // To collect nodes for the current paragraph

            const flushParagraph = () => {
                if (paragraphNodes.length > 0) {
                    // Check if the paragraphNodes contain actual content beyond whitespace
                    const content = paragraphNodes
                        .map(n => (n.type === 'raw' ? n.value : n.type === 'element' && n.tagName === 'br' ? '\n' : ' '))
                        .join('');

                    if (content.trim()) {
                        newChildren.push({
                            type: 'element',
                            tagName: 'pre',
                            properties: {
                                className:
                                    'bg-background-100 border border-background-200 px-1 rounded overflow-x-auto font-mono text-[10px] w-full',
                            },
                            children: [...paragraphNodes],
                        });
                    } else {
                        // If it's all whitespace, add original nodes back (or discard if preferred)
                        newChildren.push(...paragraphNodes);
                    }
                    paragraphNodes = [];
                }
            };

            for (const child of tree.children) {
                // If child is text or a line break element, it could be part of a paragraph
                if (child.type === 'raw') {
                    paragraphNodes.push(child);
                } else {
                    // If it's another element, the current paragraph (if any) ends
                    flushParagraph();
                    newChildren.push(child); // Add the block element
                }
            }
            flushParagraph(); // Don't forget the last potential paragraph

            tree.children = newChildren;
        }
    };
}

// Define custom components with Tailwind CSS classes
const components: Components = {
    h1: ({ node, ...props }) => (
        <h1 className="text-[20px] font-bold my-4 before:content-['#'] before:text-primary-500 capitalize" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h2 className="text-[16px] font-bold my-3 before:content-['##'] before:text-primary-500 capitalize" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h3 className="text-[14px] font-bold my-2 before:content-['###'] before:text-primary-500 capitalize" {...props} />
    ),
    p: ({ node, ...props }) => <p className="my-2 text-[12px]" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
    li: ({ node, ...props }) => <li className="m-2 text-[12px] " {...props} />,
    pre: ({ node, ...props }) => <pre className="my-2 inline-block w-full" {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
        //@ts-ignore
        return children[0]?.split('\n')?.length > 1 ? (
            <pre
                className={`bg-background-100 border border-background-200 px-1 rounded overflow-x-auto font-mono text-[10px] w-full ${
                    className || ''
                }`}
                {...props}
            >
                {children}
            </pre>
        ) : (
            <code
                className={`bg-background-100 border border-background-200 px-1 rounded overflow-x-auto font-mono text-[10px] ${
                    className || ''
                }`}
                {...props}
            >
                {children}
            </code>
        );
    },
    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 w-full" {...props} />,
};

export function ViewSnapshotPage() {
    const { breadcrumbs, record, raw, setRaw } = useSnapshotsPage();
    const messages: React.ReactNode[] = [];

    for (let i = 0; i < (record?.data?.messagesData ?? []).length; i++) {
        const message = (record?.data?.messagesData ?? [])[i];
        messages.push(<div key={i + 'header-padding'} className="h-2" />);
        messages.push(<SectionHeader key={i + 'header'} sender={message.senderId} />);
        if (raw === 'raw') {
            for (const cell of message.messages) {
                const { content } = cell;
                messages.push(
                    <pre key={i + 'content'} className="text-xs p-2">
                        {typeof content === 'string' ? content : JSON.stringify(content)}
                    </pre>
                );
            }
        } else {
            for (const cell of message.messages) {
                messages.push(
                    <ReactMarkdown
                        key={i + 'content'}
                        components={components}
                        rehypePlugins={[rehypeWrapOrphanText]}
                        className="text-xs px-2"
                    >
                        {typeof cell.content === 'string' ? cell.content : JSON.stringify(cell.content)}
                    </ReactMarkdown>
                );
            }
        }
    }

    return (
        <PageCrumbed
            title={'Chat Snapshot'}
            breadcrumbs={breadcrumbs}
            loading={record === undefined}
            subtitle="This represents the raw text sent to the LLM for a given invoke of the model."
        >
            <ButtonGroup className="mb-2">
                <Button isInactive={raw === 'parsed'} onClick={() => setRaw('raw')}>
                    Plain Text
                </Button>
                <Button isInactive={raw === 'raw'} onClick={() => setRaw('parsed')}>
                    Rendered Markdown
                </Button>
            </ButtonGroup>
            {messages}
        </PageCrumbed>
    );
}
