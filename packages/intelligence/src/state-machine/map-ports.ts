import type { GraphNodeDefinition } from './type-definition.type';
import type { PortStates } from './type-execution.type';

export function mapGlobalPortsToLocalPorts(portData: PortStates): PortStates {
    const localPortData: PortStates = {};
    for (const [portId, port] of Object.entries(portData)) {
        const localName = portId.split('::')[2];
        localPortData[localName] = port;
    }
    return localPortData;
}

export function mapLocalPortsToGlobalPorts(portData: PortStates, definition: GraphNodeDefinition): PortStates {
    const graphId = definition.id;
    const globalPortData: PortStates = {};
    for (const [portId, port] of Object.entries(portData)) {
        const globalPortId = `${graphId}::${portId}`;
        globalPortData[globalPortId] = port;
    }
    return globalPortData;
}
