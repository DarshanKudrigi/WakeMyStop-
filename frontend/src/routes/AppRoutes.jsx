import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import MainLayout from '../layouts/MainLayout'
import ProtectedLayout from '../layouts/ProtectedLayout'
import { isAuthenticated } from '../utils/auth'

function AppRoutes() {
  const authenticated = isAuthenticated()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={authenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={authenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route element={<ProtectedLayout />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={authenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default AppRoutes
