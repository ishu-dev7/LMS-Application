import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { CourseSummary, CourseDetail, LessonDetail, LessonAttachment, Module } from '../types'

interface CourseForm { id: number | null; slug: string; title: string; description: string; category: string; order: number }
interface TopicForm { id: number | null; title: string; phase: string; order: number; topicType: string }
interface LessonForm { id: number | null; moduleId: number; title: string; contentMarkdown: string; order: number }

const emptyCourse: CourseForm = { id: null, slug: '', title: '', description: '', category: 'General', order: 99 }
const emptyTopic = (order: number): TopicForm => ({ id: null, title: '', phase: '', order, topicType: 'Regular' })

const TOPIC_TYPE_LABEL: Record<string, { label: string; cls: string }> = {
  Regular: { label: '📚 Regular', cls: 'badge-regular' },
  InterviewReady: { label: '🎤 Interview Ready', cls: 'badge-interview' },
}

function topicTypeBadge(type: string) {
  const t = TOPIC_TYPE_LABEL[type] ?? { label: type, cls: '' }
  return <span className={`topic-type-badge ${t.cls}`}>{t.label}</span>
}

function quizBadge(quiz: Module['quiz']) {
  if (!quiz) return <span className="quiz-badge-none muted small">No quiz</span>
  const icon = quiz.quizType === 'Evaluation' ? '🎯' : '📝'
  return <span className="quiz-badge-assigned small">{icon} {quiz.title}</span>
}

