import { useApp } from '../context/AppContext'
import { MENTOR_FEEDBACK } from '../data/appData'

export default function MentorFeedback() {
  const { progress, solvedProblems, streak } = useApp()

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mentor Feedback</h1>
        <p className="page-subtitle">Expert guidance to accelerate your preparation</p>
      </div>

      {/* My Stats for Mentor View */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">Your Current Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Problems Solved', value: solvedProblems.length, icon: '💻' },
            { label: 'Topics Done', value: progress.completedTopics?.length ?? 0, icon: '📚' },
            { label: 'Current Streak', value: `${streak.count} days`, icon: '🔥' },
            { label: 'DSA Progress', value: `${progress.dsa}%`, icon: '📊' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg)', borderRadius: 8, padding: 14, textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="feedback-list">
        {MENTOR_FEEDBACK.map(fb => (
          <div key={fb.id} className="feedback-card">
            <div className="feedback-mentor">
              <div className="mentor-avatar" style={{ background: fb.avatarColor }}>
                {fb.mentorName.charAt(0)}
              </div>
              <div>
                <div className="mentor-name">{fb.mentorName}</div>
                <div className="mentor-title">{fb.mentorTitle}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                {formatDate(fb.date)}
              </div>
            </div>

            <div className="feedback-metrics">
              {Object.values(fb.metrics).map(m => (
                <div key={m.label} className="feedback-metric">
                  <div className="metric-label">{m.label}</div>
                  <div className={`metric-value ${m.ratingClass}`}>{m.rating}</div>
                </div>
              ))}
            </div>

            <div className="feedback-suggestion">{fb.suggestion}</div>

            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {fb.detailedNotes}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 className="card-title">Request a Mentor Session</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Have specific questions? Request a 1-on-1 session with a mentor.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary">
            📅 Request Session
          </button>
          <button className="btn btn-ghost">
            📝 Submit Question
          </button>
        </div>
        <div className="alert alert-info" style={{ marginTop: 16, marginBottom: 0 }}>
          <strong>Coming Soon:</strong> Live mentor sessions and Q&A will be available in the next update.
        </div>
      </div>
    </div>
  )
}
