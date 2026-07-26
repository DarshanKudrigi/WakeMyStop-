import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { getCurrentUser, logout } from '../api/authApi'
import Navbar from '../components/layout/Navbar'
import NavigationDrawer from '../components/layout/NavigationDrawer'
import Footer from '../components/layout/Footer'
import Loader from '../components/common/Loader'
import { removeToken } from '../utils/auth'

function MainLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ name: 'Darshan', email: 'darshan@railalert.ai' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUser()

        if (!mounted) return

        if (response?.data?.user) {
          setUser(response.data.user)
        }
        setError('')
      } catch {
        if (!mounted) return
        // Safe fallback user for local preview
        setUser({ name: 'Darshan', email: 'darshan@railalert.ai' })
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      mounted = false
    }
  }, [navigate])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      removeToken()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b132b] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Collapsible Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {loading ? <Loader label="Initializing RailAlert AI..." /> : null}
        {!loading ? <Outlet context={{ user }} /> : null}
        {error && !loading ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
            {error}
          </div>
        ) : null}
      </main>

      {/* Professional Footer */}
      <Footer />
    </div>
  )
}

export default MainLayout
