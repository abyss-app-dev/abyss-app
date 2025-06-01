import { Book, ChevronLeft, Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export interface PageNotebookProps {
    /**
     * Notebook title
     */
    title: string;
    /**
     * Optional icon for the notebook
     */
    icon?: React.ReactNode;
    /**
     * Optional actions to display (right-aligned with title)
     */
    actions?: React.ReactNode;
    /**
     * Optional header content (directly under the title)
     */
    header?: React.ReactNode;
    /**
     * Content of the notebook body
     */
    children?: React.ReactNode;
    /**
     * Whether the notebook content is in a loading state
     */
    loading?: boolean;
    /**
     * Whether the title is editable
     */
    isEditable?: boolean;
    /**
     * Callback when title changes
     */
    onTitleChange?: (newTitle: string) => void;
    /**
     * Last page navigation option
     */
    lastPage?: {
        name: string;
        onClick: () => void;
    };
}

export const PageNotebook: React.FC<PageNotebookProps> = ({
    title,
    icon,
    actions,
    header,
    children,
    loading = false,
    isEditable = false,
    onTitleChange,
    lastPage,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(title);
    }, [title]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleTitleClick = () => {
        if (isEditable) {
            setIsEditing(true);
            setEditValue(title);
        }
    };

    const handleSave = () => {
        if (onTitleChange && editValue.trim()) {
            onTitleChange(editValue.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(title);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="flex flex-col text-text-300 h-full w-full bg-background-300 overflow-hidden base-font p-6">
            <div className="">
                {lastPage && (
                    <div className="mb-2">
                        <button
                            type="button"
                            onClick={lastPage.onClick}
                            className="flex items-center text-sm text-text-400 hover:text-primary-500 transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {lastPage.name}
                        </button>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        {icon ? <div className="mr-2">{icon}</div> : <Book className="mr-2 h-5 w-5" />}
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                className="text-xl font-bold bg-none border-none border-none outline-none text-text-300 bg-background-200"
                            />
                        ) : (
                            <h1
                                className={`text-xl font-bold ${isEditable ? 'cursor-pointer hover:text-primary-500' : ''}`}
                                onClick={handleTitleClick}
                            >
                                {title}
                            </h1>
                        )}
                    </div>
                    {actions && <div className="flex">{actions}</div>}
                </div>
                <div className="my-3">{header}</div>
            </div>
            <hr className="border-background-400" />
            <div className="flex-1 overflow-y-auto scrollbar-gutter-stable pt-2">
                <div className="py-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        children
                    )}
                </div>
                <div className="h-[200px]" />
            </div>
        </div>
    );
};

export default PageNotebook;
