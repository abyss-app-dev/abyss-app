import { Editor, Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { Command, getSuggestionItems } from './slash-command-options';

export const renderItems = () => {
    let component: HTMLDivElement | null = null;
    let selectedIndex = 0;
    let items: Command[] = [];
    let commandFunction: any = null;

    const updateSelection = () => {
        if (!component) return;
        const buttons = component.querySelectorAll('button');
        buttons.forEach((button, index) => {
            button.className = index === selectedIndex ? 'selected' : '';
        });
    };

    return {
        onStart: (props: any) => {
            component = document.createElement('div');
            component.className = 'slash-menu';
            document.body.appendChild(component);

            // Immediately populate with all commands
            const allCommands = getSuggestionItems({ query: '' });
            items = allCommands;
            selectedIndex = 0;
            commandFunction = props.command;

            allCommands.forEach((item: Command, index: number) => {
                const button = document.createElement('button');
                button.className = index === 0 ? 'selected' : '';
                button.innerHTML = `
                    <span class="slash-menu-icon">${item.icon}</span>
                    <span class="slash-menu-title">${item.title}</span>
                `;
                button.addEventListener('click', () => commandFunction(item));
                component!.appendChild(button);
            });

            // Position the popup
            const { clientRect } = props;
            if (clientRect) {
                const rect = clientRect();
                component.style.top = `${rect.bottom + 8}px`;
                component.style.left = `${rect.left}px`;
            }
        },

        onUpdate(props: any) {
            if (!component) return;

            const { items: newItems, command, clientRect } = props;
            items = newItems;
            selectedIndex = Math.min(selectedIndex, items.length - 1);
            commandFunction = command;

            component.innerHTML = '';

            if (items.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.textContent = 'No results';
                component.appendChild(noResults);
                return;
            }

            items.forEach((item: Command, index: number) => {
                const button = document.createElement('button');
                button.className = index === selectedIndex ? 'selected' : '';
                button.innerHTML = `
                    <span class="slash-menu-icon">${item.icon}</span>
                    <span class="slash-menu-title">${item.title}</span>
                `;
                button.addEventListener('click', () => commandFunction(item));
                component!.appendChild(button);
            });

            // Position the popup relative to the cursor
            if (clientRect) {
                const rect = clientRect();
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;

                // Get the menu dimensions
                const menuHeight = component.offsetHeight;
                const menuWidth = component.offsetWidth;

                // Calculate position
                let top = rect.bottom + 8;
                let left = rect.left;

                // Adjust if menu would go off bottom of screen
                if (top + menuHeight > viewportHeight) {
                    top = rect.top - menuHeight - 8;
                }

                // Adjust if menu would go off right side of screen
                if (left + menuWidth > viewportWidth) {
                    left = viewportWidth - menuWidth - 8;
                }

                // Make sure we don't go off left side
                if (left < 8) {
                    left = 8;
                }

                component.style.top = `${top}px`;
                component.style.left = `${left}px`;
            }
        },

        onKeyDown(props: any) {
            const { event } = props;

            if (event.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelection();
                return true;
            }

            if (event.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelection();
                return true;
            }

            if (event.key === 'Enter') {
                if (items[selectedIndex] && commandFunction) {
                    commandFunction(items[selectedIndex]);
                }
                return true;
            }

            if (event.key === 'Escape') {
                if (component) {
                    component.remove();
                    component = null;
                }
                return true;
            }

            return false;
        },

        onExit() {
            if (component) {
                component.remove();
                component = null;
            }
        },
    };
};

export default Extension.create({
    name: 'slashCommands',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                allowSpaces: false,
                allowedPrefixes: [' '],
                command: ({ editor, range, props }: { editor: Editor; range: any; props: any }) => {
                    props.command({ editor, range });
                },
                items: getSuggestionItems,
                render: renderItems,
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

/// More? idk what else i need
