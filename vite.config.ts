import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(() => {
  const wixCleanBuild = process.env.VITE_WIX_CLEAN_BUILD === '1'

  return {
    plugins: [react()],
    // Relative asset URLs are more reliable when embedded in Wix.
    base: wixCleanBuild ? './' : '/',
    // Skip legacy static placeholders for Wix-specific deployment builds.
    publicDir: wixCleanBuild ? false : 'public',
    build: {
      emptyOutDir: true
    },
    server: {
      fs: {
        allow: [path.resolve(__dirname, '.')]
      }
    }
  }
})
