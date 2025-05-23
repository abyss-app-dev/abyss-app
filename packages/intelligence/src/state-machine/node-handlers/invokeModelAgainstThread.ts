import type { ReferencedMessageThreadRecord } from '@abyss/records';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export class InvokeModelAgainstThreadNode extends NodeHandler {
    constructor() {
        super('invokeModelAgainstThread');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Invoke Model',
            icon: 'Box',
            description: 'Invokes a model against a thread',
            color: '#4CAF50',
            ports: [
                {
                    id: 'trigger',
                    direction: 'input',
                    connectionType: 'signal',
                    dataType: 'signal',
                    name: 'Trigger',
                    description: 'Trigger this node',
                },
                {
                    id: 'thread',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'thread',
                    name: 'Thread',
                    description: 'The thread to invoke the model against',
                },
                {
                    id: 'model',
                    direction: 'input',
                    connectionType: 'data',
                    dataType: 'model',
                    name: 'Model',
                    description: 'The model to invoke',
                },
                {
                    id: 'response',
                    direction: 'output',
                    connectionType: 'data',
                    dataType: 'string',
                    name: 'Response',
                    description: "The model's response",
                },
                {
                    id: 'next',
                    direction: 'output',
                    connectionType: 'signal',
                    dataType: 'signal',
                    name: 'Next',
                    description: 'What to do next',
                },
            ],
        };
    }

    protected async _resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        return {
            ports: {
                response: 'Hello World',
                next: true,
            },
        };
    }
}
