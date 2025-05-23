import type { GraphEdgeDefinition, GraphNodeDefinition } from '@abyss/intelligence/dist/state-machine/type-definition.type';

export interface RenderedGraphNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
        label: string;
        definition: GraphNodeDefinition;
    };
}

export interface RenderedGraphEdge {
    id: string;
    type: string;
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
    data: {
        isSignal: boolean;
        targetColor: string;
        definition: GraphEdgeDefinition;
    };
}
