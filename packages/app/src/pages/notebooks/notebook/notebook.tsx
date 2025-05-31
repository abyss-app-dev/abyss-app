import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import './style.css';
import { SqliteTable } from '@abyss/records';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextSelection } from '@tiptap/pm/state';
import { useCallback, useEffect, useState } from 'react';
import { Database } from '@/main';
import { useDatabase } from '@/state/database-access-utils';
import { useDebounce } from '@/state/debounce';
import { PageMention } from '../extensions/page-mention';
import SlashCommands from '../extensions/slash-commands/slash-commands';
import { mapDatabaseCellsToTipTap, mapTipTapDocumentToDatabaseCell } from './mapping';
import { withDbAttribute } from './wrapAttribute';

const CustomHeading = withDbAttribute(Heading);
const CustomParagraph = withDbAttribute(Paragraph);

// Use only the custom extensions - DO NOT include the base ones
const extensions = [Document, Text, CustomHeading, CustomParagraph, PageMention, SlashCommands];

export function Notebook({ notebookId }: { notebookId: string }) {
    const content = useDatabase.notebookCell.tableQuery(async cells => cells.getChildren(notebookId));
    const [hydrated, setHydrated] = useState(false);

    const saveNotebook = useCallback(
        async (editor: Editor) => {
            // Store semantic cursor position information
            const currentSelection = editor.state.selection;
            let cursorInfo: { cellIndex: number; offset: number } | null = null;

            // Find which cell the cursor is in and the offset within that cell
            const doc = editor.state.doc;
            let cellIndex = 0;

            doc.descendants((node, pos) => {
                if (node.attrs?.db && currentSelection.from >= pos && currentSelection.from <= pos + node.nodeSize) {
                    cursorInfo = {
                        cellIndex: cellIndex,
                        offset: currentSelection.from - pos - 1, // -1 to account for the node start
                    };
                    return false; // Stop traversing
                }
                // Increment cell index for each cell we encounter
                if (node.attrs?.db) {
                    cellIndex++;
                }
                return true;
            });

            const jsonData = editor.getJSON();
            const cells = mapTipTapDocumentToDatabaseCell(jsonData);
            await Database.tables[SqliteTable.notebookCell].saveNotebook(notebookId, cells);

            // Refresh content from database to get any modifications made during save
            const newContent = await Database.tables[SqliteTable.notebookCell].getChildren(notebookId);
            const json = mapDatabaseCellsToTipTap(newContent);
            editor.commands.setContent(json, false);

            // Restore cursor position by finding the cell at the same index
            if (cursorInfo) {
                let currentCellIndex = 0;
                let restored = false;
                const newDoc = editor.state.doc;

                newDoc.descendants((node, pos) => {
                    if (!restored && node.attrs?.db) {
                        if (currentCellIndex === cursorInfo?.cellIndex) {
                            // Found the target cell, restore position within it
                            const targetPos = Math.min(pos + 1 + cursorInfo.offset, pos + node.nodeSize - 1);
                            const resolvedPos = editor.state.doc.resolve(targetPos);
                            const newSelection = editor.state.tr.setSelection(TextSelection.near(resolvedPos));
                            editor.view.dispatch(newSelection);
                            restored = true;
                            return false; // Stop traversing
                        }
                        currentCellIndex++;
                    }
                    return !restored;
                });
            }
        },
        [notebookId]
    );

    const debouncedSave = useDebounce(saveNotebook, 1000);

    const editor = useEditor(
        {
            extensions,
            content: { type: 'doc', content: [] },
            onUpdate({ editor }) {
                debouncedSave(editor);
            },
        },
        [notebookId]
    );

    useEffect(() => {
        if (editor && content.data && !hydrated) {
            const json = mapDatabaseCellsToTipTap(content.data);
            editor.commands.setContent(json, false);
            setHydrated(true);
        }
    }, [editor, content.data]);

    return <EditorContent editor={editor} className="prose p-4" />;
}
