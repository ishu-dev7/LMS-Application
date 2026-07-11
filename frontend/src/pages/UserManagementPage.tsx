import { useEffect, useState } from 'react'
import { api } from '../api'
import type { AdminUser, CourseEnrollment } from '../types'

// ── helpers ──────────────────────────────────────────────────────────────────

function roleBadge(role: string) {
  return (
    <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
  )
}

// ── create user modal ─────────────────────────────────────────────────────────

interface CreateUserModalProps {
  onClose: () => void
  onCreated: (u: AdminUser) => void
}

function CreateUserModal({ onClose, onCreated }: CreateUserModalProps) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Learner')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const u = await api.post<AdminUser>('/api/admin/users', { email, displayName, password, role })
      onCreated(u)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create User</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="modal-body form-grid">
          <label>Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>Display Name
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} required />
          </label>
          <label>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={6} placeholder="Min 6 characters" />
          </label>
          <label>Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="Learner">Learner</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── edit user modal ───────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: AdminUser
  onClose: () => void
  onSaved: () => void
}

function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName)
  const [role, setRole] = useState(user.role)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await api.put(`/api/admin/users/${user.id}`, {
        displayName, role, newPassword: newPassword || null,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit User — {user.email}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="modal-body form-grid">
          <label>Display Name
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} required />
          </label>
          <label>Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="Learner">Learner</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          <label>New Password <span style={{ fontWeight: 400, fontSize: 12 }}>(leave blank to keep current)</span>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              minLength={6} placeholder="Min 6 characters" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── enrollment panel ──────────────────────────────────────────────────────────

interface EnrollmentPanelProps {
  user: AdminUser
  onClose: () => void
  onChanged: () => void   // reload user list (enrollment count changes)
}

function EnrollmentPanel({ user, onClose, onChanged }: EnrollmentPanelProps) {
  const [courses, setCourses] = useState<CourseEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  async function load() {
    const data = await api.get<CourseEnrollment[]>(`/api/admin/users/${user.id}/enrollments`)
    setCourses(data)
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [user.id])

  async function toggle(c: CourseEnrollment) {
    setToggling(c.courseId)
    try {
      if (c.enrolled) {
        await api.delete(`/api/admin/users/${user.id}/enrollments/${c.courseId}`)
      } else {
        await api.post(`/api/admin/users/${user.id}/enrollments/${c.courseId}`)
      }
      await load()
      onChanged()
    } finally { setToggling(null) }
  }

  const byCategory = courses.reduce<Record<string, CourseEnrollment[]>>((acc, c) => {
    ;(acc[c.category] ??= []).push(c)
    return acc
  }, {})

  return (
    <div className="enroll-panel">
      <div className="enroll-panel-header">
        <div>
          <h3>Course Assignments</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>
            {user.displayName} · {user.email}
          </p>
        </div>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      {loading ? (
        <p className="text-muted" style={{ padding: 16 }}>Loading…</p>
      ) : (
        <div className="enroll-list">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="enroll-category">
              <p className="enroll-category-title">{cat}</p>
              {items.map(c => (
                <div key={c.courseId} className={`enroll-row ${c.enrolled ? 'enrolled' : ''}`}>
                  <div className="enroll-row-info">
                    <span className="enroll-course-title">{c.title}</span>
                  </div>
                  <button
                    className={`btn btn-sm ${c.enrolled ? 'btn-danger-outline' : 'btn-primary-outline'}`}
                    onClick={() => toggle(c)}
                    disabled={toggling === c.courseId}
                  >
                    {toggling === c.courseId ? '…' : c.enrolled ? '✕ Remove' : '+ Assign'}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [enrolling, setEnrolling] = useState<AdminUser | null>(null)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  async function load() {
    const data = await api.get<AdminUser[]>('/api/admin/users')
    setUsers(data)
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function deleteUser(u: AdminUser) {
    if (!confirm(`Delete user "${u.displayName}" (${u.email})? This removes all their progress, journal entries and enrollments.`)) return
    setDeleting(u.id)
    try {
      await api.delete(`/api/admin/users/${u.id}`)
      setUsers(prev => prev.filter(x => x.id !== u.id))
      if (enrolling?.id === u.id) setEnrolling(null)
    } finally { setDeleting(null) }
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName.toLowerCase().includes(search.toLowerCase())
  )

  const learnerCount = users.filter(u => u.role === 'Learner').length
  const adminCount = users.filter(u => u.role === 'Admin').length

  return (
    <div className="page-layout">
      {/* ── left: user list ── */}
      <div className="um-left">
        <div className="panel-header">
          <div>
            <h2>Users</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>
              {learnerCount} learner{learnerCount !== 1 ? 's' : ''} · {adminCount} admin{adminCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            + New User
          </button>
        </div>

        <input
          className="search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ margin: '12px 16px', width: 'calc(100% - 32px)' }}
        />

        {loading ? (
          <p className="text-muted" style={{ padding: 16 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted" style={{ padding: 16 }}>No users found</p>
        ) : (
          <div className="um-user-list">
            {filtered.map(u => (
              <div
                key={u.id}
                className={`um-user-row ${enrolling?.id === u.id ? 'active' : ''}`}
                onClick={() => setEnrolling(u)}
              >
                <div className="um-user-avatar">
                  {u.displayName[0]?.toUpperCase()}
                </div>
                <div className="um-user-info">
                  <div className="um-user-name">
                    {u.displayName}
                    {roleBadge(u.role)}
                  </div>
                  <div className="um-user-email">{u.email}</div>
                  <div className="um-user-meta">
                    {u.enrollmentCount} course{u.enrollmentCount !== 1 ? 's' : ''} · joined {u.createdAt}
                  </div>
                </div>
                <div className="um-user-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn-icon-sm" title="Edit" onClick={() => setEditing(u)}>✏️</button>
                  <button className="btn-icon-sm" title="Delete"
                    disabled={deleting === u.id}
                    onClick={() => deleteUser(u)}>
                    {deleting === u.id ? '…' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── right: enrollment panel ── */}
      <div className="um-right">
        {enrolling ? (
          <EnrollmentPanel
            user={enrolling}
            onClose={() => setEnrolling(null)}
            onChanged={load}
          />
        ) : (
          <div className="um-empty-state">
            <p>👈 Select a user to manage their course assignments</p>
          </div>
        )}
      </div>

      {/* modals */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={u => { setUsers(prev => [...prev, u]); setShowCreate(false) }}
        />
      )}
      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { load(); setEditing(null) }}
        />
      )}
    </div>
  )
}
