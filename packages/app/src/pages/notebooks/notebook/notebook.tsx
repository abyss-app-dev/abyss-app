import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import './style.css';
import { SqliteTable } from '@abyss/records';
import { useDatabaseTableQuery } from '@abyss/state-store';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/state/debounce';
import { CustomAgent } from '../extensions/agent/agent-extension';
import { PageMentionExtension } from '../extensions/mention/page-mention';
import { CustomPage } from '../extensions/page/page-extension';
import { SlashCommands } from '../extensions/slash-commands/slash-commands';
import { CustomTool } from '../extensions/tool/tool-extension';
import { wrappedExtension } from '../extensions/wrapExtension';
import { mapDatabaseCellsToTipTap } from './mapping-db-to-tiptap';
import { onSaveNotebook } from './onSaveNotebook';

// Build the extensions we need
const CustomHeading = wrappedExtension(Heading);
const CustomParagraph = wrappedExtension(Paragraph);
const extensions = [
    Document,
    Text,
    CustomHeading,
    CustomParagraph,
    CustomPage,
    CustomTool,
    CustomAgent,
    PageMentionExtension,
    SlashCommands,
];

export function Notebook({ notebookId }: { notebookId: string }) {
    const content = useDatabaseTableQuery(SqliteTable.notebookCell, async cells => cells.getChildren(notebookId), [notebookId]);
    const [hydrated, setHydrated] = useState(false);

    const saveNotebook = useCallback((editor: Editor) => onSaveNotebook(notebookId, editor), [notebookId]);
    const debouncedSave = useDebounce(saveNotebook, 1000, [notebookId]);

    const editor = useEditor(
        {
            extensions,
            content: { type: 'doc', content: [] },
            onUpdate: ({ editor }) => debouncedSave(editor),
        },
        [notebookId]
    );

    // Set content when the content is loaded
    useEffect(() => {
        setHydrated(false);
    }, [notebookId]);

    useEffect(() => {
        if (editor && !content.loading && content.data && !hydrated) {
            const json = mapDatabaseCellsToTipTap(content.data);
            editor.commands.setContent(json, false);
            setHydrated(true);
        }
    }, [editor, content.data, notebookId]);

    return <EditorContent editor={editor} className="prose p-4" />;
}
