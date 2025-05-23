import * as Lucide from 'lucide-react';

export const DynamicIcon = ({ name, ...props }: { name: string } & any) => {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic icon access
    const IconComponent = Lucide[name as keyof typeof Lucide] as any;
    if (!IconComponent) {
        console.error(`Icon ${name} not found in Lucide`);
        return null; // Handle the case where the icon name is invalid
    }
    return <IconComponent {...props} />;
};
