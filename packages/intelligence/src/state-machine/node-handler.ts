import { randomId } from '../utils/ids';
import { mapGlobalPortsToLocalPorts, mapLocalPortsToGlobalPorts } from './map-ports';
import type { GraphNodeDefinition, GraphNodePartialDefinition } from './type-definition.type';
import type { NodeExecutionResult, ResolveNodeData } from './type-execution.type';

// A node handler is a class that handles the execution of a node in the state machine
// It takes in port data and returns resultant port data
export abstract class NodeHandler {
    private id: string;
    private static registry: Record<string, NodeHandler> = {};

    constructor(id: string) {
        this.id = id;
        NodeHandler.registry[id] = this;
    }

    public static getById(id: string): NodeHandler {
        return NodeHandler.registry[id];
    }

    // Definition
    public getDefinition(name?: string): GraphNodeDefinition {
        const definitionPartial = this._getDefinition();
        const nodeId = `${this.id}::${name ?? randomId()}`;
        const completeDefinition: GraphNodeDefinition = {
            id: nodeId,
            type: this.id,
            ...definitionPartial,
            ports: definitionPartial.ports.map(port => ({
                ...port,
                id: `${nodeId}::${port.id}`,
            })),
        };
        return completeDefinition;
    }
    protected abstract _getDefinition(): GraphNodePartialDefinition;

    // Resolution
    async resolve(data: ResolveNodeData): Promise<NodeExecutionResult> {
        const inputPorts = mapGlobalPortsToLocalPorts(data.inputPorts);
        const resolution = await this._resolve({ ...data, inputPorts });
        const outputPorts = mapLocalPortsToGlobalPorts(resolution.ports, data.node);
        return {
            ports: outputPorts,
        };
    }

    protected abstract _resolve(data: ResolveNodeData): Promise<NodeExecutionResult>;
}
