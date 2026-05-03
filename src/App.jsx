import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import Layout2 from './components/Layout2/Layout2';
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import Supertabeladoc from './pages/Supertabela/Supertabela_doc/Supertabeladoc';
import Supertabelamain from './pages/Supertabela/Supertabela_main/Supertabelamain';
import Supertabelacidades from './pages/Supertabela/Supertabela_cidades/Supertabelacidades';
import Supertabelaplanos from './pages/Supertabela/Supertabela_planos/Supertabelaplanos';
import NotFound from './pages/NotFound/NotFound';
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Sem layout */}
        <Route path="/" element={<Login />} />
        {/* Com layout */}
        <Route element={<Layout />}>
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Route>
        <Route element={<Layout2 />}>
          <Route
            path="/supertabeladoc"
            element={
              <PrivateRoute>
                <Supertabeladoc />
              </PrivateRoute>
            }
          />
        </Route>
        <Route element={<Layout2 />}>
          <Route
            path="/supertabelamain"
            element={
              <PrivateRoute>
                <Supertabelamain />
              </PrivateRoute>
            }
          />
        </Route>
        <Route element={<Layout2 />}>
          <Route
            path="/supertabela/cidades"
            element={
              <PrivateRoute>
                <Supertabelacidades />
              </PrivateRoute>
            }
          />
        </Route>
        <Route element={<Layout2 />}>
          <Route
            path="/supertabela/planos"
            element={
              <PrivateRoute>
                <Supertabelaplanos />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App


/*
> Fazer Documentações
> Iniciar Super Tabela
> Iniciar Credenciamento
> Iniciar Formulários
> Iniciar Planos
> Iniciar Contratos
> Iniciar Pagamentos
> Iniciar Emercast
*/