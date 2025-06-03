import { Button, IconSection, Input, PageCrumbed } from '@abyss/ui-components';
import { Box, List, Plus, Save, Settings, Terminal, Trash } from 'lucide-react';
import { useState } from 'react';
import { Database } from '@/main';
import { useAddMcpPage } from './add-mcp.hook';

export function AddMcpPage() {
    const { breadcrumbs, navigate } = useAddMcpPage();
    const [name, setName] = useState('');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState<string[]>([]);
    const [env, setEnv] = useState<Record<string, string>>({});

    const handleSave = () => {
        Database.tables.mcpConnection
            .create({
                name,
                configData: {
                    type: 'stdio',
                    command,
                    args,
                    env,
                },
            })
            .then(() => {
                navigate('/tools');
            });
    };

    return (
        <PageCrumbed title="Add MCP Connection" breadcrumbs={breadcrumbs}>
            <IconSection title="Name" subtitle="The name for your MCP connection" icon={Box}>
                <Input label="Name" value={name} onChange={value => setName(value)} />
            </IconSection>

            <IconSection title="Command" subtitle="The command to run for this MCP connection" icon={Terminal}>
                <Input label="Command" value={command} onChange={value => setCommand(value)} />
            </IconSection>

            <IconSection title="Arguments" subtitle="Optional arguments to pass to the command" icon={List}>
                <div className="flex flex-col gap-2">
                    {args.map((arg, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={arg}
                                onChange={value => {
                                    const newArgs = [...args];
                                    newArgs[index] = value;
                                    setArgs(newArgs);
                                }}
                            />
                            <Button
                                variant="secondary"
                                icon={Trash}
                                onClick={() => {
                                    const newArgs = args.filter((_, i) => i !== index);
                                    setArgs(newArgs);
                                }}
                            />
                        </div>
                    ))}
                    <Button variant="secondary" icon={Plus} onClick={() => setArgs([...args, ''])}>
                        Add Argument
                    </Button>
                </div>
            </IconSection>

            <IconSection title="Environment Variables" subtitle="Optional environment variables for the command" icon={Settings}>
                <div className="flex flex-col gap-2">
                    {Object.entries(env).map(([key, value], index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder="Key"
                                value={key}
                                onChange={newKey => {
                                    const newEnv = { ...env };
                                    delete newEnv[key];
                                    newEnv[newKey] = value;
                                    setEnv(newEnv);
                                }}
                            />
                            <Input
                                placeholder="Value"
                                value={value}
                                onChange={newValue => {
                                    const newEnv = { ...env };
                                    newEnv[key] = newValue;
                                    setEnv(newEnv);
                                }}
                            />
                            <Button
                                variant="secondary"
                                icon={Trash}
                                onClick={() => {
                                    const newEnv = { ...env };
                                    delete newEnv[key];
                                    setEnv(newEnv);
                                }}
                            />
                        </div>
                    ))}
                    <Button variant="secondary" icon={Plus} onClick={() => setEnv({ ...env, '': '' })}>
                        Add Environment Variable
                    </Button>
                </div>
            </IconSection>

            <Button variant="primary" icon={Save} onClick={handleSave}>
                Save
            </Button>
        </PageCrumbed>
    );
}
