import { useEffect, useRef } from 'react';

export function useOnce(callback: () => void, dependencies: unknown[] = []) {
    const hasRun = useRef(false);
    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            callback();
        }
    }, dependencies);
}
