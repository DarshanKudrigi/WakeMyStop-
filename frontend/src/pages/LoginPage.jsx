import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { login } from '../api/authApi'
import FormField from '../components/FormField'
import { isAuthenticated, saveToken } from '../utils/auth'

const initialState = {
  email: '',
  password: '',
}

const validate = (values) => {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!values.password.trim()) {
    errors.password = 'Password is required'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return errors
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)

    try {
      const response = await login(form)
      saveToken(response?.data?.accessToken)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Unable to log in right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel-surface">
        <div className="auth-copy">
          <span className="eyebrow">RailAlert AI</span>
          <h1>Sign in to keep your journey alerts ready.</h1>
          <p>
            Access your saved journeys, live alert preferences, and travel history from a single
            secure session.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>Login</h2>
            <p className="muted">Use your registered email and password.</p>
          </div>

          {submitError ? <div className="banner banner-error">{submitError}</div> : null}

          <FormField
            id="email"
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <Link className="button button-secondary" to="/register">
            Go to Register
          </Link>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
