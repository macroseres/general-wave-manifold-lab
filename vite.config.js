import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import documentationLibrary from './scripts/documentation-library.js'

// Set VITE_BASE=/<repository-name>/ when deploying under a sub-path
// (for example GitHub Pages). Defaults to the site root.
export default defineConfig({
  plugins: [react(), documentationLibrary()],
  base: process.env.VITE_BASE ?? '/',
})
