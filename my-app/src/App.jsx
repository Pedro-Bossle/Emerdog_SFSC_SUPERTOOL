import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Supertabela from './pages/Supertabela/Supertabela';
import Layout from './components/Layout/Layout';
import Layout2 from './components/Layout2/Layout2';
import PrivateRoute from './components/PrivateRoute/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
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
            path="/supertabela"
            element={
              <PrivateRoute>
                <Supertabela />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App