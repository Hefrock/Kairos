import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'

// Streamlit build: produces a single self-contained index.html with all
// JS and CSS inlined. No PWA, no hashed filenames, no external asset files.
// Output: streamlit_build/index.html — committed to the repo so Streamlit
// Community Cloud can serve it without a Node.js build step.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'streamlit_build',
    emptyOutDir: true,
    // viteSingleFile inlines everything; cssCodeSplit must be off
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Single JS chunk
        inlineDynamicImports: true,
      },
    },
  },
})
