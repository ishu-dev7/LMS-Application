import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import type { CourseSummary } from '../types'

const TRACK_META: Record<string, { icon: string; color: string; tagline: string }> = {
  'training-csharp':  { icon: '⚡', color: '#9b5cf6', tagline: 'OOP · LINQ · Async · Advanced Patterns' },
  'training-dotnet':  { icon: '🔷', color: '#3b82f6', tagline: 'ASP.NET Core · EF Core · APIs · Deployment' },
  'training-java':    { icon: '☕', color: '#f59e0b', tagline: 'OOP · Collections · Streams · Spring Boot' },
  'training-angular': { icon: '🅰️', color: '#e11d48', tagline: 'Components · RxJS · Forms · Architecture' },
  'training-sql':     { icon: '🗃️', color: '#10b981', tagline: 'Queries · Joins · Indexes · Optimization' },
  'training-react':   { icon: '⚛️', color: '#38bdf8', tagline: 'Hooks · State · Performance · Patterns' },
}

const TRACK_ORDER = [
  'training-csharp',
  'training-dotnet',
  'training-java',
  'training-angular',
  'training-sql',
  'training-react',
]

export default function TrainingPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<CourseSummary[]>('/api/courses')
      .then(all => setCourses(all.filter(c => c.category === 'Training')))
      .finally(() => setLoading(false))
  }, [])

  const bySlug = Object.fromEntries(courses.map(c => [c.slug, c]))

  // enrolled = tracks the user has access to (returned by /api/courses)
  // locked   = tracks in the catalog but not enrolled (not returned by API)
  const enrolled = TRACK_ORDER.filter(slug => bySlug[slug])
  const locked   = isAdmin ? [] : TRACK_ORDER.filter(slug => !bySlug[slug])

  if (loading) return <div className="page"><p className="muted">Loading training tracks…</p></div>

  return (
    <div className="page training-page">
      <div className="training-hero">
        <div className="training-hero-text">
          <div className="training-eyebrow">Training Hub</div>
          <h1>Deep-Dive Learning &amp; Interview Prep</h1>
          <p className="muted">
            Comprehensive tracks compiled from W3Schools, CSharpTutorial, and GeeksForGeeks — from
            fundamentals to advanced patterns, with focused interview preparation modules.
          </p>
        </div>
        <div className="training-hero-stats">
          <div className="training-stat">
            <span className="training-stat-val">{enrolled.length + locked.length}</span>
            <span className="training-stat-lbl">Tracks</span>
          </div>
          <div className="training-stat">
            <span className="training-stat-val">600+</span>
            <span className="training-stat-lbl">Lessons</span>
          </div>
          <div className="training-stat">
            <span className="training-stat-val">6</span>
            <span className="training-stat-lbl">Languages</span>
          </div>
        </div>
      </div>

      {/* ── Active Tracks ── */}
      {enrolled.length > 0 && (
        <section>
          <h2 className="section-title">Your Tracks</h2>
          <div className="training-grid">
            {enrolled.map(slug => (
              <TrackCard key={slug} slug={slug} course={bySlug[slug]} />
            ))}
          </div>
        </section>
      )}

      {/* ── Locked (learners without access) ── */}
      {locked.length > 0 && (
        <section>
          <h2 className="section-title" style={{ marginTop: enrolled.length ? undefined : 0 }}>
            Available Tracks
          </h2>
          <p className="muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
            Contact your admin to unlock access to these training tracks.
          </p>
          <div className="training-grid">
            {locked.map(slug => (
              <TrackCard key={slug} slug={slug} locked />
            ))}
          </div>
        </section>
      )}

      {enrolled.length === 0 && locked.length === 0 && (
        <div className="training-empty">
          <span style={{ fontSize: '3rem' }}>🚧</span>
          <h3>Training tracks coming soon</h3>
          <p className="muted">The admin is still setting up the training library.</p>
        </div>
      )}
    </div>
  )
}

function TrackCard({
  slug,
  course,
  locked = false,
}: {
  slug: string
  course?: CourseSummary
  locked?: boolean
}) {
  const meta = TRACK_META[slug] ?? { icon: '📚', color: '#6b7280', tagline: '' }
  const pct  = course?.percentComplete ?? 0

  return (
    <div className={`training-card${locked ? ' training-card-locked' : ''}`}
      style={{ '--track-color': meta.color } as React.CSSProperties}>

      <div className="training-card-header">
        <div className="training-card-icon">{meta.icon}</div>
        {locked && <span className="training-lock-badge">🔒 Locked</span>}
        {!locked && pct === 100 && <span className="training-done-badge">✓ Done</span>}
      </div>

      <h3 className="training-card-title">{course?.title ?? slug}</h3>
      <p className="training-card-tagline">{meta.tagline}</p>

      {!locked && (
        <div className="training-progress-wrap">
          <div className="training-progress-bar">
            <div className="training-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="training-progress-label">{pct}%</span>
        </div>
      )}

      <div className="training-card-footer">
        {locked ? (
          <span className="training-card-meta muted">Admin access required</span>
        ) : (
          <Link
            to={`/courses/${slug}`}
            className="btn btn-primary btn-small"
            style={{ background: meta.color, borderColor: meta.color }}
          >
            {pct === 0 ? 'Start →' : pct === 100 ? 'Review →' : 'Continue →'}
          </Link>
        )}
        {course && (
          <span className="training-card-meta muted">
            {course.totalLessons} lessons · {course.completedLessons} done
          </span>
        )}
      </div>
    </div>
  )
}
