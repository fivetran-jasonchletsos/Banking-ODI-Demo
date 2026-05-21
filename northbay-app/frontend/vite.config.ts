import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: GitHub Pages serves at /Banking-ODI-Demo/.
// Override with VITE_BASE=/ when previewing at root.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/Banking-ODI-Demo/',
})
