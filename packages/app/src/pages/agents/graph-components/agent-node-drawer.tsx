import { Nodes } from '@abyss/intelligence';
import type { GraphNodeDefinition } from '@abyss/intelligence/dist/state-machine/type-definition.type';
import { Sidebar, SidebarButton, SidebarSection } from '@abyss/ui-components';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

interface AgentNodeDrawerProps {
    onAddNode: (node: GraphNodeDefinition) => void;
}

export function AgentNodeDrawer({ onAddNode }: AgentNodeDrawerProps) {
    return (
        <div className="flex flex-row overflow-hidden h-[100vh]">
            <Sidebar className="bg-[#0e0e0e] border-l border-background-600" title="Agent nodes" width={300}>
                <SidebarSection title="Events" />
                <SidebarButton label="On Chat Message" icon={MessageCircle} onClick={() => onAddNode(Nodes.HelloWorld.getDefinition())} />
            </Sidebar>
        </div>
    );
}
