import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore'

const METRIC_LABELS = ['Code Quality', 'Problem Solving', 'Speed', 'Communication']

function ratingLabel(r) {
  if (r >= 5) return { text: 'Excellent', cls: 'mf-excellent' }
  if (r >= 4) return { text: 'Good',      cls: 'mf-good' }
  if (r >= 3) return { text: 'Average',   cls: 'mf-average' }
  return              { text: 'Needs Work',cls: 'mf-poor' }
}

function Avatar({ name, color, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color || '#6366f1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.4, flexShrink: 0,
    }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

export default function MentorPortal() {
  const navigate = useNavigate()
  const { user, isMentor, mentorProfile } = useApp()

  const [students,   setStudents]   = useState([])
  const [selected,   setSelected]   = useState(null)
  const [studentData,setStudentData]= useState(null)
  const [feedbacks,  setFeedbacks]  = useState([])
  const [loadingS,   setLoadingS]   = useState(true)
  const [loadingD,   setLoadingD]   = useState(false)
  const [search,     setSearch]     = useState('')

  // Feedback form
  const [metrics,    setMetrics]    = useState({ 'Code Quality': 3, 'Problem Solving': 3, 'Speed': 3, 'Communication': 3 })
  const [suggestion, setSuggestion] = useState('')
  const [notes,      setNotes]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState('')

  useEffect(() => {
    if (!isMentor) return
    getDocs(collection(db, 'leaderboard')).then(snap => {
      // use doc.id as uid fallback — leaderboard docs are keyed by uid
      setStudents(snap.docs.map(d => ({ ...d.data(), uid: d.id })).sort((a, b) => (b.points || 0) - (a.points || 0)))
      setLoadingS(false)
    }).catch(() => setLoadingS(false))
  }, [isMentor])

  const openStudent = async (s) => {
    setSelected(s)
    setStudentData(null)
    setFeedbacks([])
    setSaved('')
    setLoadingD(true)

    try {
      const userSnap = await getDoc(doc(db, 'users', s.uid))
      setStudentData(userSnap.exists() ? userSnap.data() : {})
    } catch (e) {
      console.error('Failed to read student user data:', e.message)
      setStudentData({})
    }

    try {
      const fbSnap = await getDoc(doc(db, 'feedback', s.uid))
      setFeedbacks(fbSnap.exists() ? (fbSnap.data().items || []) : [])
    } catch (e) {
      setFeedbacks([])
    }

    setLoadingD(false)
  }

  const submitFeedback = async () => {
    if (!selected || !suggestion.trim() || !notes.trim()) return
    setSaving(true); setSaved('')
    const fb = {
      id: Date.now(),
      mentorName: mentorProfile?.name || user?.name || 'Mentor',
      mentorTitle: mentorProfile?.title || '',
      avatarColor: mentorProfile?.avatarColor || '#6366f1',
      date: new Date().toISOString(),
      metrics: Object.fromEntries(
        METRIC_LABELS.map(lbl => [lbl, { label: lbl, rating: metrics[lbl], ...ratingLabel(metrics[lbl]) }])
      ),
      suggestion: suggestion.trim(),
      detailedNotes: notes.trim(),
    }
    const existing = feedbacks
    const updated = [fb, ...existing]
    await setDoc(doc(db, 'feedback', selected.uid), { items: updated }, { merge: false })
    setFeedbacks(updated)
    setSuggestion(''); setNotes('')
    setMetrics({ 'Code Quality': 3, 'Problem Solving': 3, 'Speed': 3, 'Communication': 3 })
    setSaved('✓ Feedback saved successfully!')
    setSaving(false)
  }

  if (!isMentor) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2>Mentor Access Only</h2>
        <p style={{ color: 'var(--text-secondary)' }}>This portal is for mentors only. Contact the admin to get mentor access.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    )
  }

  const filtered = students.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.college?.toLowerCase().includes(search.toLowerCase())
  )

  const profile   = studentData?.profile   || {}
  const solveds   = studentData?.solvedProblems || []
  const subs      = studentData?.codingSubmissions || {}
  const attempts  = studentData?.quizAttempts || {}

  return (
    <div className="mp-root">

      {/* Header */}
      <div className="mp-header">
        <div className="mp-header-left">
          <button className="mp-back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <div>
            <div className="mp-header-title">Mentor Portal</div>
            <div className="mp-header-sub">Welcome, {mentorProfile?.name || user?.name}</div>
          </div>
        </div>
        <div className="mp-mentor-badge">
          <Avatar name={mentorProfile?.name || user?.name} color={mentorProfile?.avatarColor} size={38} />
          <div>
            <div className="mp-mentor-name">{mentorProfile?.name || user?.name}</div>
            <div className="mp-mentor-title">{mentorProfile?.title || 'Mentor'}</div>
          </div>
        </div>
      </div>

      <div className="mp-body">

        {/* Student list */}
        <aside className="mp-sidebar">
          <div className="mp-sidebar-title">Students ({students.length})</div>
          <input className="mp-search" placeholder="Search by name or college…" value={search} onChange={e => setSearch(e.target.value)} />
          {loadingS ? <p className="mp-loading">Loading students…</p> : filtered.map(s => (
            <button key={s.uid} className={`mp-student-row${selected?.uid === s.uid ? ' active' : ''}`} onClick={() => openStudent(s)}>
              <Avatar name={s.name} color="#6366f1" size={36} />
              <div className="mp-student-info">
                <div className="mp-student-name">{s.name}</div>
                <div className="mp-student-meta">{s.college} · {s.points || 0} pts</div>
              </div>
            </button>
          ))}
        </aside>

        {/* Main panel */}
        <div className="mp-main">
          {!selected ? (
            <div className="mp-empty">
              <div style={{ fontSize: 56 }}>👈</div>
              <p>Select a student to view their profile and give feedback</p>
            </div>
          ) : loadingD ? (
            <div className="mp-empty"><p>Loading student data…</p></div>
          ) : (
            <>
              {/* Student profile */}
              <div className="mp-student-card">
                <Avatar name={profile.name || selected.name} color="#6366f1" size={56} />
                <div className="mp-student-details">
                  <div className="mp-sname">{profile.name || selected.name}</div>
                  <div className="mp-smeta">{[profile.college, profile.yearOfStudy, profile.branch].filter(Boolean).join(' · ')}</div>
                  {profile.careerGoal && <div className="mp-sgoal">🎯 {profile.careerGoal}</div>}
                </div>
                <div className="mp-student-stats">
                  {[
                    { lbl: 'Problems Solved', val: solveds.length  || selected?.solvedCount || 0 },
                    { lbl: 'Quiz Attempts',   val: Object.keys(attempts).length },
                    { lbl: 'Points',          val: studentData?.points ?? selected?.points ?? 0 },
                    { lbl: 'Streak',          val: `${studentData?.streak?.count ?? selected?.streak ?? 0}d` },
                  ].map(st => (
                    <div key={st.lbl} className="mp-stat">
                      <div className="mp-stat-val">{st.val}</div>
                      <div className="mp-stat-lbl">{st.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submissions */}
              {Object.keys(subs).length > 0 && (
                <div className="mp-section">
                  <div className="mp-section-title">Recent Code Submissions</div>
                  <div className="mp-subs-list">
                    {Object.entries(subs).slice(0, 6).map(([pid, list]) => {
                      const latest = list[0]
                      return (
                        <div key={pid} className="mp-sub-row">
                          <div className="mp-sub-pid">Problem #{pid}</div>
                          <div className="mp-sub-lang">{latest.language || 'Unknown'}</div>
                          <div className={`mp-sub-verdict ${latest.verdict === 'Accepted' ? 'pass' : 'fail'}`}>
                            {latest.verdict || 'Submitted'}
                          </div>
                          <div className="mp-sub-date">{latest.date ? new Date(latest.date).toLocaleDateString() : ''}</div>
                          {latest.code && (
                            <details className="mp-sub-code-wrap">
                              <summary>View Code</summary>
                              <pre className="mp-sub-code">{latest.code}</pre>
                            </details>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Feedback form */}
              <div className="mp-section">
                <div className="mp-section-title">Give Feedback</div>
                <div className="mp-metrics-grid">
                  {METRIC_LABELS.map(lbl => (
                    <div key={lbl} className="mp-metric-row">
                      <span className="mp-metric-lbl">{lbl}</span>
                      <div className="mp-stars">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} className={`mp-star${metrics[lbl] >= n ? ' on' : ''}`} onClick={() => setMetrics(m => ({ ...m, [lbl]: n }))}>★</button>
                        ))}
                      </div>
                      <span className={`mp-metric-tag ${ratingLabel(metrics[lbl]).cls}`}>{ratingLabel(metrics[lbl]).text}</span>
                    </div>
                  ))}
                </div>
                <div className="mp-field">
                  <label className="mp-lbl">Key Suggestion (one liner)</label>
                  <input className="mp-inp" placeholder="e.g. Focus on optimising time complexity before submitting" value={suggestion} onChange={e => setSuggestion(e.target.value)} />
                </div>
                <div className="mp-field">
                  <label className="mp-lbl">Detailed Notes</label>
                  <textarea className="mp-inp mp-textarea" placeholder="Write a detailed review of the student's progress, strengths, and areas to improve…" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                {saved && <p className="mp-saved">{saved}</p>}
                <button className="mp-submit-btn" disabled={saving || !suggestion.trim() || !notes.trim()} onClick={submitFeedback}>
                  {saving ? 'Saving…' : '✓ Submit Feedback'}
                </button>
              </div>

              {/* Past feedback */}
              {feedbacks.length > 0 && (
                <div className="mp-section">
                  <div className="mp-section-title">Previous Feedback ({feedbacks.length})</div>
                  {feedbacks.map(fb => (
                    <div key={fb.id} className="mp-past-fb">
                      <div className="mp-past-fb-header">
                        <Avatar name={fb.mentorName} color={fb.avatarColor} size={34} />
                        <div>
                          <div className="mp-past-fb-mentor">{fb.mentorName}</div>
                          <div className="mp-past-fb-title">{fb.mentorTitle}</div>
                        </div>
                        <div className="mp-past-fb-date">{new Date(fb.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div className="mp-past-metrics">
                        {Object.values(fb.metrics).map(m => (
                          <span key={m.label} className={`mp-past-metric-chip ${m.cls}`}>{m.label}: {m.text}</span>
                        ))}
                      </div>
                      <div className="mp-past-suggestion">💡 {fb.suggestion}</div>
                      <p className="mp-past-notes">{fb.detailedNotes}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
