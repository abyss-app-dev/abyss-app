export function safeSerialize(obj: unknown, depth = 100, seen: Set<unknown> = new Set()): unknown {
    if (depth <= 0) {
        return 'MAX_DEPTH_REACHED';
    }

    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (seen.has(obj)) {
        return 'CIRCULAR_REFERENCE';
    }

    const stringified = obj.toString();
    if (stringified !== '[object Object]') {
        return stringified;
    }

    seen.add(obj);

    if (Array.isArray(obj)) {
        const result = obj.map((item: unknown) => safeSerialize(item, depth - 1, seen));
        seen.delete(obj);
        return result;
    }

    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (obj instanceof Error) {
        return `ERROR: ${obj.name}: ${obj.message}`;
    }

    // Handling general objects
    const result: Record<string, unknown> = {};
    for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
            // Make sure we are accessing property of an object
            result[key] = safeSerialize((obj as Record<string, unknown>)[key], depth - 1, seen);
        }
    }
    seen.delete(obj);
    return result;
}
