import { IconSection, PageCrumbed, SelectDropdown } from '@abyss/ui-components';
import { Download, PaintBucket } from 'lucide-react';
import { AppUpdaterStatus } from '../../state/app-updater';
import { useSettingsPage } from './settings.hook';

export function SettingsPage() {
    const { breadcrumbs, record, onChangeAppTheme  } = useSettingsPage();

    return (
        <PageCrumbed title={'Abyss Settings'} breadcrumbs={breadcrumbs} loading={record === undefined}>
            <IconSection icon={PaintBucket} title="App Theme">
                <SelectDropdown
                    className="w-52"
                    selectedId={record.data?.theme || 'ethereal'}
                    onSelect={onChangeAppTheme}
                    options={[
                        { id: 'abyss', label: 'Abyss' },
                        { id: 'ethereal', label: 'Ethereal' },
                    ]}
                />
            </IconSection>
        </PageCrumbed>
    );
}
