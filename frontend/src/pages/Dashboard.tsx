import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, localToday } from '../api'
import { useAuth } from '../auth'
import ProgressRing from '../components/ProgressRing'
import type { CourseSummary, ProgressSummary } from '../types'

const COURSE_EMOJI: Record<string, string> = {
  'share-market-mastery': '🎓',
  'graph-market-reading': '📉',
  'dotnet-framework': '🧱',
  'dotnet-core': '🚀',
  react: '⚛️',
  angular: '🅰️',
  'sql-server': '🗄️',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<CourseSummary[]>('/api/courses').then(setCourses).catch((e) => setError(e.message))
    api.get<ProgressSummary>('/api/progress/summary').then(setSummary).catch(() => {})
  }, [])

  const today = localToday()
  const categories = [...new Set(courses.map((c) => c.category))]

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Welcome back, {user?.displayName} 👋</h1>
          <p className="muted">Tide first, boat second — check the market, journal it, then study.</p>
        </div>
      </header>

      {error && <div className="form-error">{error} — is the backend running on port 5199?</div>}

      {summary && (
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-value">{summary.lessonsCompleted}<span className="stat-total">/{summary.totalLessons}</span></div>
            <div className="stat-label">Lessons completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.quizzesPassed}<span className="stat-total">/{summary.totalQuizzes}</span></div>
            <div className="stat-label">Checkpoints passed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{summary.journalStreakDays}<span className="stat-total"> days</span></div>
            <div className="stat-label">Journal streak 🔥</div>
          </div>
          <Link to="/journal" className="stat-card stat-cta">
            <div className="stat-value">📓</div>
            <div className="stat-label">Write today's journal ({today})</div>
          </Link>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="section-title">{cat}</h2>
          <div className="course-grid">
            {courses.filter((c) => c.category === cat).map((c) => (
              <Link key={c.id} to={`/courses/${c.slug}`} className="course-card">
                <div className="course-card-head">
                  <span className="course-emoji">{COURSE_EMOJI[c.slug] ?? '📘'}</span>
                  <ProgressRing percent={c.percentComplete} />
                </div>
                <h3>{c.title}</h3>
                <p className="muted">{c.description}</p>
                <div className="course-meta">
                  {c.completedLessons}/{c.totalLessons} lessons ·{' '}
                  {c.percentComplete === 100 ? 'Complete ✅' : c.completedLessons > 0 ? 'In progress' : 'Not started'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {courses.length === 0 && !error && <p className="muted">Loading courses…</p>}

      <div className="rules-card">
        <h3>⚠️ The golden rules</h3>
        <ul>
          <li>No F&amp;O trading until Modules 7–9 are complete. No exceptions.</li>
          <li>No meaningful real-money trading until Module 7 (Risk Management).</li>
          <li>If anything promises fast money, it is by definition wrong for you.</li>
        </ul>
      </div>
    </div>
  )
}
