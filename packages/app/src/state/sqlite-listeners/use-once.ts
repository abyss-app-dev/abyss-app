import { useEffect } from 'react';

export function useOnce<T>(callback: () => Promise<T>, dependencies: unknown[] = []) {
    useEffect(() => {
        callback();
    }, [callback, ...dependencies]);
}
