import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { register } from '../api/authApi'
import FormField from '../components/FormField'
import { isAuthenticated } from '../utils/auth'

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const validate = (values) => {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required'
  }

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

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirm your password'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

function RegisterPage() {
  const navigate = useNavigate()
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
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      navigate('/login', { replace: true, state: { registered: true } })
    } catch (error) {
      setSubmitError(error.message || 'Unable to register right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page auth-page-alt">
      <section className="auth-panel auth-panel-grid">
        <div className="auth-copy auth-copy-accent">
          <span className="eyebrow">Create your account</span>
          <h1>Register once, then keep every trip under control.</h1>
          <p>
            Save your alert preferences, manage journeys, and prepare for travel updates without
            repeating setup.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>Register</h2>
            <p className="muted">Create your RailAlert AI account.</p>
          </div>

          {submitError ? <div className="banner banner-error">{submitError}</div> : null}

          <FormField
            id="name"
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            autoComplete="name"
          />

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
            autoComplete="new-password"
          />

          <FormField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <Link className="button button-secondary" to="/login">
            Go to Login
          </Link>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage
