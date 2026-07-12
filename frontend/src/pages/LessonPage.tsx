import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { api } from '../api'
import { getVisualsFor } from '../components/Visuals'
import type { LessonDetail } from '../types'

export default function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get<LessonDetail>(`/api/lessons/${id}`).then(setLesson).catch((e) => setError(e.message))
  }, [id])

  async function toggleComplete() {
    if (!lesson) return
    if (lesson.completed) {
      await api.delete(`/api/lessons/${lesson.id}/complete`)
      setLesson({ ...lesson, completed: false })
    } else {
      await api.post(`/api/lessons/${lesson.id}/complete`)
      setLesson({ ...lesson, completed: true })
    }
  }

  async function completeAndNext() {
    if (!lesson) return
    if (!lesson.completed) await api.post(`/api/lessons/${lesson.id}/complete`)
    if (lesson.nextLessonId) navigate(`/lessons/${lesson.nextLessonId}`)
    else navigate(`/courses/${lesson.courseSlug}`)
  }

  if (error) return <div className="page"><div className="form-error">{error}</div></div>
  if (!lesson) return <div className="page"><p className="muted">Loading lesson…</p></div>

  const visuals = getVisualsFor(lesson.title, lesson.moduleTitle)

  return (
    <div className="page lesson-page">
      <nav className="breadcrumb">
        <Link to="/">Dashboard</Link> <span>/</span>{' '}
        <Link to={`/courses/${lesson.courseSlug}`}>{lesson.courseTitle}</Link> <span>/</span>{' '}
        <span>{lesson.moduleTitle}</span>
      </nav>

      <header className="lesson-header">
        <h1>{lesson.title}</h1>
        <div className="lesson-header-meta">
          <span className="muted">⏱ ~{lesson.estimatedMinutes} min read</span>
          <button className={`btn btn-small ${lesson.completed ? 'btn-ghost' : 'btn-primary'}`} onClick={toggleComplete}>
            {lesson.completed ? '✓ Completed — undo' : 'Mark as complete'}
          </button>
        </div>
      </header>

      {visuals.length > 0 && (
        <div className="visuals">
          {visuals.map((v) => (
            <figure key={v.title} className="visual-card">
              <figcaption>📐 Visual aid — {v.title}</figcaption>
              <v.Comp />
            </figure>
          ))}
        </div>
      )}

      <article className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{lesson.contentMarkdown}</ReactMarkdown>
      </article>

      <footer className="lesson-nav">
        {lesson.prevLessonId ? (
          <Link className="btn btn-ghost" to={`/lessons/${lesson.prevLessonId}`}>← Previous</Link>
        ) : <span />}
        <button className="btn btn-primary" onClick={completeAndNext}>
          {lesson.nextLessonId ? 'Complete & continue →' : 'Complete & back to course'}
        </button>
      </footer>
    </div>
  )
}
