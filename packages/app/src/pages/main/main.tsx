import { IconOption } from '@abyss/ui-components';
import { Box, DatabaseIcon, FileText, MessageCircle, Play, Settings, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AbyssAnimation } from '../../library/abyss-animation';
import { useSidebarFadeStore } from '../../state/sidebar-fade';

export function MainPage() {
    const navigate = useNavigate();
    const [sidebarWidth, setSidebarWidth] = useState('40vw');
    const [contentOpacity, setContentOpacity] = useState(1);
    const { setSidebarFadeable } = useSidebarFadeStore();

    useEffect(() => {
        setSidebarFadeable(true);
    }, []);

    const handleNavigation = (href: string) => {
        setSidebarWidth('150px');
        setContentOpacity(0);
        setTimeout(() => {
            navigate(href, { viewTransition: true });
        }, 1000);
    };

    return (
        <div className="flex h-screen">
            <div
                className="flex flex-col items-center justify-center transition-all duration-[1s] display-font relative"
                style={{ width: sidebarWidth, opacity: contentOpacity }}
            >
                <div className="text-5xl text-center w-full transition-all duration-[1s] absolute top-0 left-0 h-full flex items-center justify-center ">
                    <div className="absolute text-white blur-[4px] opacity-70" style={{ opacity: contentOpacity * 0.7, fontWeight: 900 }}>
                        Abyss
                    </div>
                    <div className="text-text-300 relative" style={{ opacity: contentOpacity, fontWeight: 900 }}>
                        Abyss
                    </div>
                </div>
                <AbyssAnimation />
            </div>

            <div
                className={`p-8 overflow-auto flex-1 flex items-center justify-center transition-all duration-[1s] bg-background-300 ${
                    sidebarWidth === '150px' ? 'w-full' : 'w-[calc(100vw-150px)]'
                } `}
                style={{ paddingLeft: `calc(100vw - calc(60vw + ${sidebarWidth}) + 20px)` }}
            >
                <div className="max-w-2xl w-full space-y-4 transition-all duration-[1s]" style={{ opacity: contentOpacity }}>
                    <IconOption title="Models" icon={Box} onClick={() => handleNavigation('/models')}>
                        Connect to AI models to your choice of AI providers, bring your own key, and own your data.
                    </IconOption>

                    <IconOption title="Documents" icon={FileText} onClick={() => handleNavigation('/documents')}>
                        A rich document cellular editor allows you to work with agents in a collaborative way.
                    </IconOption>

                    <IconOption title="Chats" icon={MessageCircle} onClick={() => handleNavigation('/chats')}>
                        Chat with AI models directly or with custom agents you build and manage locally.
                    </IconOption>

                    <IconOption title="Tools" icon={Wrench} onClick={() => handleNavigation('/tools')}>
                        Connect to MCP servers and leverage their tools or use the built in tools to automate your workflows.
                    </IconOption>

                    <IconOption title="Database" icon={DatabaseIcon} onClick={() => handleNavigation('/database')}>
                        View saved data stored on your machine. All data is stored locally in sqlite and can be accessed by you at any time.
                    </IconOption>
                </div>
            </div>
        </div>
    );
}
