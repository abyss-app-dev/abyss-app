import { type AgentGraphDefinition, type GraphEdgeDefinition, type GraphNodeDefinition, NodeHandler } from '@abyss/intelligence';
import { addEdge, type Connection, useEdgesState, useNodesState } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDatabase } from '@/state/database-access-utils';
import { Database } from '../../main';
import type { RenderedGraphEdge, RenderedGraphNode } from './graph-components/graph.types';

export function useViewAgent() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Agent data
    const agent = useDatabase.agentGraph.record(id || '');
    const [hasDoneInitialLoad, setHasDoneInitialLoad] = useState(false);

    // Graph data
    const [nodes, setNodes, onNodesChange] = useNodesState<RenderedGraphNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<RenderedGraphEdge>([]);

    // Conversions

    const dbToRenderedGraphNode = (graph: AgentGraphDefinition, graphNodeId: string): RenderedGraphNode | null => {
        const graphNode = graph.nodes.find(node => node.id === graphNodeId);
        if (!graphNode) {
            throw new Error(`Node not found in graph: ${graphNodeId}`);
        }
        const nodeHandler = NodeHandler.getById(graphNode.type);
        if (!nodeHandler) {
            throw new Error(`Node handler not found for node: ${graphNode.type}`);
        }
        const uiSetting = (graph.uiSettings || []).find(setting => setting.nodeId === graphNodeId);
        return {
            id: graphNodeId,
            type: 'custom',
            position: { x: uiSetting?.positionX ?? 0, y: uiSetting?.positionY ?? 0 },
            data: { label: graphNode.name, definition: graphNode },
        };
    };

    const dbToRenderedGraphEdge = (graph: AgentGraphDefinition, edge: GraphEdgeDefinition): RenderedGraphEdge | null => {
        const edgeSourceNode = edge.sourcePortId.split('::').splice(0, 2).join('::');
        const edgeTargetNode = edge.targetPortId.split('::').splice(0, 2).join('::');
        const sourceNode = graph.nodes.find(node => node.id === edgeSourceNode);
        if (!sourceNode) {
            throw new Error(`Source node not found for edge: ${edge.sourcePortId}`);
        }
        const targetNode = graph.nodes.find(node => node.id === edgeTargetNode);
        if (!targetNode) {
            throw new Error(`Target node not found for edge: ${edge.targetPortId}`);
        }
        const isSignal = targetNode.ports.find(port => port.id === edge.targetPortId)?.connectionType === 'signal';

        return {
            id: edge.id,
            source: edgeSourceNode,
            sourceHandle: edge.sourcePortId,
            target: edgeTargetNode,
            targetHandle: edge.targetPortId,
            type: 'custom',
            data: {
                isSignal,
                targetColor: targetNode.color,
                definition: edge,
            },
        };
    };

    const renderedToDbNode = (node: RenderedGraphNode): GraphNodeDefinition => {
        return node.data.definition;
    };

    const renderedToDbEdge = (edge: RenderedGraphEdge): GraphEdgeDefinition => {
        return edge.data.definition;
    };

    // Database updates

    const handleUpdateAgent = useCallback(
        (data: Partial<AgentGraphDefinition>) => {
            if (agent && id) {
                Database.tables.agentGraph.ref(id).update({ serialzedData: data });
            }
        },
        [agent, id]
    );

    const handleUpdateAgentName = useCallback(
        (name: string) => {
            if (agent && id) {
                Database.tables.agentGraph.ref(id).update({ name });
            }
        },
        [handleUpdateAgent, id, agent]
    );

    const saveGraphStateToDb = useCallback(
        (currentNodes: RenderedGraphNode[], currentEdges: RenderedGraphEdge[]) => {
            if (agent && id) {
                handleUpdateAgent({
                    nodes: currentNodes.map(renderedToDbNode),
                    edges: currentEdges.map(renderedToDbEdge),
                    uiSettings: currentNodes.map(node => ({
                        nodeId: node.id,
                        positionX: node.position.x,
                        positionY: node.position.y,
                    })),
                });
            }
        },
        [agent, id, handleUpdateAgent]
    );

    // Graph data updates

    useEffect(() => {
        if (agent?.data && nodes.length === 0 && edges.length === 0 && !hasDoneInitialLoad) {
            const renderedNodes: RenderedGraphNode[] = [];
            const renderedEdges: RenderedGraphEdge[] = [];
            const graph = agent.data.serialzedData as AgentGraphDefinition;
            for (const node of graph.nodes || []) {
                const renderedNode = dbToRenderedGraphNode(graph, node.id);
                if (renderedNode) {
                    renderedNodes.push(renderedNode);
                }
            }
            for (const edge of graph.edges || []) {
                const renderedEdge = dbToRenderedGraphEdge(graph, edge);
                if (renderedEdge) {
                    renderedEdges.push(renderedEdge);
                }
            }
            setNodes(renderedNodes);
            setEdges(renderedEdges);
            setHasDoneInitialLoad(true);
        }
    }, [agent]);

    useEffect(() => {
        if (agent?.data && hasDoneInitialLoad) {
            saveGraphStateToDb(nodes, edges);
        }
    }, [nodes, edges]);

    const handleAddNode = useCallback(
        (node: GraphNodeDefinition) => {
            const newNode: RenderedGraphNode = {
                id: node.id,
                position: { x: 0, y: 0 },
                data: {
                    label: node.name,
                    definition: node,
                },
                type: 'custom',
            };
            setNodes(nds => {
                const nodes = [...nds, newNode];
                return nodes;
            });
        },
        [setNodes]
    );

    // Handle node deletion
    const onNodesDelete = useCallback(
        (deletedNodes: RenderedGraphNode[]) => {
            const deletedNodeIds = new Set(deletedNodes.map(node => node.id));
            setEdges(edges => {
                const newEdges = edges.filter(edge => !deletedNodeIds.has(edge.source) && !deletedNodeIds.has(edge.target));
                return newEdges;
            });
        },
        [setEdges]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            const sourceNode = nodes.find(node => node.id === connection.source);
            const sourceHandleLocalId = connection.sourceHandle;
            const targetNode = nodes.find(node => node.id === connection.target);
            const targetHandleLocalId = connection.targetHandle;
            const sourceHandle = sourceNode?.data.definition.ports.find(port => port.id === sourceHandleLocalId)?.connectionType;
            const targetHandle = targetNode?.data.definition.ports.find(port => port.id === targetHandleLocalId)?.connectionType;
            if (sourceHandle !== targetHandle) {
                console.error('Source and target handle types do not match:', {
                    sourceHandleId: sourceHandleLocalId,
                    sourceNode,
                    sourceHandle,
                    targetHandleId: targetHandleLocalId,
                    targetNode,
                    targetHandle,
                });
                return;
            }
            const isTargetSignal = targetHandle === 'signal';
            setEdges(eds => {
                const newEdges = addEdge(
                    {
                        ...connection,
                        type: 'custom',
                        data: {
                            isSignal: isTargetSignal,
                            targetColor: targetNode?.data.definition.color || '',
                            definition: {
                                id: Math.random().toString(36).substring(2, 15),
                                sourcePortId: connection.sourceHandle || '',
                                targetPortId: connection.targetHandle || '',
                            },
                        },
                    },
                    eds
                );
                return newEdges;
            });
        },
        [setEdges, nodes]
    );

    return {
        agent,
        handleUpdateAgent,
        navigate,
        handleAddNode,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodesDelete,
        handleUpdateAgentName,
    };
}
