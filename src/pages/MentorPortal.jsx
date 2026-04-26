import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { ROADMAP_PHASES } from '../data/appData'
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
  const { codingProblems, aptitudeTopics, roadmapPhases, roadmapConfigured } = useContent()

  const LEVEL_MAP = { Rookie: 'beginner', Explorer: 'beginnerPlus', Coder: 'intermediate', Master: 'advanced' }

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
  const [activeTab,  setActiveTab]  = useState('submissions')

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
    setActiveTab('submissions')
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

  const profile         = studentData?.profile            || {}
  const solveds         = studentData?.solvedProblems      || []
  const subs            = studentData?.codingSubmissions   || {}
  const attempts        = studentData?.quizAttempts        || {}
  const completedTopics = studentData?.progress?.completedTopics || []

  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

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

              {/* Activity Tabs */}
              <div className="mp-section" style={{ padding: 0 }}>
                {/* Tab bar */}
                <div className="mp-tabs">
                  {[
                    { key: 'submissions', label: '💻 Code Submissions', count: Object.keys(subs).length },
                    { key: 'quiz',        label: '🧮 Quiz Attempts',    count: Object.keys(attempts).length },
                    { key: 'roadmap',     label: '🗺️ Roadmap',          count: (() => { const lk = LEVEL_MAP[studentData?.assessmentResult?.level]; const phases = lk ? (roadmapPhases[lk] || []) : []; const total = phases.reduce((a,p)=>a+p.topics.length,0); return total ? `${completedTopics.length}/${total}` : '—' })() },
                  ].map(t => (
                    <button key={t.key} className={`mp-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
                      {t.label} <span className="mp-tab-count">{t.count}</span>
                    </button>
                  ))}
                </div>

                {/* ── Code Submissions ── */}
                {activeTab === 'submissions' && (
                  <div className="mp-tab-body">
                    {Object.keys(subs).length === 0 ? (
                      <div className="mp-empty-tab">No code submissions yet</div>
                    ) : Object.entries(subs).map(([pid, list]) => {
                      const problem  = codingProblems.find(p => String(p.id) === String(pid))
                      const sorted   = [...list].sort((a, b) => new Date(b.submittedAt || b.date || 0) - new Date(a.submittedAt || a.date || 0))
                      const accepted = sorted.filter(s => s.verdict === 'Accepted').length
                      return (
                        <div key={pid} className="mp-prob-group">
                          <div className="mp-prob-header">
                            <div>
                              <span className="mp-prob-title">{problem?.title || `Problem #${pid}`}</span>
                              {problem?.category && <span className="mp-prob-cat">{problem.category}</span>}
                              {problem?.difficulty && <span className={`mp-prob-diff mp-diff-${(problem.difficulty||'').toLowerCase()}`}>{problem.difficulty}</span>}
                            </div>
                            <span className={`mp-acc-badge ${accepted > 0 ? 'pass' : 'fail'}`}>
                              {accepted}/{sorted.length} Accepted
                            </span>
                          </div>
                          {sorted.map((sub, i) => (
                            <div key={i} className="mp-sub-row">
                              <span className="mp-sub-num">#{i + 1}</span>
                              <span className="mp-sub-date-tag">{fmtDate(sub.submittedAt || sub.date)}</span>
                              <span className="mp-sub-lang">{sub.language || '—'}</span>
                              <span className={`mp-sub-verdict ${sub.verdict === 'Accepted' ? 'pass' : 'fail'}`}>
                                {sub.verdict || 'Submitted'}
                              </span>
                              {sub.code && (
                                <details className="mp-sub-code-wrap">
                                  <summary>View Code</summary>
                                  <pre className="mp-sub-code">{sub.code}</pre>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ── Quiz Attempts ── */}
                {activeTab === 'quiz' && (
                  <div className="mp-tab-body">
                    {Object.keys(attempts).length === 0 ? (
                      <div className="mp-empty-tab">No quiz attempts yet</div>
                    ) : Object.entries(attempts).map(([topicId, attemptList]) => {
                      const topic = aptitudeTopics.find(t => t.id === topicId)
                      const scores = attemptList.map(a => a.score || 0)
                      const best = Math.max(...scores)
                      const avg  = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                      const passed = best >= 60
                      return (
                        <div key={topicId} className="mp-quiz-group">
                          <div className="mp-quiz-header">
                            <div>
                              <span className="mp-quiz-topic">{topic?.title || topicId}</span>
                              {topic?.category && <span className="mp-prob-cat">{topic.category}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span className={`mp-acc-badge ${passed ? 'pass' : 'fail'}`}>{passed ? '✓ Passed' : '✗ Not passed'}</span>
                              <span className="mp-quiz-att-count">{attemptList.length} attempt{attemptList.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="mp-quiz-summary">
                            <span>Best: <strong style={{ color: passed ? '#10b981' : '#ef4444' }}>{best}%</strong></span>
                            <span>Avg: <strong>{avg}%</strong></span>
                          </div>
                          {attemptList.map((att, i) => (
                            <div key={i} className="mp-att-row">
                              <span className="mp-att-num">#{i + 1}</span>
                              <div className="mp-att-bar-wrap">
                                <div className="mp-att-bar" style={{ width: `${att.score || 0}%`, background: (att.score || 0) >= 60 ? '#10b981' : '#ef4444' }} />
                              </div>
                              <span className="mp-att-score" style={{ color: (att.score || 0) >= 60 ? '#10b981' : '#ef4444' }}>
                                {att.score || 0}%
                              </span>
                              <span className="mp-att-date">{fmtDate(att.date)}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ── Roadmap Progress ── */}
                {activeTab === 'roadmap' && (() => {
                  const studentLevel = studentData?.assessmentResult?.level
                  const levelKey     = studentLevel ? (LEVEL_MAP[studentLevel] || 'beginner') : null
                  const isConfigured = levelKey ? roadmapConfigured[levelKey] : false
                  const phases       = levelKey ? (roadmapPhases[levelKey] || []) : []

                  if (!levelKey) return (
                    <div className="mp-tab-body">
                      <div className="mp-empty-tab">Student hasn't taken the assessment yet</div>
                    </div>
                  )
                  if (!isConfigured) return (
                    <div className="mp-tab-body">
                      <div className="mp-roadmap-unconfigured">
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🗺️</div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Roadmap not configured for {studentLevel} level</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          The admin hasn't added roadmap content for the <strong>{studentLevel}</strong> track yet.
                        </div>
                      </div>
                    </div>
                  )
                  return (
                    <div className="mp-tab-body">
                      {phases.map((phase, pi) => {
                        const done  = phase.topics.filter(t => completedTopics.includes(t.id)).length
                        const pct   = Math.round((done / phase.topics.length) * 100)
                        const color = pct === 100 ? '#10b981' : pct > 50 ? '#6366f1' : '#94a3b8'
                        return (
                          <div key={pi} className="mp-phase-group">
                            <div className="mp-phase-header">
                              <span className="mp-phase-title">{phase.phase || phase.title}</span>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span className="mp-phase-count">{done}/{phase.topics.length} topics</span>
                                <span className="mp-phase-pct" style={{ color }}>{pct}%</span>
                              </div>
                            </div>
                            <div className="mp-phase-bar-wrap">
                              <div className="mp-phase-bar" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <div className="mp-topics-list">
                              {phase.topics.map(topic => {
                                const isDone = completedTopics.includes(topic.id)
                                return (
                                  <div key={topic.id} className={`mp-topic-item${isDone ? ' done' : ''}`}>
                                    <span className={`mp-topic-check${isDone ? ' done' : ''}`}>{isDone ? '✓' : '○'}</span>
                                    <span className="mp-topic-name">{topic.title}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

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
