import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function MentorFeedback() {
  const { user, progress, solvedProblems, streak } = useApp()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    getDoc(doc(db, 'feedback', user.uid)).then(snap => {
      setFeedbacks(snap.exists() ? (snap.data().items || []) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.uid])

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mentor Feedback</h1>
        <p className="page-subtitle">Expert guidance to accelerate your preparation</p>
      </div>

      {/* Stats */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">Your Current Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Problems Solved', value: solvedProblems.length,           icon: '💻' },
            { label: 'Topics Done',     value: progress.completedTopics?.length ?? 0, icon: '📚' },
            { label: 'Current Streak',  value: `${streak.count} days`,          icon: '🔥' },
            { label: 'Feedbacks',       value: feedbacks.length,                icon: '📝' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading feedback…</div>
      ) : feedbacks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📭</div>
          <h3 style={{ margin: '0 0 8px' }}>No feedback yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Your mentor will review your progress and share personalised feedback here.
          </p>
        </div>
      ) : (
        <div className="feedback-list">
          {feedbacks.map(fb => (
            <div key={fb.id} className="feedback-card">
              <div className="feedback-mentor">
                <div className="mentor-avatar" style={{ background: fb.avatarColor || '#6366f1' }}>
                  {(fb.mentorName || 'M').charAt(0)}
                </div>
                <div>
                  <div className="mentor-name">{fb.mentorName}</div>
                  <div className="mentor-title">{fb.mentorTitle}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{fmt(fb.date)}</div>
              </div>

              {fb.metrics && (
                <div className="feedback-metrics">
                  {Object.values(fb.metrics).map(m => (
                    <div key={m.label} className="feedback-metric">
                      <div className="metric-label">{m.label}</div>
                      <div className={`metric-value ${m.cls || ''}`}>{m.text || m.rating}</div>
                    </div>
                  ))}
                </div>
              )}

              {fb.suggestion && <div className="feedback-suggestion">💡 {fb.suggestion}</div>}
              {fb.detailedNotes && (
                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {fb.detailedNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
