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
import SagasPage from './pages/SagasPage'
import SagaDetailPage from './pages/SagaDetailPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wanted" element={<WantedPage />} />
            <Route path="/wanted/:id" element={<WantedDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/sagas" element={<SagasPage />} />
            <Route path="/sagas/:id" element={<SagaDetailPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
