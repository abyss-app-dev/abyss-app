import { join } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
    base: './',
    plugins: [
        react(),
        electron([
            {
                entry: 'server/main/index.ts',
                vite: {
                    build: {
                        outDir: 'dist-electron/main',
                        commonjsOptions: {
                            ignoreDynamicRequires: true,
                        },
                        rollupOptions: {
                            external: ['@abyss/intelligence', '@abyss/records', 'sqlite3', 'bindings', 'file-uri-to-path'],
                            output: {
                                entryFileNames: '[name].mjs',
                            },
                        },
                    },
                },
            },
            {
                entry: 'server/preload/index.ts',
                vite: {
                    build: {
                        outDir: 'dist-electron/preload',
                        commonjsOptions: {
                            ignoreDynamicRequires: true,
                        },
                        rollupOptions: {
                            external: ['@abyss/intelligence', '@abyss/records', 'sqlite3', 'bindings', 'file-uri-to-path'],
                            output: {
                                entryFileNames: '[name].mjs',
                            },
                        },
                    },
                },
            },
        ]),
        renderer({
            resolve: {
                sqlite3: { type: 'cjs' },
                bindings: { type: 'cjs' },
                'file-uri-to-path': { type: 'cjs' },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': join(__dirname, 'src'),
        },
    },
    optimizeDeps: {
        include: ['@abyss/records', 'bindings', 'file-uri-to-path'],
    },
    build: {
        outDir: 'dist-vite',
        assetsInlineLimit: 0,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            output: {
                format: 'es',
            },
        },
    },
});
