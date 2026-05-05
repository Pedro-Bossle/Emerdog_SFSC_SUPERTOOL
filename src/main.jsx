import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './pages/Supertabela/Supertabela_cidades/Supertabelacidades.css'
import './pages/Supertabela/Supertabela_planos/Supertabelaplanos.css'
import './pages/Supertabela/Supertabela_procedimentos/Supertabelaprocedimentos.css'
import './pages/Supertabela/Supertabela_negociacoes/Supertabelanegociacoes.css'
import './pages/Credenciamento/Credenciamento_main/Credenciamento_main.css'
import './pages/Credenciamento/Credenciamento_doc/Credenciamento_doc.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
