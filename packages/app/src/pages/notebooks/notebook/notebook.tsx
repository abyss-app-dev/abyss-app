import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import './style.css';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { useCallback, useEffect, useState } from 'react';
import { useDatabase } from '@/state/database-access-utils';
import { useDebounce } from '@/state/debounce';
import { PageMentionExtension } from '../extensions/mention/page-mention';
import { SlashCommands } from '../extensions/slash-commands/slash-commands';
import { wrappedExtension } from '../extensions/wrapExtension';
import { mapDatabaseCellsToTipTap } from './mapping-db-to-tiptap';
import { onSaveNotebook } from './onSaveNotebook';

// Build the extensions we need
const CustomHeading = wrappedExtension(Heading);
const CustomParagraph = wrappedExtension(Paragraph);
const extensions = [Document, Text, CustomHeading, CustomParagraph, PageMentionExtension, SlashCommands];

export function Notebook({ notebookId }: { notebookId: string }) {
    const content = useDatabase.notebookCell.tableQuery(async cells => cells.getChildren(notebookId));
    const [hydrated, setHydrated] = useState(false);

    const saveNotebook = useCallback((editor: Editor) => onSaveNotebook(notebookId, editor), [notebookId]);

    const debouncedSave = useDebounce(saveNotebook, 1000);

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
        if (editor && content.data && !hydrated) {
            const json = mapDatabaseCellsToTipTap(content.data);
            editor.commands.setContent(json, false);
            setHydrated(true);
        }
    }, [editor, content.data]);

    return <EditorContent editor={editor} className="prose p-4" />;
}
