import { PageCrumbed } from '@abyss/ui-components';
import { useNotebookCreate } from './create.hook';
import Notebook from './notebook/notebook';

export function NotebookCreatePage() {
    const { breadcrumbs } = useNotebookCreate();

    return (
        <PageCrumbed title="New Notebook" breadcrumbs={breadcrumbs}>
            <Notebook />
        </PageCrumbed>
    );
}
