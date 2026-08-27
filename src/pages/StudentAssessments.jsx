import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore'
import ProblemEditor from '../components/ProblemEditor'

const subId = (uid, moduleId) => `${uid}_${moduleId}`

function isTargeted(mod, user) {
  if (mod.targetEmails?.length) {
    return mod.targetEmails.map(e => e.toLowerCase()).includes((user.email || '').toLowerCase())
  }
  if (mod.targetDepartments?.length && !mod.targetDepartments.includes(user.branch)) return false
  if (mod.targetYears?.length && !mod.targetYears.includes(user.yearOfStudy)) return false
  return true
}

function timeStatus(mod) {
  const now = new Date()
  if (mod.opensAt && now < new Date(mod.opensAt)) return 'upcoming'
  if (mod.dueAt && now > new Date(mod.dueAt)) return 'closed'
  return 'open'
}

function moduleStatus(m, sub) {
  const ts = timeStatus(m)
  if (sub?.status === 'submitted') return { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,.12)' }
  if (ts === 'upcoming') return { label: 'Upcoming', color: 'var(--text-secondary)', bg: 'var(--bg)' }
  if (ts === 'closed') return { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,.12)' }
  if (sub?.status === 'in-progress') return { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,.12)' }
  return { label: 'Open', color: 'var(--primary)', bg: 'var(--primary-light)' }
}

const questionCount = (m) => (m.quiz?.items?.length || 0) + (m.coding?.items?.length || 0)
const maxScore = (m) => (m.quiz?.items?.length || 0) + (m.coding?.items || []).reduce((s, p) => s + (p.points || 10), 0)
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null

