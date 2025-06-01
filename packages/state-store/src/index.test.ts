import { describe, expect, test } from 'vitest';
import * as StateStore from './index';

describe('State Store Package Exports', () => {
    test('exports DatabaseProvider', () => {
        expect(StateStore.DatabaseProvider).toBeDefined();
        expect(typeof StateStore.DatabaseProvider).toBe('function');
    });

    test('exports useDatabase hook', () => {
        expect(StateStore.useDatabase).toBeDefined();
        expect(typeof StateStore.useDatabase).toBe('function');
    });

    test('exports useQuery hook', () => {
        expect(StateStore.useQuery).toBeDefined();
        expect(typeof StateStore.useQuery).toBe('function');
    });

    test('exports useDatabaseSubscription hook', () => {
        expect(StateStore.useDatabaseSubscription).toBeDefined();
        expect(typeof StateStore.useDatabaseSubscription).toBe('function');
    });

    test('exports useDatabaseRecordSubscription hook', () => {
        expect(StateStore.useDatabaseRecordSubscription).toBeDefined();
        expect(typeof StateStore.useDatabaseRecordSubscription).toBe('function');
    });

    test('exports useDatabaseTableQuery hook', () => {
        expect(StateStore.useDatabaseTableQuery).toBeDefined();
        expect(typeof StateStore.useDatabaseTableQuery).toBe('function');
    });

    test('exports useOnce hook', () => {
        expect(StateStore.useOnce).toBeDefined();
        expect(typeof StateStore.useOnce).toBe('function');
    });

    test('all expected exports are present', () => {
        const expectedExports = [
            'DatabaseProvider',
            'useDatabase',
            'useQuery',
            'useDatabaseSubscription',
            'useDatabaseRecordSubscription',
            'useDatabaseTableQuery',
            'useOnce',
        ];

        for (const exportName of expectedExports) {
            expect(StateStore).toHaveProperty(exportName);
        }
    });
});
