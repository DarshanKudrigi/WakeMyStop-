import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import { isAuthenticated } from '../utils/auth'

function AppRoutes() {
  const authenticated = isAuthenticated()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={authenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default AppRoutes
