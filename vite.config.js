import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// This repo is a GitHub *user* site (cooler09.github.io), served from the domain
// root, so `base` stays "/". Source lives in src/, the production bundle is
// written to dist/, which the GitHub Actions workflow uploads to Pages.
export default defineConfig({
  root: 'src',
  base: '/',
  publicDir: 'public', // src/public/* is copied verbatim to the dist root
  plugins: [tailwindcss()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
  },
})
