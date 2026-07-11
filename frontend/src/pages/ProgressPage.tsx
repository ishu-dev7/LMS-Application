import { Fragment, useEffect, useState } from 'react'
import { api } from '../api'
import ProgressRing from '../components/ProgressRing'
import type { ProgressSummary } from '../types'

export default function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<ProgressSummary>('/api/progress/summary').then(setSummary).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="page"><div className="form-error">{error}</div></div>
  if (!summary) return <div className="page"><p className="muted">Loading progress…</p></div>

  let lastCourse = ''

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>📊 Your Progress</h1>
          <p className="muted">The tracker from Appendix D — module by module, checkpoint by checkpoint.</p>
        </div>
      </header>

      <div className="stat-row">
        {summary.courses.map((c) => (
          <div key={c.id} className="stat-card ring-card">
            <ProgressRing percent={c.percentComplete} size={72} />
            <div>
              <div className="stat-label strong">{c.title}</div>
              <div className="muted">{c.completedLessons}/{c.totalLessons} lessons</div>
            </div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-value">{summary.journalEntries}</div>
          <div className="stat-label">Journal entries · streak {summary.journalStreakDays}🔥</div>
        </div>
      </div>

      <div className="tracker card">
        <table>
          <thead>
            <tr>
              <th>Module</th>
              <th>Phase</th>
              <th>Lessons</th>
              <th>Checkpoint</th>
            </tr>
          </thead>
          <tbody>
            {summary.moduleTracker.map((m, i) => {
              const showCourse = m.courseTitle !== lastCourse
              lastCourse = m.courseTitle
              const pct = m.lessonsTotal === 0 ? 0 : Math.round((100 * m.lessonsDone) / m.lessonsTotal)
              return (
                <Fragment key={i}>
                  {showCourse && (
                    <tr className="course-row">
                      <td colSpan={4}>{m.courseTitle}</td>
                    </tr>
                  )}
                  <tr>
                    <td>{m.module}</td>
                    <td className="muted">{m.phase}</td>
                    <td>
                      <div className="bar">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="muted small">{m.lessonsDone}/{m.lessonsTotal}</span>
                    </td>
                    <td>
                      {!m.hasQuiz ? <span className="muted">—</span>
                        : m.quizPassed ? <span className="quiz-badge passed">🏆 Passed</span>
                        : <span className="quiz-badge">Pending</span>}
                    </td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
