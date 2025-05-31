// biome-ignore lint/suspicious/noExplicitAny: Extensions are weird
export function withDbAttribute(Base: any) {
    return Base.extend({
        name: `${Base.name}Wrapped`,
        addAttributes() {
            return {
                ...this.parent?.(),
                db: {
                    default: null,
                    rendered: true,
                    keepOnSplit: true,
                    parseHTML: (element: HTMLElement) => {
                        const dbAttr = element.getAttribute('data-db');
                        return dbAttr ? dbAttr : null;
                    },
                    renderHTML: (attrs: any) => {
                        return attrs.db ? { 'data-db': attrs.db } : {};
                    },
                },
            };
        },
    });
}
