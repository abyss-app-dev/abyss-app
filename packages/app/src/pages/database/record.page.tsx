import { LabelValue, PageCrumbed } from '@abyss/ui-components';
import { useRecordPage } from './record.hook';

export function ViewTableRecordPage() {
    const { record, breadcrumbs } = useRecordPage();
    const { ...data } = record.data || {};

    return (
        <PageCrumbed title={`SQLite Record: ${record.data?.id}`} breadcrumbs={breadcrumbs}>
            <LabelValue data={data} />
        </PageCrumbed>
    );
}
