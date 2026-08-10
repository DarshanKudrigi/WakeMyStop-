import { Navigate, Route, Routes } from 'react-router-dom'

import DashboardPage from '../pages/DashboardPage'
import TrainSearchResultsPage from '../pages/TrainSearchResultsPage'
import TrainDetailsPage from '../pages/TrainDetailsPage'
import AlertPreferencesPage from '../pages/AlertPreferencesPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import MainLayout from '../layouts/MainLayout'
import ProtectedLayout from '../layouts/ProtectedLayout'
import { isAuthenticated } from '../utils/auth'

/**
 * Public-only route wrapper (Login, Register)
 * Dynamically checks auth on render to prevent stale state redirect loops
 */
function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

/**
 * Root / Wildcard redirect handler
 * Dynamically evaluates auth status on every navigation evaluation
 */
function RootRedirect() {
  return <Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Protected Routes encapsulated inside ProtectedLayout & MainLayout */}
      <Route element={<ProtectedLayout />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/journeys" element={<TrainSearchResultsPage />} />
          <Route path="/train/:trainNo" element={<TrainDetailsPage />} />
          <Route path="/alert-preferences/:trainNo" element={<AlertPreferencesPage />} />
          <Route path="/journey/active/:trainNo" element={<TrainDetailsPage />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

export default AppRoutes
