import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DadosProvider } from './contexts/DadosContext.jsx'
import { ClienteAuthProvider } from './contexts/ClienteAuthContext.jsx'
// regras de base da rolagem suave (classes que a Lenis põe no <html>). A de
// iframe sem clique só vale enquanto a rolagem está animando (.lenis-smooth),
// então o mapa e os campos de cartão do Mercado Pago continuam clicáveis
import 'lenis/dist/lenis.css'
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
