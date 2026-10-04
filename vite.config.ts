import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: el overlay de Electron carga dist/overlay.html desde el disco.
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        overlay: 'overlay.html',
      },
    },
  },
})
