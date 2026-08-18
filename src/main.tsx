import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './components/providers/QueryProvider'

// Handle dynamic module import failures (e.g. offline disconnects or fresh deployments)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Chunk preload error detected, attempting refresh:', event);
  if (!sessionStorage.getItem('phq_chunk_reload_attempted')) {
    sessionStorage.setItem('phq_chunk_reload_attempted', 'true');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)

