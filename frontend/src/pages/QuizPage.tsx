import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import type { Quiz, QuizResult } from '../types'

export default function QuizPage() {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get<Quiz>(`/api/quizzes/${quizId}`).then(setQuiz).catch((e) => setError(e.message))
  }, [quizId])

  async function submit() {
    if (!quiz) return
    setBusy(true)
    try {
      const res = await api.post<QuizResult>(`/api/quizzes/${quiz.id}/submit`, {
        answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
          questionId: Number(questionId),
          selectedIndex,
        })),
      })
      setResult(res)
      window.scrollTo(0, 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  function retake() {
    setAnswers({})
    setResult(null)
    window.scrollTo(0, 0)
  }

  if (error) return <div className="page"><div className="form-error">{error}</div></div>
  if (!quiz) return <div className="page"><p className="muted">Loading checkpoint…</p></div>

  const answered = Object.keys(answers).length
  const resultByQuestion = new Map(result?.questions.map((q) => [q.questionId, q]))

  return (
    <div className="page quiz-page">
      <nav className="breadcrumb">
        <Link to="/">Dashboard</Link> <span>/</span> <span>{quiz.moduleTitle}</span>
      </nav>

      <header className="page-header">
        <div>
          <h1>📝 {quiz.title}</h1>
          <p className="muted">
            {quiz.questions.length} questions · pass mark {quiz.passPercent}% · retake as often as you like
          </p>
        </div>
      </header>

      {result && (
        <div className={`quiz-result-banner ${result.passed ? 'passed' : 'failed'}`}>
          <div className="quiz-score">{result.scorePercent}%</div>
          <div>
            <strong>{result.passed ? 'Checkpoint passed! 🏆' : 'Not yet — review and retake.'}</strong>
            <div className="muted">
              {result.correct}/{result.total} correct · pass mark {quiz.passPercent}%
            </div>
          </div>
          <button className="btn btn-ghost" onClick={retake}>Retake</button>
        </div>
      )}

      <div className="question-list">
        {quiz.questions.map((q, qi) => {
          const qr = resultByQuestion.get(q.id)
          return (
            <div key={q.id} className="question-card">
              <div className="question-text">
                <span className="question-num">Q{qi + 1}</span> {q.text}
              </div>
              <div className="options">
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === oi
                  let cls = 'option'
                  if (selected) cls += ' selected'
                  if (qr) {
                    if (oi === qr.correctIndex) cls += ' correct'
                    else if (selected && !qr.correct) cls += ' wrong'
                  }
                  return (
                    <button
                      key={oi}
                      className={cls}
                      disabled={!!result}
                      onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {qr && (
                <div className={`explanation ${qr.correct ? 'ok' : 'nok'}`}>
                  {qr.correct ? '✓ Correct.' : '✗ Not quite.'} {qr.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!result && (
        <div className="quiz-submit">
          <span className="muted">{answered}/{quiz.questions.length} answered</span>
          <button
            className="btn btn-primary"
            disabled={busy || answered < quiz.questions.length}
            onClick={submit}
          >
            {busy ? 'Scoring…' : 'Submit answers'}
          </button>
        </div>
      )}
    </div>
  )
}
