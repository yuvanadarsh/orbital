/**
 * Renderer entry point.
 * Imports global CSS (Tailwind + Orbital design tokens) before mounting React.
 */

import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
