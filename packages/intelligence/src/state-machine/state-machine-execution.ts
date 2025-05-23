import type { LogStream, SQliteClient } from '@abyss/records';
import './node-handlers';
import { mapLocalPortsToGlobalPorts } from './map-ports';
import { NodeHandler } from './node-handler';
import type { AgentGraphDefinition, GraphNodeDefinition } from './type-definition.type';
import type { PortStates, StateMachineExecutionOptions } from './type-execution.type';
import { saveSerialize } from './utils';

export class StateMachineRuntime {
    // Guard the state machine to prevent infinite loops
    private static MAX_INVOKES = 100;
    private invokeCount = 0;

    // Graph itself
    public readonly definition: AgentGraphDefinition;
    private readonly database: SQliteClient;

    // Logging
    private readonly logStream: LogStream;
    private readonly nodeExecutions: string[] = [];

    // Execution
    private evaluatedStaticNodes: Set<string> = new Set();
    private nodeEvaluationQueue: string[] = [];
    private portValues: PortStates = {};

    constructor(params: StateMachineExecutionOptions) {
        this.definition = params.definition;
        this.logStream = params.logStream.child('agent-graph');
        this.database = params.database;
    }

    private checkItteration() {
        if (this.invokeCount > StateMachineRuntime.MAX_INVOKES) {
            this.logStream.error(
                `Max invoke count reached, agent graphs can only invoke nodes ${StateMachineRuntime.MAX_INVOKES} times before stopping to prevent infinite loops`
            );
            throw new Error('Max invoke count reached');
        }
        this.invokeCount++;
    }

