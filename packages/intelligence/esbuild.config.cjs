const esbuild = require('esbuild');
const { execSync } = require('node:child_process');

/** @type {import('esbuild').BuildOptions} */
const commonConfig = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.mjs',
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    external: [],
};

if (require.main === module) {
    // Build JavaScript files
    esbuild
        .build(commonConfig)
        .then(() => {
            // Generate TypeScript declaration files
            execSync('tsc --emitDeclarationOnly --declaration --outDir dist', { stdio: 'inherit' });
        })
        .catch(() => process.exit(1));
}

module.exports = commonConfig;
