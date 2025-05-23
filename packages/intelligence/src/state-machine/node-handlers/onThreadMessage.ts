import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult } from '../type-execution.type';

export class OnThreadMessageNode extends NodeHandler {
    constructor() {
        super('onThreadMessage');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'On Thread Message',
            icon: 'MessageCircle',
            description: 'Triggered after a user message is sent to a thread with this agent',
            color: '#FFA500',
            ports: [
                {
                    id: 'thread',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'thread',
                    name: 'Thread',
                    description: 'The thread that the message was sent to',
                },
                {
                    id: 'onThreadMessage',
                    direction: 'output',
                    connectionType: 'signal',
                    dataType: 'signal',
                    name: 'On Thread Message',
                    description: 'What to do when a user message is sent to a thread with this agent',
                },
            ],
        };
    }

    protected async _resolve(): Promise<NodeExecutionResult> {
        throw new Error('Signal nodes should never be resolved, they are only used to trigger the state machine');
    }
}
