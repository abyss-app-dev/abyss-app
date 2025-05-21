import type { LogStream, SQliteClient } from '@abyss/records';
import type { StateMachineRuntime } from './state-machine-execution';
import type { AgentGraphDefinition, GraphNodeDefinition } from './type-definition.type';

export interface PortStates {
    [portId: string]: unknown | undefined;
}

export interface ResolveNodeData {
    execution: StateMachineRuntime;
    node: GraphNodeDefinition;
    inputPorts: PortStates;
    database: SQliteClient;
    logStream: LogStream;
}

export interface NodeExecutionResult {
    ports: PortStates;
}

export interface StateMachineExecutionOptions {
    logStream: LogStream;
    definition: AgentGraphDefinition;
    database: SQliteClient;
}
