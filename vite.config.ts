import fs from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function copyContentDirectory() {
  return {
    name: 'copy-content-directory',
    closeBundle() {
      const sourceDir = path.resolve(__dirname, 'content')
      const targetDir = path.resolve(__dirname, 'dist', 'content')

      if (!fs.existsSync(sourceDir)) {
        return
      }

      fs.cpSync(sourceDir, targetDir, { recursive: true })
    }
  }
}

export default defineConfig(() => {
  const wixCleanBuild = process.env.VITE_WIX_CLEAN_BUILD === '1'

  return {
    plugins: [react(), copyContentDirectory()],
    // Production builds are loaded from file:// in Electron, so assets must stay relative.
    base: './',
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
