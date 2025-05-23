import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessageExecutionReference } from './index';

const meta: Meta<typeof ChatMessageExecutionReference> = {
    title: 'Chat Components/ChatMessageExecutionReference',
    component: ChatMessageExecutionReference,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof ChatMessageExecutionReference>;

export const Running: Story = {
    args: {
        status: 'inProgress',
        agentName: 'Code Assistant',
        onBodyClick: () => console.log('Body clicked'),
        onLogsClick: () => console.log('Logs clicked'),
    },
};

export const Completed: Story = {
    args: {
        status: 'success',
        agentName: 'Code Assistant',
        onBodyClick: () => console.log('Body clicked'),
        onLogsClick: () => console.log('Logs clicked'),
    },
};

export const ErrorState: Story = {
    args: {
        status: 'failed',
        agentName: 'Code Assistant',
        onBodyClick: () => console.log('Body clicked'),
        onLogsClick: () => console.log('Logs clicked'),
    },
};

export const Pending: Story = {
    args: {
        status: 'notStarted',
        agentName: 'Code Assistant',
        onBodyClick: () => console.log('Body clicked'),
        onLogsClick: () => console.log('Logs clicked'),
    },
};
