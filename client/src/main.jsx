import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DadosProvider } from './contexts/DadosContext.jsx'
import { ClienteAuthProvider } from './contexts/ClienteAuthContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClienteAuthProvider>
        <DadosProvider>
          <App />
        </DadosProvider>
      </ClienteAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
