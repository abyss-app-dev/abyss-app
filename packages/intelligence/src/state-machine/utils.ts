import { randomId } from '../utils/ids';
import type { GraphEdgeDefinition, GraphNodeDefinition } from './type-definition.type';

export function connect(nodeA: GraphNodeDefinition, portA: string, nodeB: GraphNodeDefinition, portB: string): GraphEdgeDefinition {
    const sourcePort = nodeA.ports.find(p => p.id.includes(`::${portA}`));
    const targetPort = nodeB.ports.find(p => p.id.includes(`::${portB}`));
    if (!sourcePort || !targetPort) {
        throw new Error(`Port ${portA} or ${portB} not found`);
    }
    return {
        id: `${sourcePort.id}::${targetPort.id}::${randomId()}`,
        sourcePortId: sourcePort.id,
        targetPortId: targetPort.id,
    };
}

export function saveSerialize(data: object): object {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
            result[key] = 'object';
        } else if (typeof value === 'function') {
            result[key] = 'function';
        } else if (Array.isArray(value)) {
            result[key] = value.map(v => saveSerialize(v));
        } else if (value === undefined) {
            result[key] = 'UNDEFINED';
        } else {
            result[key] = value;
        }
    }
    return result;
}
