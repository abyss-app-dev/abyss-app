import { PageCrumbed } from '@abyss/ui-components';
import { useNotebookCreate } from './create.hook';

export function NotebookCreatePage() {
    const {
        breadcrumbs,
    } = useNotebookCreate();


    return (
        <PageCrumbed title="New Notebook" breadcrumbs={breadcrumbs}>
            <div>
                <h1>New Notebook</h1>
            </div>
        </PageCrumbed>
    );
}
