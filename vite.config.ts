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
  const port = Number(process.env.PORT || 5173)
  const codespaceName = process.env.CODESPACE_NAME
  const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
  const tunnelDomain = forwardingDomain || 'app.github.dev'
  const hmrHost = codespaceName && forwardingDomain
    ? `${codespaceName}-${port}.${forwardingDomain}`
    : codespaceName
      ? `${codespaceName}-${port}.${tunnelDomain}`
    : undefined

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
      host: '0.0.0.0',
      port,
      strictPort: true,
      hmr: {
        host: hmrHost,
        port,
        clientPort: 443,
        protocol: 'wss',
      },
      fs: {
        allow: [path.resolve(__dirname, '.')]
      }
    }
  }
})
