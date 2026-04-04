import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('sw.js', window.location.href)
    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  })
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
