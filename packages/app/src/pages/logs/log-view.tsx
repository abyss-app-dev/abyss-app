import { IconSection, LogView, PageCrumbed } from '@abyss/ui-components';
import { List } from 'lucide-react';
import { useLogView } from './log-view.hook';

export function LogViewPage() {
    const { rawLog, breadcrumbs } = useLogView();
    return (
        <PageCrumbed title="Log Stream" breadcrumbs={breadcrumbs}>
            <IconSection title="Log Stream" icon={List}>
                <LogView rawLog={rawLog} />
            </IconSection>
        </PageCrumbed>
    );
}
