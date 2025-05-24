import { Cell, CellCode, CellDocument, CellHeader, CellHeader2, CellHeader3, CellText, CellXMLElement, RichDocument } from '@abyss/records';
import { Button, ButtonGroup, ChatMessageText, ChatTurnHeader, PageCrumbed } from '@abyss/ui-components';
import { Bot } from 'lucide-react';
import type { default as React } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { SectionHeader } from '../chats/components/ChatSectionHeader';
import { useSnapshotsPage } from './view-snapshot.hook';

function renderCellText(cell: CellText) {
    return <div key={cell.id + 'content'} className="text-[12px] px-2 pb-2 whitespace-pre-wrap rounded">{cell.content}</div>;
}

function renderCellHeader(cell: CellHeader) {
    return <div key={cell.id + 'content'} className="text-[24px] px-2 pb-2 whitespace-pre-wrap rounded">{cell.content}</div>;
}

function renderCellHeader2(cell: CellHeader2) {
    return <div key={cell.id + 'content'} className="text-[18px] px-2 pb-2 whitespace-pre-wrap rounded">{cell.content}</div>;
}

function renderCellHeader3(cell: CellHeader3) {
    return <div key={cell.id + 'content'} className="text-[16px] px-2 pb-2 whitespace-pre-wrap rounded">{cell.content}</div>;
}

function renderCellXMLElement(cell: CellXMLElement) {
    return <div key={cell.id + 'content'} className="text-[12px] px-2 pb-2 whitespace-pre-wrap rounded">{RichDocument.render([cell]).trim()}</div>;
}

function renderCellCode(cell: CellCode) {
    return <div key={cell.id + 'content'} className="text-[12px] px-2 pb-2 whitespace-pre-wrap rounded">{cell.content}</div>;
}

function renderCellDocument(cell: CellDocument) {
    return <div key={cell.id + 'content'} className="text-xs p-2 pb-2 border bg-background-200 border-background-400 rounded my-2 whitespace-pre-wrap">{renderCells(cell.content.cells)}</div>;
}

function renderCells(cells: Cell[]) {
    const content = cells.map(cell => {
        if (cell.type === 'text') {
            return renderCellText(cell);
        }
        if (cell.type === 'header') {
            return renderCellHeader(cell);
        }
        if (cell.type === 'header2') {
            return renderCellHeader2(cell);
        }
        if (cell.type === 'header3') {
            return renderCellHeader3(cell);
        }
        if (cell.type === 'xmlElement') {
            return renderCellXMLElement(cell);
        }
        if (cell.type === 'code') {
            return renderCellCode(cell);
        }
        if (cell.type === 'document') {
            return renderCellDocument(cell);
        }
    })

    if (!content.length) {
        return null;
    }

    return <div className="whitespace-pre-wrap">
        {content}
    </div>;
}

export function ViewSnapshotPage() {
    const { breadcrumbs, record } = useSnapshotsPage();
    const messages: React.ReactNode[] = [];

    for (let i = 0; i < (record?.data?.messagesData ?? []).length; i++) {
        const message = (record?.data?.messagesData ?? [])[i];
        const content = renderCells(message.messages);

        if (!content) {
            continue;
        }

        messages.push(<div key={i + 'header-padding'} className="h-2" />);
        if (message.senderId === 'RESPONSE') {
            messages.push(<hr key={i + 'hr'} className="my-5 border-primary-400" />);
            messages.push(<ChatTurnHeader icon={Bot}
                label={'MODEL RESPONSE'}
            />)
        } else {
            messages.push(<SectionHeader key={i + 'header'} sender={message.senderId} />);
        }
        messages.push(content);
    }

    return (
        <PageCrumbed
            title={'Chat Snapshot'}
            breadcrumbs={breadcrumbs}
            loading={record === undefined}
            subtitle="This represents the raw text sent to the LLM for a given invoke of the model."
        >
            {messages}
        </PageCrumbed>
    );
}
