import { Button, Sidebar, SidebarButton } from '@abyss/ui-components';
import { Plus } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useNotebookMain } from './main.hook';

export function NotebookMainPage() {
    const { sidebarItems, handleCreateCell, handleDeleteCell } = useNotebookMain();
    const navigate = useNavigate();

    return (
        <div className="flex flex-row overflow-hidden h-[100vh]">
            <Sidebar
                className="bg-[#0e0e0e]"
                title="notebooks"
                titleAction={<Button variant="secondary" icon={Plus} onClick={handleCreateCell} />}
                width={300}
            >
                {sidebarItems.map(item => (
                    <SidebarButton
                        key={item.id}
                        label={item.title || ''}
                        icon={item.icon}
                        onClick={() => navigate(item.url)}
                        isActive={location.pathname === item.url}
                        isClosable={true}
                        onClose={() => handleDeleteCell(item.id)}
                    />
                ))}
                {sidebarItems.length === 0 && <div className="text-center text-sm text-gray-500 mt-4">Chats will appear here</div>}
            </Sidebar>
            <div className="w-full h-full overflow-y-auto bg-background-transparent">
                <Outlet />
                {location.pathname === '/notebooks' && (
                    <div className="text-center text-sm text-gray-500 mt-4">Create a new notebook to get started</div>
                )}
            </div>
        </div>
    );
}
