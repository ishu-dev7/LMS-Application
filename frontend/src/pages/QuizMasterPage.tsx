import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'
import type { QuizMasterSummary, QuizMasterDetail, QuizQuestionDetail, TopicPicker } from '../types'

interface QuizForm { id: number | null; title: string; quizType: string; passPercent: number }
interface QuestionForm {
  id: number | null; quizId: number
  text: string; optionA: string; optionB: string; optionC: string; optionD: string
  correctIndex: number; explanation: string
}

const emptyQuizForm = (): QuizForm => ({ id: null, title: '', quizType: 'Exercise', passPercent: 70 })
const emptyQForm = (quizId: number): QuestionForm => ({
  id: null, quizId, text: '', optionA: '', optionB: '', optionC: '', optionD: '',
  correctIndex: 0, explanation: '',
})

const TYPE_LABEL: Record<string, string> = { Exercise: '📝 Exercise', Evaluation: '🎯 Evaluation' }
const TOPIC_TYPE_LABEL: Record<string, string> = { Regular: '📚 Regular', InterviewReady: '🎤 Interview Ready' }

export default function QuizMasterPage() {
  const [quizzes, setQuizzes] = useState<QuizMasterSummary[]>([])
  const [selected, setSelected] = useState<QuizMasterDetail | null>(null)
  const [quizForm, setQuizForm] = useState<QuizForm | null>(null)
  const [questionForm, setQuestionForm] = useState<QuestionForm | null>(null)
  const [assignModal, setAssignModal] = useState(false)
  const [topics, setTopics] = useState<TopicPicker[]>([])
  const [topicFilter, setTopicFilter] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadQuizzes() {
    setQuizzes(await api.get<QuizMasterSummary[]>('/api/admin/quiz-master'))
  }

  async function loadSelected(id: number) {
    setSelected(await api.get<QuizMasterDetail>(`/api/admin/quiz-master/${id}`))
  }

  useEffect(() => { loadQuizzes().catch((e) => setError(e.message)) }, [])

  function flash(msg: string) {
    setNotice(msg); setError('')
    setTimeout(() => setNotice(''), 2500)
  }

  async function run(action: () => Promise<void>) {
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : 'Operation failed') }
  }

  // ---- quiz ----
  async function saveQuiz(e: FormEvent) {
    e.preventDefault()
    if (!quizForm) return
    await run(async () => {
      if (quizForm.id === null) {
        const res = await api.post<{ id: number }>('/api/admin/quiz-master', quizForm)
        flash('Quiz created')
        await loadQuizzes()
        await loadSelected(res.id)
      } else {
        await api.put(`/api/admin/quiz-master/${quizForm.id}`, quizForm)
        flash('Quiz updated')
        await loadQuizzes()
        if (selected) await loadSelected(selected.id)
      }
      setQuizForm(null)
    })
  }

  async function deleteQuiz(id: number, title: string) {
    if (!confirm(`Delete quiz "${title}" including all questions and attempts?`)) return
    await run(async () => {
      await api.delete(`/api/admin/quiz-master/${id}`)
      if (selected?.id === id) setSelected(null)
      await loadQuizzes()
      flash('Quiz deleted')
    })
  }

  // ---- question ----
  async function saveQuestion(e: FormEvent) {
    e.preventDefault()
    if (!questionForm || !selected) return
    await run(async () => {
      if (questionForm.id === null) {
        await api.post(`/api/admin/quiz-master/${selected.id}/questions`, questionForm)
        flash('Question added')
      } else {
        await api.put(`/api/admin/quiz-master/questions/${questionForm.id}`, questionForm)
        flash('Question updated')
      }
      setQuestionForm(null)
      await loadSelected(selected.id)
    })
  }

  async function deleteQuestion(qId: number) {
    if (!selected || !confirm('Delete this question?')) return
    await run(async () => {
      await api.delete(`/api/admin/quiz-master/questions/${qId}`)
      await loadSelected(selected.id)
      flash('Question deleted')
    })
  }

  function openQuestionEditor(q: QuizQuestionDetail) {
    setQuestionForm({
      id: q.id, quizId: selected!.id,
      text: q.text,
      optionA: q.options[0] ?? '', optionB: q.options[1] ?? '',
      optionC: q.options[2] ?? '', optionD: q.options[3] ?? '',
      correctIndex: q.correctIndex, explanation: q.explanation,
    })
  }

  // ---- assignment ----
  async function openAssignModal() {
    await run(async () => {
      const t = await api.get<TopicPicker[]>('/api/admin/quiz-master/topics')
      setTopics(t)
      setTopicFilter('')
      setAssignModal(true)
    })
  }

  async function assignToTopic(topicId: number) {
    if (!selected) return
    await run(async () => {
      await api.post(`/api/admin/quiz-master/${selected.id}/assign`, { topicId })
      setAssignModal(false)
      await loadQuizzes()
      await loadSelected(selected.id)
      flash('Quiz assigned to topic')
    })
  }

  async function unassign() {
    if (!selected) return
    if (!confirm('Unassign this quiz? It will return to the pool.')) return
    await run(async () => {
      await api.delete(`/api/admin/quiz-master/${selected.id}/assign`)
      await loadQuizzes()
      await loadSelected(selected.id)
      flash('Quiz returned to pool')
    })
  }

  const poolCount = quizzes.filter((q) => q.assignedTopicId === null).length
  const filteredTopics = topics.filter(
    (t) =>
      !topicFilter ||
      t.title.toLowerCase().includes(topicFilter.toLowerCase()) ||
      t.courseTitle.toLowerCase().includes(topicFilter.toLowerCase()),
  )

  // group topics by course for the assign modal
  const courseGroups = filteredTopics.reduce<Record<string, { courseTitle: string; topics: TopicPicker[] }>>((acc, t) => {
    const key = t.courseTitle
    if (!acc[key]) acc[key] = { courseTitle: t.courseTitle, topics: [] }
    acc[key].topics.push(t)
    return acc
  }, {})

  return (
    <div className="page qm-page">
      <header className="page-header">
        <div>
          <h1>🧩 Quiz Master</h1>
          <p className="muted">
            Create quizzes independently, then assign them to topics in Course Setup.
            Pool ({poolCount} unassigned) · Total ({quizzes.length})
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setQuizForm(emptyQuizForm())}>+ New quiz</button>
      </header>

      {error && <div className="form-error">{error}</div>}
      {notice && <div className="form-notice">{notice}</div>}

      <div className="qm-grid">
        {/* quiz list */}
        <div className="qm-list card">
          <h2 className="section-title" style={{ marginTop: 0 }}>All quizzes</h2>
          {quizzes.length === 0 && <p className="muted">No quizzes yet. Create one to get started.</p>}
          {quizzes.map((q) => (
            <div key={q.id} className={`qm-row ${selected?.id === q.id ? 'selected' : ''}`}>
              <button className="qm-pick" onClick={() => loadSelected(q.id).catch((e) => setError(e.message))}>
                <span className="qm-title">{q.title}</span>
                <span className="qm-meta">
                  <span className={`quiz-type-badge ${q.quizType.toLowerCase()}`}>{TYPE_LABEL[q.quizType] ?? q.quizType}</span>
                  <span className="muted small">{q.questionCount} Q · pass {q.passPercent}%</span>
                </span>
                {q.assignedTopicId
                  ? <span className="qm-assigned small">📌 {q.assignedCourseTitle} › {q.assignedTopicTitle}</span>
                  : <span className="qm-pool small muted">◎ Pool (unassigned)</span>
                }
              </button>
              <div className="admin-row-actions">
                <button className="btn btn-ghost btn-small"
                  onClick={() => setQuizForm({ id: q.id, title: q.title, quizType: q.quizType, passPercent: q.passPercent })}>
                  Edit
                </button>
                <button className="btn btn-ghost btn-small danger" onClick={() => deleteQuiz(q.id, q.title)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* selected quiz detail */}
        <div className="qm-detail">
          {!selected && <div className="card muted">Select a quiz from the list to manage its questions and assignment.</div>}
          {selected && (
            <>
              <div className="admin-detail-head">
                <div>
                  <h2>{selected.title}</h2>
                  <span className={`quiz-type-badge ${selected.quizType.toLowerCase()}`}>{TYPE_LABEL[selected.quizType]}</span>
                  <span className="muted small"> · pass {selected.passPercent}%</span>
                </div>
                <button className="btn btn-primary btn-small"
                  onClick={() => setQuestionForm(emptyQForm(selected.id))}>
                  + Add question
                </button>
              </div>

              {/* assignment section */}
              <div className="card qm-assignment">
                <div className="qm-assignment-head">
                  <strong>Topic assignment</strong>
                  <div className="admin-row-actions">
                    {selected.assignedTopicId
                      ? <button className="btn btn-ghost btn-small danger" onClick={unassign}>Unassign</button>
                      : null
                    }
                    <button className="btn btn-ghost btn-small" onClick={openAssignModal}>
                      {selected.assignedTopicId ? 'Reassign' : 'Assign to topic'}
                    </button>
                  </div>
                </div>
                {selected.assignedTopicId
                  ? <p className="muted small" style={{ margin: '0.3rem 0 0' }}>
                      📌 <strong>{selected.assignedCourseTitle}</strong> › {selected.assignedTopicTitle}
                    </p>
                  : <p className="muted small" style={{ margin: '0.3rem 0 0' }}>
                      Not assigned — this quiz is in the pool and can be picked when setting up a topic.
                    </p>
                }
              </div>

              {/* questions */}
              <div className="qm-questions">
                <h3>Questions ({selected.questions.length})</h3>
                {selected.questions.length === 0 && <p className="muted">No questions yet.</p>}
                {selected.questions.map((q, idx) => (
                  <div key={q.id} className="card qm-question">
                    <div className="qm-question-head">
                      <span className="qm-q-num">Q{idx + 1}</span>
                      <span className="qm-q-text">{q.text}</span>
                      <div className="admin-row-actions">
                        <button className="btn btn-ghost btn-small" onClick={() => openQuestionEditor(q)}>Edit</button>
                        <button className="btn btn-ghost btn-small danger" onClick={() => deleteQuestion(q.id)}>Del</button>
                      </div>
                    </div>
                    <ul className="qm-options">
                      {q.options.map((opt, i) => (
                        <li key={i} className={i === q.correctIndex ? 'correct' : ''}>
                          <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                          {opt}
                          {i === q.correctIndex && <span className="correct-mark"> ✓</span>}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="qm-explanation muted small">{q.explanation}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* quiz form modal */}
      {quizForm && (
        <div className="modal-backdrop" onClick={() => setQuizForm(null)}>
          <form className="modal card" onClick={(e) => e.stopPropagation()} onSubmit={saveQuiz}>
            <h2>{quizForm.id === null ? 'New quiz' : 'Edit quiz'}</h2>
            <label>Title
              <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
            </label>
            <label>Type
              <select value={quizForm.quizType} onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value })}>
                <option value="Exercise">📝 Exercise — practice questions, low-stakes</option>
                <option value="Evaluation">🎯 Evaluation — graded assessment</option>
              </select>
            </label>
            <label>Pass percentage (%)
              <input type="number" min={0} max={100} value={quizForm.passPercent}
                onChange={(e) => setQuizForm({ ...quizForm, passPercent: Number(e.target.value) })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setQuizForm(null)}>Cancel</button>
              <button className="btn btn-primary">Save quiz</button>
            </div>
          </form>
        </div>
      )}

      {/* question form modal */}
      {questionForm && (
        <div className="modal-backdrop" onClick={() => setQuestionForm(null)}>
          <form className="modal modal-wide card" onClick={(e) => e.stopPropagation()} onSubmit={saveQuestion}>
            <h2>{questionForm.id === null ? 'Add question' : 'Edit question'}</h2>
            <label>Question text
              <textarea rows={3} value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} required />
            </label>
            {(['A', 'B', 'C', 'D'] as const).map((letter, i) => {
              const key = `option${letter}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'
              return (
                <label key={letter}>
                  Option {letter}
                  {questionForm.correctIndex === i && <span className="correct-mark"> ← correct</span>}
                  <input value={questionForm[key]}
                    onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })} required />
                </label>
              )
            })}
            <label>Correct answer
              <select value={questionForm.correctIndex}
                onChange={(e) => setQuestionForm({ ...questionForm, correctIndex: Number(e.target.value) })}>
                {['A', 'B', 'C', 'D'].map((l, i) => <option key={i} value={i}>Option {l}</option>)}
              </select>
            </label>
            <label>Explanation (shown after submission)
              <textarea rows={3} value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setQuestionForm(null)}>Cancel</button>
              <button className="btn btn-primary">Save question</button>
            </div>
          </form>
        </div>
      )}

      {/* assign modal */}
      {assignModal && (
        <div className="modal-backdrop" onClick={() => setAssignModal(false)}>
          <div className="modal modal-wide card" onClick={(e) => e.stopPropagation()}>
            <h2>Assign "{selected?.title}" to a topic</h2>
            <input className="search-input" placeholder="Filter topics or courses…" value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)} />
            <div className="assign-topic-list">
              {Object.values(courseGroups).map(({ courseTitle, topics: ct }) => (
                <div key={courseTitle} className="assign-course-group">
                  <div className="assign-course-name">{courseTitle}</div>
                  {ct.map((t) => (
                    <button key={t.id} className="assign-topic-row" onClick={() => assignToTopic(t.id)}>
                      <span className={`topic-type-dot ${t.topicType === 'InterviewReady' ? 'interview' : 'regular'}`} />
                      <span>{t.title}</span>
                      <span className="muted small">{TOPIC_TYPE_LABEL[t.topicType] ?? t.topicType}</span>
                    </button>
                  ))}
                </div>
              ))}
              {Object.keys(courseGroups).length === 0 && <p className="muted">No topics match.</p>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setAssignModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
