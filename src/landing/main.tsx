import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './landing.css'
import Landing from './Landing.tsx'

// "js" gates the entrance styles; "dark" puts the editor's shadcn tokens (and its dropdown portals) on the dark palette.
document.documentElement.classList.add('js', 'dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
)
