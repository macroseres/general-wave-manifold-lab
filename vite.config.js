import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import documentationLibrary from './scripts/documentation-library.js'

// Set VITE_BASE=/<repository-name>/ when deploying under a sub-path
// (for example GitHub Pages). Defaults to the site root.
export default defineConfig({
  plugins: [react(), documentationLibrary()],
  base: process.env.VITE_BASE ?? '/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'documentation-chapters', test: /\/docs\/mathematics\/.*\.html\?raw$/, maxSize: 400_000 },
            { name: 'three-core', test: /\/three\/build\/three\.core\.js$/ },
            { name: 'three-webgl', test: /\/three\/build\/three\.module\.js$/ },
            { name: 'math-renderer', test: /\/node_modules\/katex\// },
            { name: 'react-dom', test: /\/node_modules\/react-dom\// },
            { name: 'wave-computations', test: /\/src\/(?:math|geometry)\//, entriesAware: true },
          ],
        },
      },
    },
  },
})
