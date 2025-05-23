import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface LogLineProps {
    log: string;
}
const LogLine: React.FC<LogLineProps> = ({ log }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    let parsedJson = null;
    try {
        parsedJson = JSON.parse(log);
    } catch {
    }

    return (
        <div className="duration-200 rounded text-xs">
            <div>
                <div className="p-1 font-mono">
                    {parsedJson ? (
                        <div className='bg-background-200 p-1'>
                            <div 
                                className="flex items-center gap-1 cursor-pointer hover:text-text-100"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <ChevronRight 
                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                />
                                <pre className="text-xs text-text-300 truncate w-[90%]">{log}</pre>
                            </div>
                            {isExpanded && (
                                <div className="mt-2 pl-4 border-l-2 border-background-200">
                                    <pre className="text-xs text-text-300 whitespace-pre-wrap">
                                        {JSON.stringify(parsedJson, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <pre className="text-xs text-text-300 truncate">{log}</pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export interface LogViewProps {
    rawLog: string;
}

export const LogView: React.FC<LogViewProps> = ({ rawLog }) => {
    const logs = rawLog.split('\n')

    if (!logs || logs.length === 0) {
        return <div className="text-text-700 p-4 text-center">No logs available</div>;
    }

    return (
        <div className="w-full rounded bg-background-100 font-mono">
            <div className="p-1">
                {logs.map((log, index) => (
                    <LogLine key={index} log={log} />
                ))}
            </div>
        </div>
    );
};

export default LogView;
