import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './landing.css'
import { applyTheme, loadTheme } from '@/lib/theme'
import Landing from './Landing.tsx'

// "js" gates the entrance styles. The theme sets the colours and the "dark" class shadcn's dark: variants follow.
document.documentElement.classList.add('js')
applyTheme(loadTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
)
