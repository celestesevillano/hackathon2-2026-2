import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import WantedPage from './pages/WantedPage'
import WantedDetailPage from './pages/WantedDetailPage'
import NewsPage from './pages/NewsPage'
import NotFoundPage from './pages/NotFoundPage'

// Misma estructura que en clase: <Router> envuelve el <Navbar> y las <Routes>.
function App() {
  return (
    <Router>
      {/* AuthProvider (Context API): comparte la sesión con todos los componentes sin pasar props nivel por nivel. */}
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Sin landing: la raíz redirige al login (si ya hay sesión, el login manda al dashboard). */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Todo lo que está dentro de PrivateRoute exige sesión. */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wanted" element={<WantedPage />} />
            <Route path="/wanted/:id" element={<WantedDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
          </Route>
          {/* "*" captura cualquier ruta que no exista: el 404 (igual que el "Not Found" de clase). */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
