// Every connection has a data type that is used to determine if it is valid
export type GraphDataType = 'string' | 'number' | 'boolean' | 'thread' | 'model' | 'signal' | 'tools';

// Signal ports trigger the nodes themselves
// Where as data ports are used to pass data between nodes
export type GraphPortType = 'data' | 'signal';

// Data can flow in one direction or the other
export type GraphPortDirection = 'input' | 'output';

// Data communicates through ports to determine what is valid
export interface GraphPortDefinition {
    id: string;
    direction: GraphPortDirection;
    connectionType: GraphPortType;
    dataType: GraphDataType;
    name: string;
    description?: string;
    userConfigurable?: boolean | undefined;
}

export interface GraphNodeDefinition {
    id: string;
    type: string;

    // Display
    icon: string;
    name: string;
    description: string;
    color: string;

    // User configurable parameters
    parameters?: Record<string, string>;

    // Ports
    ports: GraphPortDefinition[];
}

export interface GraphEdgeDefinition {
    id: string;
    sourcePortId: string;
    targetPortId: string;
}

export interface UISetting {
    nodeId: string;
    positionX: number;
    positionY: number;
}

export interface AgentGraphDefinition {
    nodes: GraphNodeDefinition[];
    edges: GraphEdgeDefinition[];
    uiSettings: UISetting[];
}

export interface GraphNodePartialDefinition {
    name: string;
    description: string;
    icon: string;
    color: string;
    ports: GraphPortPartialDefinition[];
}

export interface GraphPortPartialDefinition {
    id: string;
    direction: GraphPortDirection;
    connectionType: GraphPortType;
    dataType: GraphDataType;
    name: string;
    description?: string;
    userConfigurable?: boolean | undefined;
}
