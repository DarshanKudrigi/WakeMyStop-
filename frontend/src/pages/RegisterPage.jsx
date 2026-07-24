import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { register } from '../api/authApi'
import { isAuthenticated } from '../utils/auth'

/* ─── Validation ─────────────────────────────────────────────── */
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
    errors.confirmPassword = 'Please confirm your password'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  return errors
}

/* ─── Password strength helper ───────────────────────────────── */
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-400' }
  if (score <= 3) return { score, label: 'Good', color: 'bg-cyan-400' }
  return { score, label: 'Strong', color: 'bg-emerald-400' }
}

/* ─── Perks listed beside the register card ─────────────────── */
const PERKS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
      </svg>
    ),
    title: 'Live GPS Tracking',
    desc: 'Real-time train position on every route across India',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI Arrival Prediction',
    desc: 'ML-based ETA accurate to within minutes',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Smart Station Alerts',
    desc: 'Wake-up alerts before you reach your destination',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Journey History',
    desc: 'All your trips saved, organized, and searchable',
  },
]

/* ─── Reusable field component ───────────────────────────────── */
function Field({ id, name, label, type = 'text', value, onChange, error, autoComplete, rightAddon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-slate-300 text-xs font-semibold tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={label}
          className={[
            'w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200',
            'border backdrop-blur-sm',
            'focus:ring-2',
            rightAddon ? 'pr-12' : '',
            error
              ? 'border-red-400/60 focus:ring-red-400/40 focus:border-red-400/60'
              : 'border-white/20 hover:border-white/35 focus:ring-cyan-400/60 focus:border-cyan-400/60',
          ].join(' ')}
          style={{ background: 'rgba(255,255,255,0.09)' }}
        />
        {rightAddon}
      </div>
      {error && (
        <span className="text-red-400 text-xs pl-1 flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {error}
        </span>
      )}
    </div>
  )
}

