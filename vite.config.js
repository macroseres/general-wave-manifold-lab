import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set VITE_BASE=/<repository-name>/ when deploying under a sub-path
// (for example GitHub Pages). Defaults to the site root.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
})
