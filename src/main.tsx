import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Styles: theme first, then base, then dark-mode overrides
import './styles/theme.css'
import './index.css'
import './styles/dark-mode.css'

const rootElement = document.getElementById('root')
if (rootElement) {
  // Initialize theme from localStorage (light default)
  const savedTheme = (localStorage.getItem('theme') || 'light').toLowerCase()
  const theme = savedTheme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
