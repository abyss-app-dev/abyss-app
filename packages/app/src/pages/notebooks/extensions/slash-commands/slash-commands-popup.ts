import { type Command, getSuggestionItems } from './slash-command-options';

interface MenuState {
    items: Command[];
    selectedIndex: number;
    title?: string;
    parent?: MenuState;
}

export const renderItems = () => {
    let component: HTMLDivElement | null = null;
    let commandFunction: any = null;
    let currentMenuState: MenuState = {
        items: [],
        selectedIndex: 0,
    };
    let isLoading = false;

    const updateSelection = () => {
        if (!component) return;
        const buttons = component.querySelectorAll('button');
        buttons.forEach((button, index) => {
            button.className = index === currentMenuState.selectedIndex ? 'selected' : '';
        });
    };

    const renderMenu = (menuState: MenuState) => {
        if (!component) return;

        component.innerHTML = '';

        // Add back button if this is a submenu
        if (menuState.parent) {
            const backButton = document.createElement('button');
            backButton.className = '';
            backButton.innerHTML = `
                <span class="slash-menu-icon">←</span>
                <span class="slash-menu-title">Back</span>
            `;
            backButton.addEventListener('click', () => {
                if (menuState.parent) {
                    currentMenuState = menuState.parent;
                    renderMenu(currentMenuState);
                }
            });
            component.appendChild(backButton);
        }

        // Add title if this is a submenu
        if (menuState.title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'slash-menu-title-header';
            titleEl.textContent = menuState.title;
            component.appendChild(titleEl);
        }

        if (isLoading) {
            const loadingEl = document.createElement('div');
            loadingEl.className = 'slash-menu-loading';
            loadingEl.textContent = 'Loading...';
            component.appendChild(loadingEl);
            return;
        }

        if (menuState.items.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No results';
            component.appendChild(noResults);
            return;
        }

        menuState.items.forEach((item: Command, index: number) => {
            const button = document.createElement('button');
            const adjustedIndex = menuState.parent ? index + 1 : index; // Account for back button
            button.className = adjustedIndex === currentMenuState.selectedIndex ? 'selected' : '';

            const hasSubCommands = !!item.subCommands;
            const rightIcon = hasSubCommands ? ' <span class="slash-menu-arrow">→</span>' : '';

            button.innerHTML = `
                <span class="slash-menu-icon">${item.icon}</span>
                <span class="slash-menu-title">${item.title}</span>
                ${rightIcon}
            `;

            button.addEventListener('click', async () => {
                if (item.subCommands) {
                    // Load submenu
                    isLoading = true;
                    renderMenu(currentMenuState);

                    try {
                        const subCommands = await item.subCommands();
                        const subMenuState: MenuState = {
                            items: subCommands,
                            selectedIndex: 0,
                            title: item.title,
                            parent: currentMenuState,
                        };
                        currentMenuState = subMenuState;
                        isLoading = false;
                        renderMenu(currentMenuState);
                    } catch (error) {
                        console.error('Error loading submenu:', error);
                        isLoading = false;
                        renderMenu(currentMenuState);
                    }
                } else if (item.command) {
                    commandFunction(item);
                }
            });
            if (component) {
                component.appendChild(button);
            }
        });
    };

    return {
        onStart: (props: any) => {
            component = document.createElement('div');
            component.className = 'slash-menu';
            document.body.appendChild(component);

            // Initialize with all commands
            const allCommands = getSuggestionItems({ query: '' });
            currentMenuState = {
                items: allCommands,
                selectedIndex: 0,
            };
            commandFunction = props.command;

            renderMenu(currentMenuState);

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

            // Only update if we're in the root menu (not a submenu)
            if (!currentMenuState.parent) {
                currentMenuState.items = newItems;
                currentMenuState.selectedIndex = Math.min(currentMenuState.selectedIndex, newItems.length - 1);
                commandFunction = command;
                renderMenu(currentMenuState);
            }

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
            const maxIndex = currentMenuState.parent
                ? currentMenuState.items.length // Include back button
                : currentMenuState.items.length - 1;

            if (event.key === 'ArrowDown') {
                currentMenuState.selectedIndex = (currentMenuState.selectedIndex + 1) % (maxIndex + 1);
                updateSelection();
                return true;
            }

            if (event.key === 'ArrowUp') {
                currentMenuState.selectedIndex = (currentMenuState.selectedIndex - 1 + maxIndex + 1) % (maxIndex + 1);
                updateSelection();
                return true;
            }

            if (event.key === 'ArrowLeft' && currentMenuState.parent) {
                // Go back to parent menu
                currentMenuState = currentMenuState.parent;
                renderMenu(currentMenuState);
                return true;
            }

            if (event.key === 'Enter') {
                if (currentMenuState.parent && currentMenuState.selectedIndex === 0) {
                    // Back button selected
                    currentMenuState = currentMenuState.parent;
                    renderMenu(currentMenuState);
                    return true;
                }

                const itemIndex = currentMenuState.parent ? currentMenuState.selectedIndex - 1 : currentMenuState.selectedIndex;

                const selectedItem = currentMenuState.items[itemIndex];

                if (selectedItem) {
                    if (selectedItem.subCommands) {
                        // Load submenu
                        selectedItem
                            .subCommands()
                            .then(subCommands => {
                                const subMenuState: MenuState = {
                                    items: subCommands,
                                    selectedIndex: 0,
                                    title: selectedItem.title,
                                    parent: currentMenuState,
                                };
                                currentMenuState = subMenuState;
                                renderMenu(currentMenuState);
                            })
                            .catch(error => {
                                console.error('Error loading submenu:', error);
                            });
                    } else if (selectedItem.command && commandFunction) {
                        commandFunction(selectedItem);
                    }
                }
                return true;
            }

            if (event.key === 'Escape') {
                if (currentMenuState.parent) {
                    // Go back to parent menu instead of closing
                    currentMenuState = currentMenuState.parent;
                    renderMenu(currentMenuState);
                    return true;
                }

                // Close menu if we're at root level
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
