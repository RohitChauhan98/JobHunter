/**
 * File: scripts/build.mjs
 * Purpose: Orchestrate the extension build.
 *
 * Chrome content scripts run as classic (non-module) scripts — they cannot
 * use ES `import` statements.  Service workers have no DOM, so Vite's
 * modulepreload polyfill (which references `document`) crashes them.
 *
 * Solution:
 *   Pass 1 — Vite: Build popup & options pages (ESM, React, code-splitting OK)
 *   Pass 2 — Rollup: Build background service worker as plain IIFE
 *   Pass 3 — Rollup: Build content script as plain IIFE
 *
 * Using Rollup directly for passes 2 & 3 avoids all Vite runtime injections
 * (modulepreload polyfill, __vitePreload, HMR client, etc.).
 */

import { build as viteBuild } from 'vite';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Pass 1: Popup & Options pages (Vite — ESM + React) ──────────────────
console.log('\n📦 Pass 1 — Building popup & options pages (Vite)…');
await viteBuild({
  configFile: resolve(root, 'vite.config.ts'),
});

// Shared Rollup config for extension scripts (background + content)
const rollupPlugins = [
  alias({
    entries: [{ find: /^@\//, replacement: resolve(root, 'src') + '/' }],
  }),
  nodeResolve({ extensions: ['.ts', '.js'] }),
  typescript({
    tsconfig: resolve(root, 'tsconfig.json'),
    compilerOptions: {
      declaration: false,
      declarationMap: false,
      sourceMap: false,
    },
  }),
];

// ── Pass 2: Background service worker (Rollup — IIFE) ───────────────────
console.log('\n📦 Pass 2 — Building background service worker (Rollup IIFE)…');
const bgBundle = await rollup({
  input: resolve(root, 'src/background/index.ts'),
  plugins: rollupPlugins,
});
await bgBundle.write({
  file: resolve(root, 'dist/background/index.js'),
  format: 'iife',
  sourcemap: false,
});
await bgBundle.close();

// ── Pass 3: Content script (Rollup — IIFE) ──────────────────────────────
console.log('\n📦 Pass 3 — Building content script (Rollup IIFE)…');
const contentBundle = await rollup({
  input: resolve(root, 'src/content/index.ts'),
  plugins: rollupPlugins,
});
await contentBundle.write({
  file: resolve(root, 'dist/content/index.js'),
  format: 'iife',
  sourcemap: false,
});
await contentBundle.close();

console.log('\n✅ Extension build complete!\n');
