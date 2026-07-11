import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import type { CourseDetail } from '../types'

export default function CoursePage() {
  const { slug } = useParams()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [error, setError] = useState('')
  const [openModules, setOpenModules] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.get<CourseDetail>(`/api/courses/${slug}`)
      .then((c) => {
        setCourse(c)
        // Start with the first module that still has incomplete lessons open.
        const firstIncomplete = c.modules.find((m) => m.lessons.some((l) => !l.completed))
        const initial = firstIncomplete?.id ?? c.modules[0]?.id
        setOpenModules(initial !== undefined ? new Set([initial]) : new Set())
      })
      .catch((e) => setError(e.message))
  }, [slug])

  function toggleModule(id: number) {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (error) return <div className="page"><div className="form-error">{error}</div></div>
  if (!course) return <div className="page"><p className="muted">Loading course…</p></div>

  let lastPhase = ''

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Dashboard</Link> <span>/</span> <span>{course.title}</span>
      </nav>
      <header className="page-header">
        <div>
          <h1>{course.title}</h1>
          <p className="muted">{course.description}</p>
        </div>
      </header>

      <div className="module-list">
        {course.modules.map((m) => {
          const showPhase = m.phase !== lastPhase
          lastPhase = m.phase
          const done = m.lessons.filter((l) => l.completed).length
          const isOpen = openModules.has(m.id)
          return (
            <div key={m.id}>
              {showPhase && <div className="phase-label">{m.phase}</div>}
              <div className={`module-card ${isOpen ? 'open' : ''}`}>
                <button className="module-head" onClick={() => toggleModule(m.id)}>
                  <div className="module-title">
                    <span className={`module-tick ${done === m.lessons.length && m.lessons.length > 0 ? 'done' : ''}`}>
                      {done === m.lessons.length && m.lessons.length > 0 ? '✓' : m.order}
                    </span>
                    <span>{m.title}</span>
                  </div>
                  <div className="module-meta">
                    <span className="muted">{done}/{m.lessons.length} lessons</span>
                    {m.quiz && (
                      <span className={`quiz-badge ${m.quiz.passed ? 'passed' : ''}`}>
                        {m.quiz.passed ? '🏆 Checkpoint passed' : '📝 Checkpoint'}
                      </span>
                    )}
                    <span className="chevron">{isOpen ? '▾' : '▸'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="lesson-list">
                    {m.lessons.map((l) => (
                      <Link key={l.id} to={`/lessons/${l.id}`} className="lesson-row">
                        <span className={`lesson-tick ${l.completed ? 'done' : ''}`}>
                          {l.completed ? '✓' : '○'}
                        </span>
                        <span className="lesson-title">{l.title}</span>
                        <span className="lesson-mins muted">{l.estimatedMinutes} min</span>
                      </Link>
                    ))}
                    {m.quiz && (
                      <Link to={`/quiz/${m.quiz.quizId}`} className="lesson-row quiz-row">
                        <span className={`lesson-tick ${m.quiz.passed ? 'done' : ''}`}>
                          {m.quiz.passed ? '✓' : '📝'}
                        </span>
                        <span className="lesson-title">
                          {m.quiz.title} — {m.quiz.questionCount} questions, pass ≥ {m.quiz.passPercent}%
                        </span>
                        <span className="lesson-mins muted">
                          {m.quiz.bestScorePercent !== null ? `best ${m.quiz.bestScorePercent}%` : 'not attempted'}
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
