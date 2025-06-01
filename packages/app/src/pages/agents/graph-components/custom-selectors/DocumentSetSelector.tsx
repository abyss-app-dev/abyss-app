import type { UserDocumentsetConfig } from '@abyss/intelligence';
import { type NotebookPageCellProperties, SqliteTable } from '@abyss/records';
import { useDatabaseTableQuery } from '@abyss/state-store';
import { CheckIcon, FileTextIcon, SquareDashedIcon } from 'lucide-react';
import React from 'react';

export interface DocumentSetSelectorProps {
    color: string;
    onSelect: (value: string) => void;
    value: string;
}

const parseDocumentConfig = (value: string): UserDocumentsetConfig => {
    try {
        return JSON.parse(value);
    } catch (_e) {
        return { documents: [] };
    }
};

export function DocumentSetSelector(props: DocumentSetSelectorProps) {
    const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>(
        props.value ? parseDocumentConfig(props.value).documents.map(doc => doc.id) : []
    );
    const { data: cells } = useDatabaseTableQuery(SqliteTable.notebookCell, async cells => cells.getRootCells());

    // Filter only page-type cells (notebooks)
    const notebooks = (cells || []).filter(cell => cell.type === 'page');

    const handleDocumentToggle = (documentId: string) => {
        const newSelectedDocuments = selectedDocuments.includes(documentId)
            ? selectedDocuments.filter(id => id !== documentId)
            : [...selectedDocuments, documentId];
        setSelectedDocuments(newSelectedDocuments);
        const documentConfig: UserDocumentsetConfig = {
            documents: newSelectedDocuments.map(id => ({ id })),
        };
        props.onSelect(JSON.stringify(documentConfig));
    };

    React.useEffect(() => {
        if (props.value) {
            try {
                setSelectedDocuments(parseDocumentConfig(props.value).documents.map(doc => doc.id));
            } catch (_e) {
                setSelectedDocuments([]);
            }
        }
    }, [props.value]);

    return (
        <div className="w-full">
            <div className="flex flex-wrap flex-row gap-2 max-h-48 overflow-y-auto mb-2">
                {!notebooks || notebooks.length === 0 ? (
                    <div className="p-2 text-xs">No notebooks available</div>
                ) : (
                    notebooks.map(notebook => {
                        const isSelected = selectedDocuments.includes(notebook.id);
                        const cellData: NotebookPageCellProperties = notebook.propertyData as NotebookPageCellProperties;
                        const title = cellData?.title || 'Untitled Notebook';

                        return (
                            <div
                                key={notebook.id}
                                className={`flex gap-2 px-2 items-center justify-between w-fit p-1 cursor-pointer transition-colors duration-150 rounded-sm border ${
                                    isSelected
                                        ? 'bg-primary-100 border-primary-200 hover:bg-primary-200'
                                        : 'border-transparent hover:bg-background-200'
                                }`}
                                onClick={() => handleDocumentToggle(notebook.id)}
                            >
                                <div className="flex items-center">
                                    {isSelected ? (
                                        <CheckIcon size={10} className="text-primary-500" />
                                    ) : (
                                        <SquareDashedIcon size={10} className="text-text-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileTextIcon size={8} className="text-text-400" />
                                    <div className="text-[8px] font-medium">{title}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