export default function AdminPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [detail, setDetail] = useState<CourseDetail | null>(null)
  const [courseForm, setCourseForm] = useState<CourseForm | null>(null)
  const [topicForm, setTopicForm] = useState<TopicForm | null>(null)
  const [lessonForm, setLessonForm] = useState<LessonForm | null>(null)
  const [uploadLessonId, setUploadLessonId] = useState<number | null>(null)
  const [uploadLessonAttachments, setUploadLessonAttachments] = useState<LessonAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadCourses() {
    setCourses(await api.get<CourseSummary[]>('/api/courses'))
  }

  async function loadDetail(slug: string) {
    setDetail(await api.get<CourseDetail>(`/api/courses/${slug}`))
  }

  useEffect(() => { loadCourses().catch((e) => setError(e.message)) }, [])
  useEffect(() => {
    if (selectedSlug) loadDetail(selectedSlug).catch((e) => setError(e.message))
    else setDetail(null)
  }, [selectedSlug])

  function flash(msg: string) {
    setNotice(msg); setError('')
    setTimeout(() => setNotice(''), 2500)
  }

  async function run(action: () => Promise<void>) {
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : 'Operation failed') }
  }

  // ---- course ----
  async function saveCourse(e: FormEvent) {
    e.preventDefault()
    if (!courseForm) return
    await run(async () => {
      if (courseForm.id === null) {
        await api.post('/api/admin/courses', courseForm)
        flash('Course created')
      } else {
        await api.put(`/api/admin/courses/${courseForm.id}`, courseForm)
        flash('Course updated')
      }
      setCourseForm(null)
      await loadCourses()
      if (selectedSlug) await loadDetail(courseForm.slug).catch(() => setSelectedSlug(null))
    })
  }

  async function deleteCourse(c: CourseSummary) {
    if (!confirm(`Delete course "${c.title}" with ALL its topics, lessons and learner progress?`)) return
    await run(async () => {
      await api.delete(`/api/admin/courses/${c.id}`)
      if (selectedSlug === c.slug) setSelectedSlug(null)
      await loadCourses()
      flash('Course deleted')
    })
  }

  // ---- topic (module) ----
  async function saveTopic(e: FormEvent) {
    e.preventDefault()
    if (!topicForm || !detail) return
    await run(async () => {
      if (topicForm.id === null) {
        await api.post('/api/admin/modules', { ...topicForm, courseId: detail.id })
        flash('Topic added')
      } else {
        await api.put(`/api/admin/modules/${topicForm.id}`, { ...topicForm, courseId: detail.id })
        flash('Topic updated')
      }
      setTopicForm(null)
      await loadDetail(detail.slug)
    })
  }

  async function deleteTopic(id: number, title: string) {
    if (!detail || !confirm(`Delete topic "${title}" and all its lessons?`)) return
    await run(async () => {
      await api.delete(`/api/admin/modules/${id}`)
      await loadDetail(detail.slug)
      flash('Topic deleted')
    })
  }

  // ---- lesson ----
  async function openLessonEditor(lessonId: number, moduleId: number) {
    await run(async () => {
      const l = await api.get<LessonDetail>(`/api/lessons/${lessonId}`)
      setLessonForm({ id: l.id, moduleId, title: l.title, contentMarkdown: l.contentMarkdown, order: 0 })
    })
  }

  async function saveLesson(e: FormEvent) {
    e.preventDefault()
    if (!lessonForm || !detail) return
    await run(async () => {
      if (lessonForm.id === null) {
        await api.post('/api/admin/lessons', lessonForm)
        flash('Lesson created')
      } else {
        await api.put(`/api/admin/lessons/${lessonForm.id}`, lessonForm)
        flash('Lesson updated — content saved to database')
      }
      setLessonForm(null)
      await loadDetail(detail.slug)
    })
  }

  async function deleteLesson(id: number, title: string) {
    if (!detail || !confirm(`Delete lesson "${title}"?`)) return
    await run(async () => {
      await api.delete(`/api/admin/lessons/${id}`)
      await loadDetail(detail.slug)
      flash('Lesson deleted')
    })
  }

  // ---- attachments ----
  async function openAttachments(lessonId: number) {
    await run(async () => {
      const l = await api.get<LessonDetail>(`/api/lessons/${lessonId}`)
      setUploadLessonId(lessonId)
      setUploadLessonAttachments(l.attachments)
    })
  }

  async function uploadFile(e: FormEvent) {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file || uploadLessonId === null) return
    setUploading(true)
    await run(async () => {
      const fd = new FormData()
      fd.append('file', file)
      await api.upload(`/api/admin/lessons/${uploadLessonId}/attachments`, fd)
      if (fileInputRef.current) fileInputRef.current.value = ''
      const l = await api.get<LessonDetail>(`/api/lessons/${uploadLessonId}`)
      setUploadLessonAttachments(l.attachments)
      flash('File uploaded')
    })
    setUploading(false)
  }

  async function deleteAttachment(lessonId: number, attId: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await run(async () => {
      await api.delete(`/api/admin/lessons/${lessonId}/attachments/${attId}`)
      const l = await api.get<LessonDetail>(`/api/lessons/${lessonId}`)
      setUploadLessonAttachments(l.attachments)
      flash('Attachment deleted')
    })
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="page admin-page">
      <header className="page-header">
        <div>
          <h1>⚙️ Course Setup</h1>
          <p className="muted">
            Manage the course hierarchy: Course → Topics → Lessons &amp; Quizzes.
            For quiz creation go to <Link to="/admin/quiz-master">🧩 Quiz Master</Link>.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCourseForm(emptyCourse)}>+ New course</button>
      </header>

      {error && <div className="form-error">{error}</div>}
      {notice && <div className="form-notice">{notice}</div>}

      <div className="admin-grid">
        {/* course list */}
        <div className="admin-courses card">
          <h2 className="section-title" style={{ marginTop: 0 }}>Courses ({courses.length})</h2>
          {courses.map((c) => (
            <div key={c.id} className={`admin-course-row ${selectedSlug === c.slug ? 'selected' : ''}`}>
              <button className="admin-course-pick" onClick={() => setSelectedSlug(c.slug)}>
                <strong>{c.title}</strong>
                <span className="muted small">{c.category} · {c.totalLessons} lessons</span>
              </button>
              <div className="admin-row-actions">
                <button className="btn btn-ghost btn-small"
                  onClick={() => setCourseForm({ id: c.id, slug: c.slug, title: c.title, description: c.description, category: c.category, order: 0 })}>
                  Edit
                </button>
                <button className="btn btn-ghost btn-small danger" onClick={() => deleteCourse(c)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* course detail: topics */}
        <div className="admin-detail">
          {!detail && <div className="card muted">Select a course on the left to manage its topics and lessons.</div>}
          {detail && (
            <>
              <div className="admin-detail-head">
                <h2>{detail.title}</h2>
                <button className="btn btn-primary btn-small"
                  onClick={() => setTopicForm(emptyTopic(detail.modules.length))}>
                  + Add topic
                </button>
              </div>

              {detail.modules.map((m) => (
                <div key={m.id} className={`card admin-module topic-${m.topicType.toLowerCase()}`}>
                  <div className="admin-module-head">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong>{m.title}</strong>
                        {topicTypeBadge(m.topicType)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        {m.phase && <span className="muted small">{m.phase}</span>}
                        {quizBadge(m.quiz)}
                      </div>
                    </div>
                    <div className="admin-row-actions">
                      <button className="btn btn-ghost btn-small"
                        onClick={() => setLessonForm({ id: null, moduleId: m.id, title: '', contentMarkdown: '', order: m.lessons.length })}>
                        + Lesson
                      </button>
                      <button className="btn btn-ghost btn-small"
                        onClick={() => setTopicForm({ id: m.id, title: m.title, phase: m.phase, order: m.order, topicType: m.topicType })}>
                        Edit
                      </button>
                      <button className="btn btn-ghost btn-small danger" onClick={() => deleteTopic(m.id, m.title)}>Delete</button>
                    </div>
                  </div>

                  <ul className="admin-lessons">
                    {m.lessons.map((l) => (
                      <li key={l.id}>
                        <span>{l.title} <span className="muted small">({l.estimatedMinutes} min)</span></span>
                        <span className="admin-row-actions">
                          <button className="btn btn-ghost btn-small" onClick={() => openAttachments(l.id)} title="Manage attachments">📎</button>
                          <button className="btn btn-ghost btn-small" onClick={() => openLessonEditor(l.id, m.id)}>Edit</button>
                          <button className="btn btn-ghost btn-small danger" onClick={() => deleteLesson(l.id, l.title)}>Delete</button>
                        </span>
                      </li>
                    ))}
                    {m.lessons.length === 0 && <li className="muted">No lessons yet.</li>}
                  </ul>

                  {!m.quiz && (
                    <div className="topic-quiz-hint muted small">
                      No quiz assigned — <Link to="/admin/quiz-master">assign one in Quiz Master</Link>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* course form modal */}
      {courseForm && (
        <div className="modal-backdrop" onClick={() => setCourseForm(null)}>
          <form className="modal card" onClick={(e) => e.stopPropagation()} onSubmit={saveCourse}>
            <h2>{courseForm.id === null ? 'New course' : 'Edit course'}</h2>
            <label>Title
              <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
            </label>
            <label>Slug (lowercase-with-hyphens)
              <input value={courseForm.slug} pattern="[a-z0-9-]+"
                onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })} required />
            </label>
            <label>Category
              <input value={courseForm.category} list="admin-categories"
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} required />
              <datalist id="admin-categories">
                {[...new Set(courses.map((c) => c.category))].map((cat) => <option key={cat} value={cat} />)}
              </datalist>
            </label>
            <label>Description
              <textarea rows={3} value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setCourseForm(null)}>Cancel</button>
              <button className="btn btn-primary">Save course</button>
            </div>
          </form>
        </div>
      )}

      {/* topic form modal */}
      {topicForm && (
        <div className="modal-backdrop" onClick={() => setTopicForm(null)}>
          <form className="modal card" onClick={(e) => e.stopPropagation()} onSubmit={saveTopic}>
            <h2>{topicForm.id === null ? 'Add topic' : 'Edit topic'}</h2>
            <label>Title
              <input value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} required />
            </label>
            <label>Topic type
              <select value={topicForm.topicType} onChange={(e) => setTopicForm({ ...topicForm, topicType: e.target.value })}>
                <option value="Regular">📚 Regular — standard lesson topic</option>
                <option value="InterviewReady">🎤 Interview Ready — Q&amp;A and career prep</option>
              </select>
            </label>
            <label>Phase / group label (optional)
              <input value={topicForm.phase} onChange={(e) => setTopicForm({ ...topicForm, phase: e.target.value })}
                placeholder="e.g. Core Content, Interview Prep" />
            </label>
            <label>Order
              <input type="number" value={topicForm.order}
                onChange={(e) => setTopicForm({ ...topicForm, order: Number(e.target.value) })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setTopicForm(null)}>Cancel</button>
              <button className="btn btn-primary">Save topic</button>
            </div>
          </form>
        </div>
      )}

      {/* lesson editor modal */}
      {lessonForm && (
        <div className="modal-backdrop" onClick={() => setLessonForm(null)}>
          <form className="modal modal-wide card" onClick={(e) => e.stopPropagation()} onSubmit={saveLesson}>
            <h2>{lessonForm.id === null ? 'New lesson' : 'Edit lesson'}</h2>
            <label>Title
              <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
            </label>
            <label>Content (Markdown — headings, lists, tables, code blocks all render)
              <textarea rows={16} className="mono" value={lessonForm.contentMarkdown}
                onChange={(e) => setLessonForm({ ...lessonForm, contentMarkdown: e.target.value })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setLessonForm(null)}>Cancel</button>
              <button className="btn btn-primary">Save lesson</button>
            </div>
          </form>
        </div>
      )}

      {/* attachments modal */}
      {uploadLessonId !== null && (
        <div className="modal-backdrop" onClick={() => setUploadLessonId(null)}>
          <div className="modal modal-wide card" onClick={(e) => e.stopPropagation()}>
            <h2>📎 Lesson Attachments</h2>
            <p className="muted small">Upload documents, PDFs, slides, or any media for this lesson.</p>

            {uploadLessonAttachments.length > 0 && (
              <ul className="attachment-list">
                {uploadLessonAttachments.map((a) => (
                  <li key={a.id}>
                    <a href={`/api/attachments/${a.id}`} target="_blank" rel="noreferrer" className="attachment-name">
                      📄 {a.fileName}
                    </a>
                    <span className="muted small">{formatSize(a.fileSize)}</span>
                    <button className="btn btn-ghost btn-small danger"
                      onClick={() => deleteAttachment(uploadLessonId, a.id, a.fileName)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {uploadLessonAttachments.length === 0 && <p className="muted">No attachments yet.</p>}

            <form onSubmit={uploadFile} className="upload-form">
              <input ref={fileInputRef} type="file" className="file-input" />
              <button className="btn btn-primary btn-small" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload file'}
              </button>
            </form>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setUploadLessonId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
