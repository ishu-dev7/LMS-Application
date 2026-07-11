import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📈</span>
          <div>
            <div className="brand-name">Share Market LMS</div>
            <div className="brand-sub">NSE · BSE · Learn properly</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>🏠 Dashboard</NavLink>
          <NavLink to="/journal">📓 Daily Journal</NavLink>
          <NavLink to="/progress">📊 Progress</NavLink>
          {user?.role === 'Admin' && <NavLink to="/admin">⚙️ Course Setup</NavLink>}
          {user?.role === 'Admin' && <NavLink to="/admin/quiz-master">🧩 Quiz Master</NavLink>}
          {user?.role === 'Admin' && <NavLink to="/admin/users">👥 Users</NavLink>}
        </nav>

        <div className="sidebar-footer">
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