function StatCard({ icon, label, value }) {
  return (
    <div className="card" style={{ padding: '16px 18px', flex: '1 1 140px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 8 }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
    </div>
  )
}

// ── List page ────────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'upcoming', label: '📅 Upcoming' },
  { key: 'all', label: '🔀 All' },
  { key: 'attempted', label: '✅ Attempted' },
  { key: 'unattempted', label: '⭕ Unattempted' },
]

function AssessmentsListPage({ modules, submissions, onOpenDetails }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortDir, setSortDir] = useState('asc')

  const completed = modules.filter(m => submissions[m.id]?.status === 'submitted').length
  const totalQuestions = modules.reduce((s, m) => s + questionCount(m), 0)
  const timeSpentMin = Object.values(submissions).reduce((s, sub) => {
    if (sub.status === 'submitted' && sub.startedAt && sub.submittedAt) {
      return s + Math.max(0, Math.round((new Date(sub.submittedAt) - new Date(sub.startedAt)) / 60000))
    }
    return s
  }, 0)

  const filtered = modules
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()))
    .filter(m => {
      const sub = submissions[m.id]
      if (filter === 'upcoming') return timeStatus(m) === 'upcoming'
      if (filter === 'attempted') return !!sub
      if (filter === 'unattempted') return !sub
      return true
    })
    .sort((a, b) => {
      const da = a.dueAt ? new Date(a.dueAt).getTime() : Infinity
      const db_ = b.dueAt ? new Date(b.dueAt).getTime() : Infinity
      return sortDir === 'asc' ? da - db_ : db_ - da
    })

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>🧾 Assessments</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Track assigned tests, completion, and results in one place.</p>

      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard icon="📄" label="Assigned" value={modules.length} />
        <StatCard icon="✅" label="Completed" value={completed} />
        <StatCard icon="❓" label="Questions" value={totalQuestions} />
        <StatCard icon="⏱️" label="Time Spent" value={`${timeSpentMin} min`} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <input style={{ flex: '1 1 220px' }} placeholder="Search assessments…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={sortDir} onChange={e => setSortDir(e.target.value)} style={{ width: 'auto' }}>
          <option value="asc">Due date: soonest first</option>
          <option value="desc">Due date: latest first</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            fontSize: 13, fontWeight: filter === f.key ? 700 : 400, padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${filter === f.key ? 'var(--primary)' : 'var(--border)'}`,
            background: filter === f.key ? 'var(--primary)' : 'transparent',
            color: filter === f.key ? '#fff' : 'var(--text)',
          }}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {modules.length === 0 ? "No assessment modules have been assigned to you yet. Check back later, or ask your college admin." : 'No assessments match this filter.'}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(m => {
            const sub = submissions[m.id]
            const status = moduleStatus(m, sub)
            const qCount = questionCount(m)
            return (
              <div key={m.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: status.color, background: status.bg, whiteSpace: 'nowrap' }}>{status.label}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {m.opensAt && <div>📅 Start: {fmtDate(m.opensAt)}</div>}
                  {m.dueAt && <div>⏰ End: {fmtDate(m.dueAt)}</div>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {qCount} question{qCount === 1 ? '' : 's'}{m.timerMinutes ? ` · ${m.timerMinutes} min` : ''}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onOpenDetails(m)} style={{ alignSelf: 'flex-end', marginTop: 4 }}>View Details →</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Details page ─────────────────────────────────────────────────────────────
function AssessmentDetailsPage({ mod, submission, onBack, onStart, onViewResult }) {
  const ts = timeStatus(mod)
  const status = moduleStatus(mod, submission)
  const canStart = ts === 'open' && submission?.status !== 'submitted'

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 16 }}>← Assessments</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>🧾 {mod.title}</h1>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: status.color, background: status.bg }}>{status.label}</span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{mod.description || "Review schedule and start when you're ready."}</p>

      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard icon="⏱️" label="Duration" value={mod.timerMinutes ? `${mod.timerMinutes} min` : 'No limit'} />
        <StatCard icon="🏅" label="Total Marks" value={maxScore(mod)} />
        <StatCard icon="❓" label="Questions" value={questionCount(mod)} />
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        {ts === 'upcoming' && <div>🔒 This assessment opens {new Date(mod.opensAt).toLocaleString()}. It can't be started before then.</div>}
        {ts === 'closed' && submission?.status !== 'submitted' && (
          <div>⌛ This assessment has closed{mod.dueAt ? ` on ${new Date(mod.dueAt).toLocaleString()}` : ''}. You did not submit an attempt.</div>
        )}
        {submission?.status === 'submitted' && (
          <div>✅ You submitted this assessment. Score: <strong>{submission.totalScore ?? 0} / {maxScore(mod)}</strong></div>
        )}
        {ts === 'open' && submission?.status !== 'submitted' && (
          <div>{submission?.status === 'in-progress' ? 'You have this assessment in progress — pick up where you left off.' : 'Ready when you are.'}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {canStart && (
          <button className="btn btn-primary" onClick={onStart}>{submission?.status === 'in-progress' ? 'Continue Assessment' : 'Start Assessment'}</button>
        )}
        {submission?.status === 'submitted' && (
          <button className="btn btn-ghost" onClick={onViewResult}>View My Answers</button>
        )}
      </div>
    </div>
  )
}

// ── Quiz stage (one question at a time) ──────────────────────────────────────
function QuizStage({ items, answers, onAnswer, onComplete }) {
  const [index, setIndex] = useState(0)
  const total = items.length
  const q = items[index]
  const selected = answers[index]
  const isLast = index === total - 1
  const pct = Math.round(((index + 1) / total) * 100)

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <span>Question {index + 1} of {total}</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', transition: 'width .2s' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{q.q}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.opts.map((opt, oi) => (
            <label key={oi} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
              border: selected === oi ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: selected === oi ? 'var(--primary-light)' : 'transparent',
              fontWeight: selected === oi ? 700 : 400, fontSize: 14,
            }}>
              <input type="radio" name={`q${index}`} checked={selected === oi} onChange={() => onAnswer(index, oi)} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}>← Previous</button>
        <button className="btn btn-primary" disabled={selected === undefined} onClick={() => isLast ? onComplete() : setIndex(i => i + 1)}>
          {isLast ? 'Submit Quiz Section →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── Coding stage ──────────────────────────────────────────────────────────────
function CodingStage({ items, results, onSolve, onFinish, saving }) {
  return (
    <div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 4px' }}>💻 Coding Challenges</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Solve each problem — you can revisit and retry before submitting.</p>
        {items.map((p, pi) => {
          const result = results.find(r => r.problemIndex === pi)
          return (
            <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: pi > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.category} · {p.difficulty}</div>
              </div>
              {result && <span style={{ fontSize: 12, fontWeight: 700, color: result.passed === result.total ? '#10b981' : '#f59e0b' }}>{result.passed}/{result.total} passed</span>}
              <button className="btn btn-ghost btn-sm" onClick={() => onSolve(pi)}>{result ? 'Retry' : 'Solve'}</button>
            </div>
          )
        })}
      </div>
      <button className="btn btn-success" disabled={saving} onClick={onFinish} style={{ marginTop: 20 }}>
        {saving ? 'Submitting…' : 'Finish & Submit'}
      </button>
    </div>
  )
}

// ── Review (read-only) ────────────────────────────────────────────────────────
function ReviewStage({ mod, submission, onBack }) {
  const quizItems = mod.quiz?.items || []
  const codingItems = mod.coding?.items || []
  const answers = submission?.quizResult?.answers || []

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 16 }}>← Back to Details</button>
      <h2 style={{ margin: '0 0 6px' }}>{mod.title}</h2>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Total Score: {submission?.totalScore ?? 0} / {maxScore(mod)}</div>

      {quizItems.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 6px' }}>❓ Quiz — {submission?.quizResult?.correct ?? 0}/{quizItems.length} correct</h3>
          {quizItems.map((q, qi) => {
            const chosen = answers.find(a => a.qIndex === qi)?.chosen
            return (
              <div key={qi} style={{ marginTop: 16, paddingTop: 16, borderTop: qi > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{qi + 1}. {q.q}</div>
                {q.opts.map((opt, oi) => (
                  <div key={oi} style={{
                    padding: '8px 12px', borderRadius: 8, marginBottom: 4, fontSize: 14,
                    background: oi === q.ans ? 'rgba(16,185,129,.12)' : oi === chosen ? 'rgba(239,68,68,.12)' : 'transparent',
                    color: oi === q.ans ? '#10b981' : oi === chosen ? '#ef4444' : 'var(--text)',
                    fontWeight: (oi === q.ans || oi === chosen) ? 700 : 400,
                  }}>
                    {opt} {oi === q.ans && '✓ Correct answer'} {oi === chosen && oi !== q.ans && '✗ Your answer'}
                  </div>
                ))}
                {q.exp && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{q.exp}</div>}
              </div>
            )
          })}
        </div>
      )}

      {codingItems.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 14px' }}>💻 Coding Challenges</h3>
          {codingItems.map((p, pi) => {
            const result = (submission?.codingResults || []).find(r => r.problemIndex === pi)
            return (
              <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: pi > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, fontWeight: 600 }}>{p.title}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: result?.passed === result?.total ? '#10b981' : '#f59e0b' }}>
                  {result ? `${result.passed}/${result.total} passed` : 'Not attempted'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Attempt orchestration ─────────────────────────────────────────────────────
function AttemptView({ module: mod, user, submission, onBack }) {
  const quizItems = mod.quiz?.items || []
  const codingItems = mod.coding?.items || []
  const hasQuiz = quizItems.length > 0
  const hasCoding = codingItems.length > 0

  const [stage, setStage] = useState(hasQuiz && !submission?.quizResult ? 'quiz' : 'coding')
  const [quizAnswers, setQuizAnswers] = useState(
    submission?.quizResult?.answers?.reduce((acc, a) => ({ ...acc, [a.qIndex]: a.chosen }), {}) || {}
  )
  const [codingResults, setCodingResults] = useState(submission?.codingResults || [])
  const [activeProblem, setActiveProblem] = useState(null)
  const [saving, setSaving] = useState(false)

  const persist = async (patch) => {
    const now = new Date().toISOString()
    const data = {
      uid: user.uid, moduleId: mod.id, collegeId: mod.collegeId,
      studentName: user.name || '', studentDept: user.branch || '', studentYear: user.yearOfStudy || '',
      status: 'in-progress',
      startedAt: submission?.startedAt || now,
      quizResult: submission?.quizResult || null,
      codingResults: submission?.codingResults || [],
      totalScore: submission?.totalScore || 0,
      submittedAt: null,
      ...patch,
    }
    await setDoc(doc(db, 'moduleSubmissions', subId(user.uid, mod.id)), data, { merge: true })
    return data
  }

  const computeQuizResult = () => {
    const answers = quizItems.map((q, i) => ({ qIndex: i, chosen: quizAnswers[i] ?? -1 }))
    const correct = answers.filter(a => quizItems[a.qIndex].ans === a.chosen).length
    return { score: correct, correct, total: quizItems.length, answers, submittedAt: new Date().toISOString() }
  }

  const completeQuizSection = async () => {
    const quizResult = computeQuizResult()
    const codingPts = codingResults.reduce((s, r) => s + (r.earnedPts || 0), 0)
    if (hasCoding) {
      await persist({ quizResult, totalScore: quizResult.correct + codingPts })
      setStage('coding')
    } else {
      setSaving(true)
      await persist({ quizResult, status: 'submitted', submittedAt: new Date().toISOString(), totalScore: quizResult.correct + codingPts })
      setSaving(false)
      onBack()
    }
  }

  const onCodingSubmit = (problemIndex) => (result) => {
    const entry = { problemIndex, ...result }
    const updated = [...codingResults.filter(r => r.problemIndex !== problemIndex), entry]
    setCodingResults(updated)
    const quizPts = submission?.quizResult?.correct ?? 0
    const codingPts = updated.reduce((s, r) => s + (r.earnedPts || 0), 0)
    persist({ codingResults: updated, totalScore: quizPts + codingPts })
  }

  const finishAll = async () => {
    setSaving(true)
    const quizResult = submission?.quizResult || (hasQuiz ? computeQuizResult() : null)
    const quizPts = quizResult?.correct || 0
    const codingPts = codingResults.reduce((s, r) => s + (r.earnedPts || 0), 0)
    await persist({ quizResult, status: 'submitted', submittedAt: new Date().toISOString(), totalScore: quizPts + codingPts })
    setSaving(false)
    onBack()
  }

  if (activeProblem !== null) {
    const problem = codingItems[activeProblem]
    const existing = codingResults.find(r => r.problemIndex === activeProblem)
    return (
      <div className="pe-modal-overlay">
        <div className="pe-modal-container">
          <div className="pe-modal-topbar">
            <div className="pe-modal-topbar-left">
              <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{mod.title}</span>
              <span style={{ color: '#475569', margin: '0 8px' }}>/</span>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{problem.title}</span>
            </div>
            <button className="pe-modal-close-btn" onClick={() => setActiveProblem(null)}>✕ Close</button>
          </div>
          <ProblemEditor
            problem={{ ...problem, id: activeProblem }}
            onSolve={() => {}}
            isSolved={!!existing}
            submissions={existing ? [existing] : []}
            onSubmit={onCodingSubmit(activeProblem)}
            awardPoints={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>
      <h2 style={{ margin: '0 0 4px' }}>{mod.title}</h2>
      {hasQuiz && hasCoding && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Step {stage === 'quiz' ? '1' : '2'} of 2 — {stage === 'quiz' ? 'Quiz' : 'Coding Challenges'}
        </div>
      )}
      {!(hasQuiz && hasCoding) && <div style={{ marginBottom: 20 }} />}

      {stage === 'quiz' && hasQuiz && (
        <QuizStage items={quizItems} answers={quizAnswers} onAnswer={(qi, oi) => setQuizAnswers(a => ({ ...a, [qi]: oi }))} onComplete={completeQuizSection} />
      )}
      {stage === 'coding' && hasCoding && (
        <CodingStage items={codingItems} results={codingResults} onSolve={setActiveProblem} onFinish={finishAll} saving={saving} />
      )}
    </div>
  )
}

// ── Page orchestration ────────────────────────────────────────────────────────
export default function StudentAssessments() {
  const { user } = useApp()
  const [modules, setModules] = useState([])
  const [submissions, setSubmissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')        // 'list' | 'details' | 'attempt' | 'review'
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return }
    const queries = [
      // Directly targeted by email works regardless of whether the student's own
      // profile is linked to a college — this is the whole point of "assign to
      // specific students by email."
      getDocs(query(collection(db, 'assessmentModules'), where('targetEmails', 'array-contains', user.email))),
    ]
    if (user.collegeId) {
      queries.push(getDocs(query(collection(db, 'assessmentModules'), where('collegeId', '==', user.collegeId))))
    }
    Promise.all([
      Promise.all(queries),
      getDocs(query(collection(db, 'moduleSubmissions'), where('uid', '==', user.uid))),
    ]).then(([moduleSnaps, sSnap]) => {
      const byId = new Map()
      moduleSnaps.forEach(snap => snap.docs.forEach(d => byId.set(d.id, { id: d.id, ...d.data() })))
      const visible = [...byId.values()].filter(m => m.status === 'published' && isTargeted(m, user))
      setModules(visible)
      const subMap = {}
      sSnap.docs.forEach(d => { subMap[d.data().moduleId] = d.data() })
      setSubmissions(subMap)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.collegeId, user?.uid, user?.email])

  const openDetails = (mod) => { setSelected(mod); setView('details') }
  const backToList = () => { setView('list'); setSelected(null) }
  const backToDetails = () => setView('details')

  const startAttempt = () => {
    // Defense in depth — the Details page already hides the button before the
    // scheduled open time, but never let an attempt start outside that window.
    if (timeStatus(selected) !== 'open') return
    setView('attempt')
  }

  const refreshAfterAttempt = async () => {
    const snap = await getDocs(query(collection(db, 'moduleSubmissions'), where('uid', '==', user.uid)))
    const subMap = {}
    snap.docs.forEach(d => { subMap[d.data().moduleId] = d.data() })
    setSubmissions(subMap)
    setView('details')
  }

  if (loading) {
    return <div style={{ padding: 24 }}><p style={{ color: 'var(--text-secondary)' }}>Loading…</p></div>
  }

  if (view === 'attempt' && selected) {
    return (
      <div style={{ padding: 24 }}>
        <AttemptView module={selected} user={user} submission={submissions[selected.id]} onBack={refreshAfterAttempt} />
      </div>
    )
  }

  if (view === 'review' && selected) {
    return (
      <div style={{ padding: 24 }}>
        <ReviewStage mod={selected} submission={submissions[selected.id]} onBack={backToDetails} />
      </div>
    )
  }

  if (view === 'details' && selected) {
    return (
      <div style={{ padding: 24 }}>
        <AssessmentDetailsPage
          mod={selected}
          submission={submissions[selected.id]}
          onBack={backToList}
          onStart={startAttempt}
          onViewResult={() => setView('review')}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {!user?.collegeId && modules.length === 0 ? (
        <>
          <h1 style={{ marginBottom: 4 }}>🧾 Assessments</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Assessment modules assigned by your college admin.</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your account isn't linked to a registered college, so there are no assessment modules to show. You can set this in your Profile.</p>
        </>
      ) : (
        <AssessmentsListPage modules={modules} submissions={submissions} onOpenDetails={openDetails} />
      )}
    </div>
  )
}
