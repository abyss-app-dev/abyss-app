import { Handle, Position, useReactFlow } from '@xyflow/react';
import { XIcon } from 'lucide-react';
import type React from 'react';
import { SelectForAgentGraph } from './agent-graph-inputs';
import type { RenderedGraphNode } from './graph.types';
import { DynamicIcon } from './ids-to-icons';

export function CustomAgentGraphNode({ id, data }: { id: string; data: RenderedGraphNode['data'] }) {
    const inputSignals: React.ReactNode[] = [];
    const outputSignals: React.ReactNode[] = [];
    const leftHandles: React.ReactNode[] = [];
    const rightHandles: React.ReactNode[] = [];
    const { deleteElements, updateNodeData } = useReactFlow();

    const color = data.definition.color;

    // Get all nodes
    const inputPorts = data.definition.ports.filter(port => port.direction === 'input');
    const outputPorts = data.definition.ports.filter(port => port.direction === 'output');

    // First all the signal nodes
    const inputSignalPorts = inputPorts.filter(port => port.connectionType === 'signal');
    const outputSignalPorts = outputPorts.filter(port => port.connectionType === 'signal');
    const hasAnySignals = inputSignalPorts.length > 0 || outputSignalPorts.length > 0;

    for (const input of inputSignalPorts) {
        inputSignals.push(
            <div className="flex flex-col gap-1 relative" key={input.id}>
                <div className="text-[8px] text-text-500 px-2 relative flex flex-row gap-1 justify-start">
                    {input.name}
                    <Handle
                        className="bg-background-300 border-background-900"
                        style={{ borderColor: color, height: '12px', borderRadius: '5px' }}
                        type="target"
                        position={Position.Left}
                        id={input.id}
                    />
                </div>
                <div className="text-[6px] text-text-500 px-2">{input.description}</div>
            </div>
        );
    }

    for (const output of outputSignalPorts) {
        outputSignals.push(
            <div className="flex flex-col gap-1 relative" key={output.id}>
                <div className="text-[8px] text-text-500 px-2 flex flex-row gap-1 justify-end relative">
                    {output.name}
                    <Handle
                        className="bg-background-300 border-background-900"
                        type="source"
                        position={Position.Right}
                        id={output.id}
                        style={{ borderColor: color, height: '12px', borderRadius: '5px' }}
                    />
                </div>
                <div className="text-[6px] text-text-500 px-2">{output.description}</div>
            </div>
        );
    }

    // Then all non-signal ports

    const inputDataPorts = inputPorts.filter(port => port.connectionType === 'data');
    const outputDataPorts = outputPorts.filter(port => port.connectionType === 'data');

    for (const input of inputDataPorts) {
        leftHandles.push(
            <div className="flex flex-col gap-1 relative" key={input.id}>
                <div className="text-[8px] text-text-500 px-2 relative flex flex-row gap-1 justify-start">
                    {input.name} <pre className="opacity-70">({input.dataType})</pre>
                    <Handle className="bg-background-300 border-background-900" type="target" position={Position.Left} id={input.id} />
                </div>
                <div className="text-[6px] text-text-500 px-2">{input.description}</div>
            </div>
        );
    }

    for (const output of outputDataPorts) {
        if (output.userConfigurable) {
            rightHandles.push(
                <div className="flex flex-col gap-1 relative" key={output.id}>
                    <div className="text-[8px] text-text-500 px-2 flex flex-row items-center gap-1 justify-end relative">
                        <SelectForAgentGraph
                            port={output}
                            onSelect={value => {
                                const newObject = JSON.parse(JSON.stringify(data.definition));
                                newObject.parameters = newObject.parameters || {};
                                newObject.parameters[output.id] = value;
                                updateNodeData(id, {
                                    ...data,
                                    definition: newObject,
                                });
                            }}
                            value={data.definition.parameters?.[output.id]}
                            color={color}
                        />
                        <Handle
                            className="bg-background-300 border-background-900"
                            type="source"
                            position={Position.Right}
                            id={output.id}
                        />
                    </div>
                    <div className="text-[6px] text-text-500 px-2">{output.description}</div>
                </div>
            );
        } else {
            rightHandles.push(
                <div className="flex flex-col gap-1 relative" key={output.id}>
                    <div className="text-[8px] text-text-500 px-2 flex flex-row gap-1 justify-end relative">
                        {output.name} <pre className="opacity-70">({output.dataType})</pre>
                        <Handle
                            className="bg-background-300 border-background-900"
                            type="source"
                            position={Position.Right}
                            id={output.id}
                        />
                    </div>
                    <div className="text-[6px] text-text-500 px-2">{output.description}</div>
                </div>
            );
        }
    }

    const handleDelete = () => {
        deleteElements({ nodes: [{ id: data.definition.id }] });
    };

    return (
        <div className="bg-background-200 rounded-md">
            <div
                className="border rounded-md"
                style={{
                    backgroundColor: `${data.definition.color}10`,
                    borderColor: `${data.definition.color}70`,
                }}
            >
                <div className="flex flex-col border-b gap-1 p-1 min-w-[300px]" style={{ borderColor: `${data.definition.color}70` }}>
                    <div className="text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DynamicIcon name={data.definition.icon} className="w-4 h-4" color={data.definition.color} />
                            <div className="">{data.definition.name}</div>
                        </div>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="rounded-sm hover:bg-background-300 text-text-500 hover:text-text-100 hover:bg-background-400"
                        >
                            <XIcon className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="text-[8px] text-text-500 mx-6 max-w-[300px]">{data.definition.description}</div>
                </div>
                {hasAnySignals && (
                    <div
                        className="flex flex-row gap-2 relative my-1 w-full border-b py-2"
                        style={{ borderColor: `${data.definition.color}70` }}
                    >
                        {inputSignals.length > 0 && <div className="flex flex-col gap-2 flex-1">{inputSignals}</div>}
                        {outputSignals.length > 0 && <div className="flex flex-col gap-2 flex-1 text-right">{outputSignals}</div>}
                    </div>
                )}
                <div className="flex flex-row gap-2 relative my-1 mt-2 w-full">
                    {leftHandles.length > 0 && <div className="flex flex-col gap-2 flex-1">{leftHandles}</div>}
                    {rightHandles.length > 0 && <div className="flex flex-col gap-2 flex-1 text-right">{rightHandles}</div>}
                </div>
            </div>
        </div>
    );
}
