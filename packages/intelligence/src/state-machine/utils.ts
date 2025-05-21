import { randomId } from '../utils/ids';
import type { GraphEdgeDefinition, GraphNodeDefinition } from './type-definition.type';

export function connect(nodeA: GraphNodeDefinition, portA: string, nodeB: GraphNodeDefinition, portB: string): GraphEdgeDefinition {
    const sourcePort = nodeA.ports.find(p => p.id.includes(`::${portA}::`));
    const targetPort = nodeB.ports.find(p => p.id.includes(`::${portB}::`));
    if (!sourcePort || !targetPort) {
        throw new Error(`Port ${portA} or ${portB} not found`);
    }
    return {
        id: `${sourcePort.id}::${targetPort.id}::${randomId()}`,
        sourcePortId: sourcePort.id,
        targetPortId: targetPort.id,
    };
}
