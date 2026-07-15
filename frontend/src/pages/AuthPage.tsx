import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useTheme } from '../theme'

const FEATURES = [
  { icon: '📊', label: 'Share Market & Trading' },
  { icon: '💻', label: 'Full-Stack Development' },
  { icon: '🏭', label: 'ERP Systems & Flows' },
  { icon: '🧩', label: 'Quizzes & Progress Tracking' },
]

export default function AuthPage() {
  const { login, register } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function switchMode(m: 'login' | 'register') {
    setMode(m)
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, displayName, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left: Brand Panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        <div className="auth-brand-content">
          <div className="auth-logo-wrap">
            <div className="auth-logo-mark">N</div>
            <span className="auth-logo-name">Nexora</span>
          </div>

          <p className="auth-brand-tagline">
            Your complete learning ecosystem — from markets to code to enterprise.
          </p>

          <ul className="auth-feature-list">
            {FEATURES.map(f => (
              <li key={f.label}>
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <p className="auth-brand-footer">Trusted by learners across domains</p>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-form-panel">
        <button className="auth-theme-btn" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>{mode === 'login' ? 'Welcome back' : 'Get started'}</h2>
            <p>
              {mode === 'login'
                ? 'Sign in to continue your learning journey'
                : 'Create your free Nexora account today'}
            </p>
          </div>

          <div className="auth-tabs-new">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>
              Sign in
            </button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="auth-form-new">
            {mode === 'register' && (
              <div className="auth-field">
                <span className="auth-field-icon">👤</span>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  required
                  autoFocus
                />
              </div>
            )}

            <div className="auth-field">
              <span className="auth-field-icon">✉️</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoFocus={mode === 'login'}
              />
            </div>

            <div className="auth-field">
              <span className="auth-field-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Password (min 6 characters)' : 'Password'}
                required
                minLength={6}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="btn btn-primary auth-submit" disabled={busy}>
              {busy
                ? 'Please wait…'
                : mode === 'login'
                ? 'Sign in →'
                : 'Create account →'}
            </button>
          </form>

          <p className="auth-footnote">
            {mode === 'login' ? (
              <>No account?{' '}
                <button className="auth-link" onClick={() => switchMode('register')}>Sign up free</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button className="auth-link" onClick={() => switchMode('login')}>Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
