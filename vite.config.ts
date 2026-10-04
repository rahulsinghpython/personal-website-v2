import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Renders each page to HTML at build time, using prerender() in src/main.tsx.
    // The Index is found by following the link to it from the home page.
    vitePrerenderPlugin({ renderTarget: '#root' }),
  ],
})