/* ─── Component ──────────────────────────────────────────────── */
function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((cur) => ({ ...cur, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length > 0) return
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (error) {
      setSubmitError(error.message || 'Unable to register right now.')
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(form.password)

  /* ── Eye toggle button factory ── */
  const EyeToggle = ({ show, onToggle, label }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
      aria-label={label}
    >
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col font-['Inter',sans-serif]">

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC BACKGROUND (same as Login)
      ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/train-bg.jpg"
          alt=""
          aria-hidden="true"
          className="animate-ken-burns absolute inset-0 w-full h-full object-cover object-center"
          style={{ transformOrigin: '60% 50%' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(8,15,40,0.88) 0%, rgba(12,20,60,0.75) 45%, rgba(6,15,45,0.83) 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.92), transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-2/3"
          style={{ background: 'linear-gradient(to left, rgba(5,10,30,0.55), transparent)' }}
        />

        {/* Light rays */}
        <div
          className="animate-light-ray absolute top-1/3 left-[-10%] pointer-events-none"
          style={{
            height: '160px',
            width: '65vw',
            background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.10), transparent)',
            animationDelay: '2s',
          }}
        />
        <div
          className="animate-light-ray absolute top-3/4 left-[-5%] pointer-events-none"
          style={{
            height: '100px',
            width: '55vw',
            background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.07), transparent)',
            animationDelay: '9s',
          }}
        />

        {/* Fog blobs */}
        <div
          className="animate-fog absolute top-20 left-10 w-64 h-20 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(96,165,250,0.12) 0%, transparent 70%)',
            filter: 'blur(22px)',
            animationDelay: '2s',
          }}
        />
        <div
          className="animate-fog absolute bottom-24 right-20 w-72 h-24 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(56,189,248,0.10) 0%, transparent 70%)',
            filter: 'blur(26px)',
            animationDelay: '6s',
          }}
        />

        {/* Floating particles */}
        {[
          { top: '22%', left: '70%', size: 3, delay: '1s' },
          { top: '65%', left: '80%', size: 2, delay: '3s' },
          { top: '40%', left: '62%', size: 2, delay: '5s' },
          { top: '80%', left: '72%', size: 3, delay: '2s' },
          { top: '10%', left: '78%', size: 2, delay: '4s' },
          { top: '55%', left: '88%', size: 2, delay: '0s' },
        ].map((p, i) => (
          <div
            key={i}
            className="animate-particle absolute rounded-full pointer-events-none"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              background: 'rgba(148,211,255,0.55)',
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CONTENT LAYER
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-1 flex-col min-h-screen">

        {/* Top accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        <div className="flex flex-1 flex-col lg:flex-row-reverse items-center lg:items-center gap-8 px-6 sm:px-10 lg:px-16 py-10">

          {/* ──────────────────── RIGHT: Perks panel ──────────────────── */}
          <div className="flex-1 flex flex-col gap-7 max-w-xl order-last lg:order-none">

            {/* Brand pill */}
            <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full border border-cyan-400/30 bg-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-cyan-300 text-xs font-semibold tracking-widest uppercase">
                Indian Railways · AI Platform
              </span>
            </div>

            <h1 className="text-white font-black leading-[1.05] text-4xl sm:text-5xl xl:text-6xl tracking-tight drop-shadow-2xl">
              Join the Future of<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #38bdf8, #67e8f9, #a5f3fc)' }}
              >
                Smart Travel.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light max-w-md">
              Create your account and unlock AI-powered alerts, live tracking,
              and predictive journey intelligence — all in one place.
            </p>

            {/* Perks list */}
            <div className="flex flex-col gap-3 mt-1">
              {PERKS.map((perk) => (
                <div
                  key={perk.title}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-400/25 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center text-cyan-300">
                    {perk.icon}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{perk.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ──────────────────── LEFT: Register card ──────────────────── */}
          <div className="w-full max-w-md lg:max-w-[440px] xl:max-w-[470px] flex-shrink-0">
            <div
              className="rounded-3xl border border-white/20 shadow-2xl p-8 sm:p-9 flex flex-col gap-5"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              {/* Card header */}
              <div className="text-center space-y-1">
                <h2 className="text-white font-bold text-2xl sm:text-3xl tracking-tight">Create Account</h2>
                <p className="text-slate-300 font-medium text-sm">Join Real Alert AI — it's free.</p>
              </div>

              {/* Error banner */}
              {submitError && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm px-4 py-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                {/* ── Name ── */}
                <Field
                  id="name"
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  error={errors.name}
                  autoComplete="name"
                />

                {/* ── Email ── */}
                <Field
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                />

                {/* ── Password ── */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-slate-300 text-xs font-semibold tracking-wide uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Password (min. 8 characters)"
                      className={[
                        'w-full rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200',
                        'border backdrop-blur-sm',
                        'focus:ring-2',
                        errors.password
                          ? 'border-red-400/60 focus:ring-red-400/40 focus:border-red-400/60'
                          : 'border-white/20 hover:border-white/35 focus:ring-cyan-400/60 focus:border-cyan-400/60',
                      ].join(' ')}
                      style={{ background: 'rgba(255,255,255,0.09)' }}
                    />
                    <EyeToggle
                      show={showPassword}
                      onToggle={() => setShowPassword((p) => !p)}
                      label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </div>

                  {/* Password strength bar */}
                  {form.password && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              strength.score >= seg ? strength.color : 'bg-white/15'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium transition-colors duration-300 ${
                        strength.score <= 1 ? 'text-red-400' :
                        strength.score <= 2 ? 'text-amber-400' :
                        strength.score <= 3 ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {strength.label}
                      </span>
                    </div>
                  )}

                  {errors.password && (
                    <span className="text-red-400 text-xs pl-1 flex items-center gap-1">
                      <span aria-hidden="true">⚠</span> {errors.password}
                    </span>
                  )}
                </div>

                {/* ── Confirm Password ── */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-slate-300 text-xs font-semibold tracking-wide uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className={[
                        'w-full rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200',
                        'border backdrop-blur-sm',
                        'focus:ring-2',
                        errors.confirmPassword
                          ? 'border-red-400/60 focus:ring-red-400/40 focus:border-red-400/60'
                          : form.confirmPassword && form.password === form.confirmPassword
                            ? 'border-emerald-400/50 focus:ring-emerald-400/40'
                            : 'border-white/20 hover:border-white/35 focus:ring-cyan-400/60 focus:border-cyan-400/60',
                      ].join(' ')}
                      style={{ background: 'rgba(255,255,255,0.09)' }}
                    />
                    <EyeToggle
                      show={showConfirm}
                      onToggle={() => setShowConfirm((p) => !p)}
                      label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    />
                    {/* Match checkmark */}
                    {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-400 text-xs pl-1 flex items-center gap-1">
                      <span aria-hidden="true">⚠</span> {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* ── Register button ── */}
                <button
                  id="registerBtn"
                  type="submit"
                  disabled={loading}
                  className="relative w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0f766e 100%)',
                    boxShadow: '0 8px 24px rgba(15,118,110,0.45)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6, #0d9488)' }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create My Account
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>

                {/* ── Login link ── */}
                <p className="text-center text-slate-400 text-xs">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors hover:underline underline-offset-2"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2 px-8 sm:px-14 py-4 text-xs">
          <nav className="flex items-center gap-5 flex-wrap justify-center">
            {['Privacy Policy', 'Terms & Conditions', 'Contact Support'].map((label) => (
              <Link
                key={label}
                to={`/${label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <span className="text-slate-500">&copy; 2026 Real Alert AI</span>
        </footer>
      </div>
    </main>
  )
}

export default RegisterPage
