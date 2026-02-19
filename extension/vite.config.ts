import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'fs';

/**
 * File: vite.config.ts
 * Purpose: Vite build configuration for the JobHunter browser extension.
 *
 * Builds multiple entry points (background, content script, popup, options)
 * into a dist/ directory that matches Chrome extension structure.
 *
 * The build produces:
 *   dist/
 *   ├── manifest.json       (copied from public/)
 *   ├── icons/               (copied from public/icons/)
 *   ├── background/index.js  (service worker)
 *   ├── content/index.js     (content script)
 *   ├── popup/index.html     (popup page + bundled JS)
 *   └── options/index.html   (options page + bundled JS)
 */

/**
 * Custom plugin that copies manifest.json and icons into dist/ after build,
 * and moves HTML files from dist/src/ to the correct locations.
 */
function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const publicDir = resolve(__dirname, 'public');

      // Copy manifest.json
      copyFileSync(resolve(publicDir, 'manifest.json'), resolve(distDir, 'manifest.json'));

      // Copy icons
      const iconsDir = resolve(publicDir, 'icons');
      const distIconsDir = resolve(distDir, 'icons');
      if (!existsSync(distIconsDir)) mkdirSync(distIconsDir, { recursive: true });
      for (const file of readdirSync(iconsDir)) {
        copyFileSync(resolve(iconsDir, file), resolve(distIconsDir, file));
      }

      // Move HTML files from dist/src/{popup,options}/ to dist/{popup,options}/
      // and fix asset paths (Vite generates ../../ but we need ../)
      for (const page of ['popup', 'options']) {
        const srcHtml = resolve(distDir, 'src', page, 'index.html');
        const destDir = resolve(distDir, page);
        const destHtml = resolve(destDir, 'index.html');
        if (existsSync(srcHtml)) {
          if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
          // Fix relative paths: ../../ → ../ (one level shallower after moving)
          let html = readFileSync(srcHtml, 'utf-8');
          html = html.replace(/\.\.\/\.\.\//g, '../');
          writeFileSync(destHtml, html);
        }
      }

      // Clean up the leftover dist/src/ directory
      const srcDir = resolve(distDir, 'src');
      if (existsSync(srcDir)) {
        rmSync(srcDir, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionAssets()],
  publicDir: false, // We handle public assets with our custom plugin
  base: './', // Use relative paths — required for Chrome extension
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // background + content scripts are built separately as IIFE (see scripts/build.mjs)
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
      },
      output: {
        // Place each entry in its own directory
        entryFileNames: (chunkInfo) => {
          return `${chunkInfo.name}/index.js`;
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    target: 'esnext',
    minify: false, // Easier debugging during development
  },
  css: {
    postcss: './postcss.config.js',
  },
});
