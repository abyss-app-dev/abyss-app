import type { Meta, StoryObj } from '@storybook/react';
import { BookOpen, Filter, Plus, Search } from 'lucide-react';

// Import components
import { Button } from './inputs/Button/Button';
import { PageNotebook } from './layout/PageNotebook/PageNotebook';

const meta: Meta = {
    title: 'Pages/Notebook',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj;

// Sample notebook data
const sampleNotes = [
    {
        id: 1,
        title: 'Project Planning Notes',
        content:
            'Initial brainstorming session for the new feature development. Key points discussed include user requirements, technical specifications, and timeline considerations.',
        timestamp: '2 hours ago',
        tags: ['work', 'planning'],
        category: 'Work',
    },
    {
        id: 2,
        title: 'Meeting Notes - Q3 Review',
        content:
            'Quarterly review meeting outcomes and action items for the next quarter. Team performance exceeded expectations with 95% goal completion.',
        timestamp: '1 day ago',
        tags: ['meeting', 'quarterly'],
        category: 'Work',
    },
    {
        id: 3,
        title: 'Book Ideas',
        content:
            'Collection of interesting concepts and stories that could make good reading material. Focus on science fiction and technology themes.',
        timestamp: '3 days ago',
        tags: ['personal', 'ideas'],
        category: 'Personal',
    },
    {
        id: 4,
        title: 'Research: AI Applications',
        content:
            'Exploring potential applications of artificial intelligence in various industries. Key areas include healthcare, education, and automation.',
        timestamp: '1 week ago',
        tags: ['research', 'technology'],
        category: 'Research',
    },
];

export const Notebook: Story = {
    render: () => {
        return (
            <PageNotebook
                title="Digital Notebook"
                icon={<BookOpen className="h-5 w-5" />}
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" icon={Filter}>
                            Filter
                        </Button>
                        <Button variant="secondary" icon={Search}>
                            Search
                        </Button>
                        <Button variant="primary" icon={Plus}>
                            New Note
                        </Button>
                    </div>
                }
                header={
                    <div>
                        <p className="text-sm text-text-600 mb-3">Your personal note-taking space</p>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs rounded transition-colors bg-primary-500 text-white font-medium"
                            >
                                All Notes
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs rounded transition-colors bg-background-300 text-text-500 hover:bg-background-400 hover:text-text-300"
                            >
                                Recent
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs rounded transition-colors bg-background-300 text-text-500 hover:bg-background-400 hover:text-text-300"
                            >
                                Favorites
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs rounded transition-colors bg-background-300 text-text-500 hover:bg-background-400 hover:text-text-300"
                            >
                                Tags
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    {sampleNotes.map(note => (
                        <div
                            key={note.id}
                            className="p-4 bg-background-100 rounded-lg border border-background-400 hover:border-primary-300 transition-colors cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">{note.title}</h3>
                                <span className="text-xs text-text-600">{note.timestamp}</span>
                            </div>
                            <p className="text-text-600 text-sm mb-2">{note.content}</p>
                            <div className="flex gap-1">
                                {note.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </PageNotebook>
        );
    },
};
