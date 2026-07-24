import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { login } from '../api/authApi'
import { isAuthenticated, saveToken } from '../utils/auth'

/* ─── Validation ─────────────────────────────────────────────── */
const initialState = { email: '', password: '' }

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

/* ─── Feature card data ──────────────────────────────────────── */
const FEATURES = [
  {
    label: 'Live Train\nTracking',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'AI ETA\nPrediction',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Smart Destination\nAlerts',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Real-Time\nNotifications',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

/* ─── Component ──────────────────────────────────────────────── */
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  if (isAuthenticated()) {
    navigate('/dashboard', { replace: true })
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
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col font-['Inter',sans-serif]">

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC BACKGROUND LAYER
      ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Train image — Ken Burns slow pan + zoom */}
        <img
          src="/train-bg.jpg"
          alt=""
          aria-hidden="true"
          className="animate-ken-burns absolute inset-0 w-full h-full object-cover object-center"
          style={{ transformOrigin: '40% 55%' }}
        />

        {/* Deep navy-blue cinematic overlay — keeps train visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,18,40,0.82) 0%, rgba(15,23,60,0.70) 40%, rgba(8,20,50,0.78) 100%)',
          }}
        />

        {/* Bottom gradient fade for footer readability */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.92), transparent)' }}
        />

        {/* Left vignette — helps text stand out */}
        <div
          className="absolute inset-y-0 left-0 w-2/3"
          style={{ background: 'linear-gradient(to right, rgba(5,10,30,0.60), transparent)' }}
        />

        {/* ─── Animated light rays ─── */}
        <div
          className="animate-light-ray absolute top-1/4 left-[-10%] h-px w-[60vw] pointer-events-none"
          style={{
            height: '180px',
            background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.12), transparent)',
            animationDelay: '0s',
          }}
        />
        <div
          className="animate-light-ray absolute top-2/3 left-[-15%] pointer-events-none"
          style={{
            height: '120px',
            width: '50vw',
            background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.08), transparent)',
            animationDelay: '6s',
          }}
        />

        {/* ─── Floating ambient fog blobs ─── */}
        <div
          className="animate-fog absolute bottom-16 left-8 w-72 h-24 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(96,165,250,0.14) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />
        <div
          className="animate-fog absolute top-24 right-24 w-56 h-20 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(56,189,248,0.10) 0%, transparent 70%)',
            filter: 'blur(20px)',
            animationDelay: '4s',
          }}
        />

        {/* ─── Floating particles ─── */}
        {[
          { top: '20%', left: '15%', size: 3, delay: '0s' },
          { top: '60%', left: '25%', size: 2, delay: '2s' },
          { top: '35%', left: '40%', size: 2, delay: '4s' },
          { top: '75%', left: '10%', size: 3, delay: '1s' },
          { top: '50%', left: '48%', size: 2, delay: '3s' },
          { top: '15%', left: '55%', size: 2, delay: '5s' },
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

        {/* Top rail accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        {/* ── Main body ── */}
        <div className="flex flex-1 flex-col lg:flex-row items-center lg:items-center gap-8 px-6 sm:px-10 lg:px-16 py-12">

          {/* ──────────────────── LEFT: Hero copy ──────────────────── */}
          <div className="flex-1 flex flex-col gap-6 max-w-xl">

            {/* Brand pill */}
            <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full border border-cyan-400/30 bg-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-cyan-300 text-xs font-semibold tracking-widest uppercase">
                Indian Railways · AI Platform
              </span>
            </div>

            <h1 className="text-white font-black leading-[1.05] text-4xl sm:text-5xl xl:text-6xl tracking-tight drop-shadow-2xl">
              Never Miss Your<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #38bdf8, #67e8f9, #a5f3fc)' }}>
                Train Station
              </span>{' '}
              Again.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-md font-light">
              AI-powered railway travel assistant that tracks your journey,
              predicts arrival times, and alerts you before your destination.
            </p>

            {/* Feature cards grid */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mt-2">
              {FEATURES.map((feat) => (
                <div
                  key={feat.label}
                  className="group relative flex flex-col items-center justify-center gap-2.5 px-3 py-4 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md text-center cursor-default select-none overflow-hidden transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/14 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.12), transparent 70%)' }} />

                  <div className="text-cyan-300 group-hover:text-cyan-200 transition-colors duration-200">
                    {feat.icon}
                  </div>
                  <span className="text-white text-xs font-medium leading-snug whitespace-pre-line">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ──────────────────── RIGHT: Login card ──────────────────── */}
          <div className="w-full max-w-md lg:max-w-[440px] xl:max-w-[470px] flex-shrink-0">
            <div
              className="rounded-3xl border border-white/20 shadow-2xl p-8 sm:p-9 flex flex-col gap-5"
              style={{
                background: 'rgba(255,255,255,0.11)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              {/* Card header */}
              <div className="text-center space-y-1">
                <h2 className="text-white font-bold text-2xl sm:text-3xl tracking-tight">Real Alert AI</h2>
                <p className="text-slate-300 font-medium text-base">Welcome Back!</p>
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

                {/* ── Email ── */}
                <div className="flex flex-col gap-1.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="Email Address"
                    className={[
                      'w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-400 outline-none transition-all duration-200',
                      'border bg-white/10 backdrop-blur-sm',
                      'focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60',
                      errors.email
                        ? 'border-red-400/60 focus:ring-red-400/40 focus:border-red-400/60'
                        : 'border-white/20 hover:border-white/35',
                    ].join(' ')}
                    style={{ background: 'rgba(255,255,255,0.09)' }}
                  />
                  {errors.email && (
                    <span className="text-red-400 text-xs pl-1 flex items-center gap-1">
                      <span>⚠</span> {errors.email}
                    </span>
                  )}
                </div>

                {/* ── Password ── */}
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="Password"
                      className={[
                        'w-full rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-400 outline-none transition-all duration-200',
                        'border bg-white/10 backdrop-blur-sm',
                        'focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60',
                        errors.password
                          ? 'border-red-400/60 focus:ring-red-400/40 focus:border-red-400/60'
                          : 'border-white/20 hover:border-white/35',
                      ].join(' ')}
                      style={{ background: 'rgba(255,255,255,0.09)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
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
                  </div>
                  {errors.password && (
                    <span className="text-red-400 text-xs pl-1 flex items-center gap-1">
                      <span>⚠</span> {errors.password}
                    </span>
                  )}
                </div>

                {/* ── Remember Me + Forgot Password ── */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <div className="relative flex-shrink-0">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded border border-white/30 bg-white/10 peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all duration-200 flex items-center justify-center">
                        {rememberMe && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">Remember Me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-cyan-400 text-xs font-medium hover:text-cyan-300 transition-colors hover:underline underline-offset-2"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* ── Login button ── */}
                <button
                  id="loginBtn"
                  type="submit"
                  disabled={loading}
                  className="relative w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0f766e 100%)',
                    boxShadow: '0 8px 24px rgba(15,118,110,0.45)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6, #0d9488)' }} />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Logging in…
                      </>
                    ) : (
                      <>
                        Login
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>

                {/* ── OR divider ── */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/15" />
                  <span className="text-slate-400 text-xs font-semibold tracking-[0.2em] uppercase">or</span>
                  <div className="flex-1 h-px bg-white/15" />
                </div>

                {/* ── Google Sign-In ── */}
                <button
                  id="googleSignInBtn"
                  type="button"
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 15.108 19.002 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#FBBC05" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#EA4335" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Continue with Google
                </button>

                {/* ── Register link ── */}
                <p className="text-center text-slate-400 text-xs">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors hover:underline underline-offset-2"
                  >
                    Create Account
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

export default LoginPage
