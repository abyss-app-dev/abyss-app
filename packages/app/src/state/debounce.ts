import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => unknown>(
    callback: T,
    timeout: number,
    dependencies: unknown[] = []
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, timeout);
        },
        [callback, timeout, ...dependencies]
    );
}
