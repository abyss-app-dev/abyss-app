import { SqliteTable } from '@abyss/records';
import { TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';
import { Database } from '@/main';
import { mapDatabaseCellsToTipTap } from './mapping-db-to-tiptap';
import { mapTipTapDocumentToDatabaseCell } from './mapping-tiptap-to-db';

export async function onSaveNotebook(notebookId: string, editor: Editor) {
    // Save cursor position
    const cursorInfo = getCurrentCursorPosition(editor);

    // Save data to database, which may cause some state updates
    const jsonData = editor.getJSON();
    const databaseCells = mapTipTapDocumentToDatabaseCell(jsonData);
    await Database.tables[SqliteTable.notebookCell].saveNotebook(notebookId, databaseCells);

    // Get new content from database and set it to the editor
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
}

function getCurrentCursorPosition(editor: Editor): { cellIndex: number; offset: number } | null {
    const currentSelection = editor.state.selection;
    let cursorInfo: { cellIndex: number; offset: number } | null = null;
    const doc = editor.state.doc;
    let cellIndex = 0;

    doc.descendants((node, pos) => {
        if (node.attrs?.db && currentSelection.from >= pos && currentSelection.from <= pos + node.nodeSize) {
            cursorInfo = {
                cellIndex: cellIndex,
                offset: currentSelection.from - pos - 1,
            };
            return false;
        }
        if (node.attrs?.db) {
            cellIndex++;
        }
        return true;
    });

    return cursorInfo;
}
