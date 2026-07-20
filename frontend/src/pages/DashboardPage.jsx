import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getCurrentUser, logout } from '../api/authApi'
import { getTokenExpiryMessage, removeToken } from '../utils/auth'

function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('Loading your account...')

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        const response = await getCurrentUser()

        if (isMounted) {
          setUser(response?.data?.user || null)
          setMessage('Your session is active.')
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.message || getTokenExpiryMessage())
          removeToken()
          navigate('/login', { replace: true })
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="eyebrow">Protected route</span>
        <h1>Dashboard placeholder</h1>
        <p className="muted">{message}</p>

        {user ? (
          <div className="profile-block">
            <div>
              <strong>{user.name}</strong>
              <p>{user.email}</p>
            </div>
            <p>{user.phone || 'No phone number saved yet.'}</p>
          </div>
        ) : null}

        <button className="button button-primary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </section>
    </main>
  )
}

export default DashboardPage