    private getNodeDefinition(nodeId: string) {
        const node = this.definition.nodes.find(n => n.id === nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found, but was expected to be resolved`);
        }
        return node;
    }

    private getNodeForPort(portId: string) {
        return this.definition.nodes.find(n => n.ports.some(p => p.id === portId));
    }

    private getPortDefinition(portId: string) {
        const node = this.getNodeForPort(portId);
        if (node) {
            return node.ports.find(p => p.id === portId);
        }
    }

    private getConnectedOutputsToInputPort(portId: string) {
        const connections = this.definition.edges.filter(e => e.sourcePortId === portId);
        return connections.map(c => c.targetPortId);
    }

    private consumePortStates(portStates: PortStates) {
        this.logStream.log('Consuming port states', saveSerialize(portStates));
        for (const [portId, newValue] of Object.entries(portStates)) {
            this.consumePortValue(portId, newValue);
        }
    }

    private consumePortValue(portId: string, newValue: unknown | undefined) {
        const previousValue = this.portValues[portId];
        this.portValues[portId] = newValue;

        const portDefinition = this.getPortDefinition(portId);
        const connectedInputPorts = this.getConnectedOutputsToInputPort(portId);

        this.logStream.log(`Consuming port value ${portId} with new value`);

        // If we are an output port connected to other inputs, set their values
        if (connectedInputPorts.length > 0 && portDefinition?.direction === 'output') {
            connectedInputPorts.forEach(input => {
                this.logStream.log(`Port ${input} is connected to ${portId}, propagating value`);
                this.consumePortValue(input, newValue);
            });
        }

        // If the value entering this port has changed, and it is a signal, if we can find the node, queue it for execution
        if (portDefinition?.direction === 'input' && newValue !== previousValue && newValue) {
            if (portDefinition?.connectionType === 'signal') {
                const node = this.getNodeForPort(portId);
                if (node) {
                    this.logStream.log(`Port ${portId} is a signal and is for node ${node.id}, queueing it for execution`);
                    this.queueNodeExecution(node.id);
                }
            }
        }
    }

    private queueNodeExecution(nodeId: string) {
        if (this.nodeEvaluationQueue.includes(nodeId)) {
            return;
        }
        this.logStream.log(`Queueing node ${nodeId} for execution`);
        this.nodeEvaluationQueue.push(nodeId);
    }

    private getPortDataForNode(nodeId: string) {
        const node = this.definition.nodes.find(n => n.id === nodeId);
        const nodeData: PortStates = {};
        for (const port of node?.ports ?? []) {
            nodeData[port.id] = this.portValues[port.id];
        }
        return nodeData;
    }

    private hasAllPortsForNode(nodeId: string) {
        const node = this.getNodeDefinition(nodeId);
        const portsForNode = this.getPortDataForNode(nodeId);
        const inputPorts = node.ports.filter(p => p.direction === 'input');
        if (inputPorts.length === 0) {
            return true;
        }
        return inputPorts.every(p => portsForNode[p.id] !== undefined);
    }

    private async resolveStaticNodes() {
        let madeProgress = true;
        const staticNodes = this.definition.nodes.filter(n => n.ports.every(p => p.direction !== 'input' && p.connectionType !== 'signal'));
        while (madeProgress) {
            this.logStream.log(`Resolving static nodes, ${staticNodes.length - this.evaluatedStaticNodes.size} nodes left to resolve`, {
                staticNodes: staticNodes.map(n => n.id),
                evaluatedStaticNodes: Array.from(this.evaluatedStaticNodes),
            });
            madeProgress = false;
            for (const node of staticNodes) {
                if (!this.evaluatedStaticNodes.has(node.id)) {
                    const hasAllPorts = this.hasAllPortsForNode(node.id);
                    this.logStream.log(`Checking if node ${node.id} has all ports: ${hasAllPorts}`);
                    if (hasAllPorts) {
                        this.logStream.log(`Resolving static node ${node.id}`);
                        const result = await this.resolveNode(node.id);
                        this.consumePortStates(result.ports);
                        this.evaluatedStaticNodes.add(node.id);
                        madeProgress = true;
                    }
                }
            }
        }
        this.logStream.log(
            `Static nodes resolved, ${this.evaluatedStaticNodes.size} nodes resolved, no more nodes able to resolve statically`
        );
    }

    private async resolveNode(nodeId: string) {
        this.logStream.log(`Executing node ${nodeId}`);
        this.nodeExecutions.push(nodeId);
        const node = this.getNodeDefinition(nodeId);
        const ports = this.getPortDataForNode(nodeId);
        const nodeHandler = NodeHandler.getById(node.type);
        if (!nodeHandler) {
            throw new Error(`Node handler for type ${node.type} not found`);
        }
        const result = await nodeHandler.resolve({
            execution: this,
            node: node,
            inputPorts: ports,
            database: this.database,
            logStream: this.logStream.child(`node-${nodeId}`),
            userParameters: node.parameters || {},
        });
        this.logStream.log(`Node ${nodeId} executed`);
        return result;
    }

    private async progressEvaluationQueue() {
        this.checkItteration();
        const nextNode = this.nodeEvaluationQueue.shift();
        if (!nextNode) {
            this.logStream.log('No more nodes to evaluate, state machine execution complete');
            return;
        }
        const result = await this.resolveNode(nextNode);
        this.consumePortStates(result.ports);

        this.logStream.log(`Node ${nextNode} resolved, checking for more nodes to evaluate`);
        await this.progressEvaluationQueue();
    }

    // Invoke

    public async signal(nodeId: string, portData: PortStates) {
        try {
            await this.logStream.log('Invoking state machine', { inputNode: nodeId });

            // First we are going to evaluate static nodes
            await this.resolveStaticNodes();

            // Set all the values we got as input
            const targetNode = this.getNodeDefinition(nodeId);
            const globalPortData = mapLocalPortsToGlobalPorts(portData, targetNode);
            this.consumePortStates(globalPortData);

            // Progress the evaluation queue
            await this.progressEvaluationQueue();

            this.logStream.log(`State machine execution complete after ${this.nodeExecutions.length} node executions`);
        } catch (error) {
            await this.logStream.error('Failed to invoke state machine', { error: error as Error });
            throw error;
        }
    }
}
