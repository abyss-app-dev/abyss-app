import type { Cell } from '@abyss/records';
import type { ReferencedChatSnapshotRecord } from '@abyss/records/dist/records/chat-snapshot/chat-snapshot';
import { randomId } from '../utils/ids';
import type { ParsedBlock } from './parser/parser';

export async function addToSnapshot(snapshot: ReferencedChatSnapshotRecord, messages: ParsedBlock[]) {
    const currentSnapshot = await snapshot.get();
    const newCells: Cell[] = [];
    for (const message of messages) {
        if (message.type === 'text') {
            newCells.push({
                id: randomId(),
                editedAt: Date.now(),
                type: 'text',
                content: message.content,
            });
        }
        if (message.type === 'tool') {
            newCells.push({
                id: randomId(),
                editedAt: Date.now(),
                type: 'xmlElement',
                content: message.content,
            });
        }
    }
    await snapshot.update({
        messagesData: [
            ...currentSnapshot.messagesData,
            {
                senderId: 'RESPONSE',
                messages: newCells,
            },
        ],
    });
}
