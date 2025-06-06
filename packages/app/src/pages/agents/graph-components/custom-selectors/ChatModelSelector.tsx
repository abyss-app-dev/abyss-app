import { SqliteTable } from '@abyss/records';
import { useDatabaseTable } from '@abyss/state-store';
import { ChevronDown } from 'lucide-react';

export interface ChatModelSelectorProps {
    color: string;
    onSelect: (value: string) => void;
    value: string;
}

export function ChatModelSelector(props: ChatModelSelectorProps) {
    const models = useDatabaseTable(SqliteTable.modelConnection);

    if (!props.value && models.data && models.data.length) {
        props.onSelect(models.data[0].id);
    }

    return (
        <>
            <ChevronDown className="w-3 h-3 translate-x-5 translate-y-[1px]" />
            <select
                value={props.value}
                onChange={e => props.onSelect(e.target.value)}
                className="w-[40%] pt-1 px-1 text-xs rounded-sm text-right"
                style={{ backgroundColor: `${props.color}10` }}
            >
                {(models.data || []).map(model => (
                    <option key={model.id} className="text-sm" value={model.id}>
                        {model.name}
                    </option>
                ))}
            </select>
        </>
    );
}
