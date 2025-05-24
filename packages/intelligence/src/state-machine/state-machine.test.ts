import { buildTestDB } from '@abyss/records';
import { test } from 'vitest';
import { randomId } from '../utils/ids';
import { HelloWorldNode } from './node-handlers/helloWorldNode';
import { StateMachineRuntime } from './state-machine-execution';
import type { AgentGraphDefinition } from './type-definition.type';
import { connect } from './utils';

test('hello world graph', async () => {
    const database = await buildTestDB();
    const logStream = database.createLogStreamArtifact();

    const helloWorld1 = new HelloWorldNode().getDefinition('helloWorld1');
    const helloWorld2 = new HelloWorldNode().getDefinition('helloWorld2');

    const definition: AgentGraphDefinition = {
        nodes: [helloWorld1, helloWorld2],
        edges: [connect(helloWorld1, 'next', helloWorld2, 'trigger')],
        uiSettings: [],
    };

    const stateMachine = new StateMachineRuntime({ definition, database, logStream, senderId: '123' });
    await stateMachine.signal(helloWorld1.id, {
        trigger: randomId(),
    });
});
