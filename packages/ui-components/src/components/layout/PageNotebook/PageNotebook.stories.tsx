import type { Meta, StoryObj } from '@storybook/react';
import { Code, FileText, Image, Save, Settings } from 'lucide-react';
import { BrowserRouter } from 'react-router-dom';
import Button from '../../inputs/Button';
import PageNotebook from './PageNotebook';

// Meta information for the component
const meta: Meta<typeof PageNotebook> = {
    title: 'Layout/PageNotebook',
    component: PageNotebook,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        Story => (
            <BrowserRouter>
                <Story />
            </BrowserRouter>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof PageNotebook>;

// Basic notebook example
export const Default: Story = {
    args: {
        title: 'My Notebook',
        children: (
            <div className="space-y-4">
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Note 1</h3>
                    <p className="text-text-600">This is the first note in the notebook.</p>
                </div>
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Note 2</h3>
                    <p className="text-text-600">This is the second note in the notebook.</p>
                </div>
            </div>
        ),
    },
};

// Simple notebook
export const Simple: Story = {
    args: {
        title: 'Project Notebook',
        header: <p className="text-sm text-text-600">Development notes and documentation</p>,
        children: (
            <div className="space-y-4">
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Development Notes</h3>
                    <p className="text-text-600">Important notes about the project development process.</p>
                </div>
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Meeting Notes</h3>
                    <p className="text-text-600">Summary of today's team meeting.</p>
                </div>
            </div>
        ),
    },
};

// Notebook with complex header
export const WithComplexHeader: Story = {
    args: {
        title: 'Research Notebook',
        header: (
            <div>
                <p className="text-sm text-text-600 mb-3">Organized research and findings</p>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 p-2 bg-background-100 rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Research Notes</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-background-100 rounded">
                        <Image className="h-4 w-4" />
                        <span className="text-sm">Images</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-background-100 rounded">
                        <Code className="h-4 w-4" />
                        <span className="text-sm">Code Snippets</span>
                    </div>
                </div>
            </div>
        ),
        children: (
            <div className="space-y-4">
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Research Topic 1</h3>
                    <p className="text-text-600">Detailed research findings and analysis.</p>
                </div>
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Research Topic 2</h3>
                    <p className="text-text-600">Additional research with supporting data.</p>
                </div>
            </div>
        ),
    },
};

// Notebook with custom icon and actions
export const WithIconAndActions: Story = {
    args: {
        title: 'Lab Notebook',
        icon: <Settings className="h-5 w-5" />,
        actions: (
            <div className="flex gap-2">
                <Button variant="secondary">Export</Button>
                <Button icon={Save}>Save</Button>
            </div>
        ),
        header: <p className="text-sm text-text-600">Experimental data and observations</p>,
        children: (
            <div className="space-y-4">
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Experiment #001</h3>
                    <p className="text-text-600">Initial testing results and observations.</p>
                </div>
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Experiment #002</h3>
                    <p className="text-text-600">Follow-up experiment with modified parameters.</p>
                </div>
            </div>
        ),
    },
};

// Loading state
export const Loading: Story = {
    args: {
        title: 'Loading Notebook',
        header: <p className="text-sm text-text-600">This notebook is currently loading its content</p>,
        loading: true,
        children: <div className="p-4 bg-background-100 rounded">This content will not be shown while loading</div>,
    },
};

// Editable title
export const EditableTitle: Story = {
    args: {
        title: 'Click to Edit Title',
        isEditable: true,
        onTitleChange: (newTitle: string) => console.log('Title changed to:', newTitle),
        header: <p className="text-sm text-text-600">Click the title above to edit it</p>,
        children: (
            <div className="space-y-4">
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Editable Title Demo</h3>
                    <p className="text-text-600">The title can be edited by clicking on it. Press Enter to save, Escape to cancel.</p>
                </div>
            </div>
        ),
    },
};

// With last page navigation
export const WithLastPage: Story = {
    args: {
        title: 'Chapter 2: Advanced Topics',
        lastPage: {
            name: 'Chapter 1: Introduction',
            onClick: () => console.log('Navigate to previous page'),
        },
        header: <p className="text-sm text-text-600">Navigate back to the previous chapter</p>,
        children: (
            <div className="space-y-4">
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Advanced Concepts</h3>
                    <p className="text-text-600">This chapter builds upon the concepts from Chapter 1.</p>
                </div>
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Complex Examples</h3>
                    <p className="text-text-600">More detailed examples and use cases.</p>
                </div>
            </div>
        ),
    },
};

// Full featured example with last page
export const FullFeatured: Story = {
    args: {
        title: 'Project Documentation',
        icon: <FileText className="h-5 w-5" />,
        lastPage: {
            name: 'Project Overview',
            onClick: () => console.log('Navigate back to overview'),
        },
        actions: (
            <div className="flex gap-2">
                <Button variant="secondary">Share</Button>
                <Button icon={Save}>Save</Button>
            </div>
        ),
        header: (
            <div>
                <p className="text-sm text-text-600 mb-3">Complete project documentation with all features</p>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 p-2 bg-background-100 rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Documentation</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-background-100 rounded">
                        <Code className="h-4 w-4" />
                        <span className="text-sm">Code Examples</span>
                    </div>
                </div>
            </div>
        ),
        isEditable: true,
        onTitleChange: (newTitle: string) => console.log('Title changed to:', newTitle),
        children: (
            <div className="space-y-4">
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Getting Started</h3>
                    <p className="text-text-600">Basic setup and configuration instructions.</p>
                </div>
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">API Reference</h3>
                    <p className="text-text-600">Complete API documentation and examples.</p>
                </div>
                <div className="p-4 bg-background-100 rounded">
                    <h3 className="font-semibold mb-2">Troubleshooting</h3>
                    <p className="text-text-600">Common issues and their solutions.</p>
                </div>
            </div>
        ),
    },
};
