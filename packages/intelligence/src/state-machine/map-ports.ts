import type { GraphNodeDefinition } from './type-definition.type';
import type { PortStates } from './type-execution.type';

export function mapGlobalPortsToLocalPorts(portData: PortStates): PortStates {
    const localPortData: PortStates = {};
    for (const [portId, port] of Object.entries(portData)) {
        const localName = portId.split('::')[1];
        localPortData[localName] = port;
    }
    return localPortData;
}

export function mapLocalPortsToGlobalPorts(portData: PortStates, definition: GraphNodeDefinition): PortStates {
    const graphId = definition.id.split('::')[0];
    const globalPortData: PortStates = {};
    for (const [portId, port] of Object.entries(portData)) {
        const portPrefix = `${graphId}::${portId}::`;
        const targetPortId = definition.ports.find(p => p.id.startsWith(portPrefix))?.id;
        if (!targetPortId) {
            throw new Error(`Output port ${portId} not found in definition, ${JSON.stringify(definition)}`);
        }
        globalPortData[targetPortId] = port;
    }
    return globalPortData;
}
