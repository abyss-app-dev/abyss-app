import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: [],
        environment: 'happy-dom',
        update: process.env.VITEST_UPDATE_SNAPSHOTS !== 'false',
    },
});
