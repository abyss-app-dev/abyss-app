import { Nodes } from '@abyss/intelligence';
import type { GraphNodeDefinition } from '@abyss/intelligence/dist/state-machine/type-definition.type';
import { Sidebar, SidebarButton, SidebarSection } from '@abyss/ui-components';
import { ArrowRight, CircleDot, HammerIcon, MessageCircle, Sparkles } from 'lucide-react';

interface AgentNodeDrawerProps {
    onAddNode: (node: GraphNodeDefinition) => void;
}

export function AgentNodeDrawer({ onAddNode }: AgentNodeDrawerProps) {
    return (
        <div className="flex flex-row overflow-hidden h-[100vh]">
            <Sidebar className="bg-[#0e0e0e] border-l border-background-600" title="Agent nodes" width={300}>
                <SidebarSection title="Events" />
                <SidebarButton
                    label="On Chat Message"
                    icon={MessageCircle}
                    onClick={() => onAddNode(Nodes.OnThreadMessage.getDefinition())}
                />

                <SidebarSection title="Threads" />
                <SidebarButton
                    label="Add System Message"
                    icon={MessageCircle}
                    onClick={() => onAddNode(Nodes.AddSystemMessageToThread.getDefinition())}
                />
                <SidebarButton
                    label="Add Agent Message"
                    icon={MessageCircle}
                    onClick={() => onAddNode(Nodes.AddAgentMessageToThread.getDefinition())}
                />
                <SidebarButton
                    label="Add Human Message"
                    icon={MessageCircle}
                    onClick={() => onAddNode(Nodes.AddHumanMessageToThread.getDefinition())}
                />

                <SidebarSection title="Tools" />
                <SidebarButton label="Reference Toolset" icon={CircleDot} onClick={() => onAddNode(Nodes.ConstToolset.getDefinition())} />
                <SidebarButton
                    label="Set Thread Tools"
                    icon={HammerIcon}
                    onClick={() => onAddNode(Nodes.SetToolsInThread.getDefinition())}
                />

                <SidebarSection title="Models" />
                <SidebarButton label="Reference Model" icon={CircleDot} onClick={() => onAddNode(Nodes.ConstModel.getDefinition())} />
                <SidebarButton
                    label="Invoke Model"
                    icon={Sparkles}
                    onClick={() => onAddNode(Nodes.InvokeModelAgainstThread.getDefinition())}
                />

                <SidebarSection title="Others" />
                <SidebarButton label="String" icon={CircleDot} onClick={() => onAddNode(Nodes.ConstString.getDefinition())} />
            </Sidebar>
        </div>
    );
}
