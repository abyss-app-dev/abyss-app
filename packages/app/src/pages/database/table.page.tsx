import { Button, IconSection, PageCrumbed, Table } from '@abyss/ui-components';
import { TableIcon, Trash } from 'lucide-react';
import { useTable } from './table.hook';

export function ViewTablePage() {
    const { table, breadcrumbs, onPurgeTable, scanTable, onOpenRecordStr } = useTable();

    return (
        <PageCrumbed title={`SQLite Table: ${table}`} breadcrumbs={breadcrumbs}>
            <IconSection
                title={`SQLite Table: ${table}`}
                icon={TableIcon}
                action={<Button tooltip="Purge Table" variant="secondary" icon={Trash} onClick={onPurgeTable} />}
            >
                <Table
                    table={table}
                    data={scanTable.data as unknown as Record<string, unknown>[]}
                    ignoreColumns={['createdAt', 'updatedAt', 'controller']}
                    onRowClick={record => onOpenRecordStr(record.id as string)}
                    onRecordClick={recordId => onOpenRecordStr(recordId)}
                />
            </IconSection>
        </PageCrumbed>
    );
}
