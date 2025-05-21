import { randomId } from '../../utils/ids';
import { NodeHandler } from '../node-handler';
import type { GraphNodePartialDefinition } from '../type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from '../type-execution.type';

export class HelloWorldNode extends NodeHandler {
    constructor() {
        super('helloWorld');
    }

    protected _getDefinition(): GraphNodePartialDefinition {
        return {
            name: 'Hello World',
            icon: 'tool',
            description: 'A simple hello world node',
            color: '#d01010',
            ports: [
                {
                    id: 'trigger',
                    direction: 'input',
                    connectionType: 'signal',
                    dataType: 'signal',
                    name: 'Trigger',
                    description: 'Trigger the hello world node',
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
        data.logStream.log('Hello World Node executed');
        return {
            ports: {
                next: randomId(),
            },
        };
    }
}
