import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import './style.css';
import { SqliteTable } from '@abyss/records';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { useCallback, useEffect, useState } from 'react';
import { Database } from '@/main';
import { useDatabase } from '@/state/database-access-utils';
import { useDebounce } from '@/state/debounce';
import { mapDatabaseCellsToTipTap, mapTipTapDocumentToDatabaseCell } from './mapping';
import { withDbAttribute } from './wrapAttribute';

const CustomHeading = withDbAttribute(Heading);
const CustomParagraph = withDbAttribute(Paragraph);

// Use only the custom extensions - DO NOT include the base ones
const extensions = [Document, Text, CustomHeading, CustomParagraph];

export function Notebook({ notebookId }: { notebookId: string }) {
    const content = useDatabase.notebookCell.tableQuery(async cells => cells.getChildren(notebookId));
    const [hydrated, setHydrated] = useState(false);

    const saveNotebook = useCallback(
        (jsonData: JSONContent) => {
            const cells = mapTipTapDocumentToDatabaseCell(jsonData);
            console.log('saving notebook', cells);
            Database.tables[SqliteTable.notebookCell].saveNotebook(notebookId, cells);
        },
        [notebookId]
    );

    const debouncedSave = useDebounce(saveNotebook, 1000);

    const editor = useEditor({
        extensions,
        content: { type: 'doc', content: [] },
        onUpdate({ editor }) {
            debouncedSave(editor.getJSON());
        },
    });

    useEffect(() => {
        if (editor && content.data && !hydrated) {
            console.log('setting content', content.data);

            const json = mapDatabaseCellsToTipTap(content.data);
            editor.commands.setContent(json, false);
            setHydrated(true);
        }
    }, [editor, content.data]);

    return <EditorContent editor={editor} className="prose p-4" />;
}
