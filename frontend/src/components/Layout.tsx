import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { useTheme } from '../theme'
import { api } from '../api'
import type { ReactNode } from 'react'
import type { CourseSummary } from '../types'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [hasTraining, setHasTraining] = useState(false)

  useEffect(() => {
    api.get<CourseSummary[]>('/api/courses')
      .then(all => setHasTraining(all.some(c => c.category === 'Training')))
      .catch(() => {})
  }, [])

  const isLight = theme === 'light'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📈</span>
          <div>
            <div className="brand-name">Nexora</div>
            <div className="brand-sub">Learn without limits</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>🏠 Dashboard</NavLink>
          <NavLink to="/journal">📓 Daily Journal</NavLink>
          <NavLink to="/progress">📊 Progress</NavLink>
          {(hasTraining || user?.role === 'Admin') && (
            <NavLink to="/training">
              🎓 Training
              <span className="nav-training-badge">NEW</span>
            </NavLink>
          )}
          {user?.role === 'Admin' && <NavLink to="/admin">⚙️ Course Setup</NavLink>}
          {user?.role === 'Admin' && <NavLink to="/admin/quiz-master">🧩 Quiz Master</NavLink>}
          {user?.role === 'Admin' && <NavLink to="/admin/users">👥 Users</NavLink>}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggle} title="Toggle dark / light mode">
            <span className="theme-toggle-icon">{isLight ? '☀️' : '🌙'}</span>
            <span className="theme-toggle-label">{isLight ? 'Light' : 'Dark'}</span>
            <span className={`theme-toggle-track${isLight ? ' on' : ''}`}>
              <span className="theme-toggle-knob" />
            </span>
          </button>

          <div className="user-chip" title={user?.email}>
            <span className="avatar">{user?.displayName?.[0]?.toUpperCase() ?? '?'}</span>
            <span className="user-name">{user?.displayName}</span>
          </div>
          <button
            className="btn btn-ghost btn-small"
            onClick={() => {
              logout()
              navigate('/auth')
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  )
}
