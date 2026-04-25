import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Importas el nuevo plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})