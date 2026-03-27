import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { db } from '../firebase'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import ProblemEditor from '../components/ProblemEditor'

const SECTIONS = [
  { key: 'coding',   icon: '💻', label: 'Coding Challenge', color: '#6366f1' },
  { key: 'aptitude', icon: '🧮', label: 'Aptitude Quiz',    color: '#f59e0b' },
  { key: 'revision', icon: '📖', label: 'Concept Revision', color: '#10b981' },
]

function getDayNumber(createdAt) {
  if (!createdAt) return 1
  const start = new Date(createdAt)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1
}

function formatTime(secs) {
  if (!secs && secs !== 0) return '0:00'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Timer hook — starts on mount, returns live display + a stop() snapshot ──
function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])
  const stop = () => Math.floor((Date.now() - startRef.current) / 1000)
  return { elapsed, stop }
}

// ── Coding Challenge Modal ────────────────────────────────────────────────────
function CodingModal({ task, done, submission, onComplete, onClose }) {
  const { stop } = useTimer()
  const { setPoints } = useApp()
  const [solved, setSolved] = useState(false)
  const [testScore, setTestScore] = useState(null) // { passed, total, pts }
  const hintUsedRef = useRef(false)

  const handleHintUsed = () => {
    if (hintUsedRef.current) return
    hintUsedRef.current = true
    setPoints(p => Math.max(0, p - 1))
  }

  const handleSolve = ({ passed, total } = {}) => {
    const timeTaken = stop()
    const score = total ? Math.round((passed / total) * 100) : 100
    const pts = total ? Math.max(1, Math.round((passed / total) * 5)) : 5
    setTestScore({ passed: passed ?? total, total: total ?? 0, pts })
    setSolved(true)
    onComplete({ format: 'coding', title: task.title, score, passed, total, timeTaken }, pts)
  }

  const isCompleted = done || solved

  return (
    <div className="pe-modal-overlay">
      <div className="pe-modal-container">
        {/* Top bar */}
        <div className="pe-modal-topbar">
          <div className="pe-modal-topbar-left">
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>NextPath</span>
            <span style={{ color: '#475569', margin: '0 8px' }}>/</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Daily Challenge</span>
            <span style={{ color: '#475569', margin: '0 8px' }}>/</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{task.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isCompleted && (
              <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>
                ✅ Completed · +{testScore?.pts ?? submission?.pts ?? 5} pts
              </span>
            )}
            <button className="pe-modal-close-btn" onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {isCompleted ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#f1f5f9' }}>
            <span style={{ fontSize: 48 }}>✅</span>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Challenge Completed!</div>
            {(testScore || submission?.total) && (
              <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '10px 20px' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>
                    {testScore?.passed ?? submission?.passed ?? 0}/{testScore?.total ?? submission?.total ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, textTransform: 'uppercase', letterSpacing: .5 }}>Test Cases</div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '10px 20px' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fcd34d' }}>
                    +{testScore?.pts ?? submission?.pts ?? 5} pts
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, textTransform: 'uppercase', letterSpacing: .5 }}>Earned</div>
                </div>
              </div>
            )}
            <div style={{ fontSize: 14, color: '#94a3b8' }}>
              {submission?.timeTaken != null ? `Solved in ${formatTime(submission.timeTaken)}` : ''}
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <ProblemEditor
            problem={task}
            isSolved={false}
            onSolve={handleSolve}
            onHintUsed={handleHintUsed}
          />
        )}
      </div>
    </div>
  )
}

// ── Quiz Modal ────────────────────────────────────────────────────────────────
function QuizModal({ task, done, submission, onComplete, onClose, typeLabel = 'Aptitude Quiz', typeColor = '#f59e0b' }) {
  const questions = task.questions || []
  const { elapsed, stop } = useTimer()
  const [answers, setAnswers]     = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore]         = useState(null)

  const handleSubmit = () => {
    const timeTaken = stop()
    let correct = 0
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++ })
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0
    setScore({ correct, total: questions.length, pct, timeTaken })
    setSubmitted(true)
    if (pct >= 80) {
      onComplete({ format: 'quiz', score: pct, correct, total: questions.length, answers, timeTaken })
    }
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length

  // Past submission review mode
  if (done && submission) {
    const pastAnswers = submission.answers || {}
    return (
      <div className="dp-overlay" onClick={onClose}>
        <div className="dp-modal" onClick={e => e.stopPropagation()}>
          <div className="dp-modal-header">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .7, textTransform: 'uppercase', color: typeColor, marginBottom: 6 }}>
                Quiz Review
              </div>
              <h2 className="dp-modal-title">Your Submission</h2>
            </div>
            <button className="dp-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="dp-modal-body">
            <div className={`dp-score-box ${submission.score >= 80 ? 'pass' : 'fail'}`} style={{ marginBottom: 20 }}>
              <div className="dp-score-num">{submission.score}%</div>
              <div style={{ marginTop: 6, fontWeight: 600, fontSize: 15 }}>{submission.correct} / {submission.total} correct</div>
              {submission.timeTaken != null && (
                <div style={{ marginTop: 4, fontSize: 13, opacity: .8 }}>⏱ Completed in {formatTime(submission.timeTaken)}</div>
              )}
            </div>
            {questions.map((q, i) => {
              const chosen = pastAnswers[i]
              const isCorrect = chosen === q.answer
              return (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Q{i + 1}. {q.question}</div>
                  {(q.options || []).map((opt, j) => {
                    let cls = ''
                    if (j === q.answer) cls = 'correct'
                    else if (j === chosen && !isCorrect) cls = 'wrong'
                    return (
                      <div key={j} className={`dp-quiz-option ${cls}`} style={{ cursor: 'default' }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: cls === 'correct' ? '#22c55e' : cls === 'wrong' ? '#ef4444' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {cls === 'correct' ? '✓' : cls === 'wrong' ? '✗' : String.fromCharCode(65 + j)}
                        </span>
                        {opt}
                      </div>
                    )
                  })}
                  {q.explanation && (
                    <div className="dp-explanation">
                      <span className="dp-explanation-label">💡 Explanation</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dp-overlay" onClick={onClose}>
      <div className="dp-modal" onClick={e => e.stopPropagation()}>
        <div className="dp-modal-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .7, textTransform: 'uppercase', color: typeColor }}>
                Quiz · {questions.length} Question{questions.length !== 1 ? 's' : ''}
              </div>
              {!submitted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, color: elapsed >= 300 ? '#dc2626' : 'var(--text)' }}>
                  ⏱ {formatTime(elapsed)}
                </div>
              )}
            </div>
            <h2 className="dp-modal-title" style={{ marginTop: 6 }}>
              {submitted ? 'Quiz Results' : 'Answer all questions'}
            </h2>
          </div>
          <button className="dp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="dp-modal-body">
          {submitted && score ? (
            <>
              <div className={`dp-score-box ${score.pct >= 80 ? 'pass' : 'fail'}`}>
                <div className="dp-score-num">{score.pct}%</div>
                <div style={{ marginTop: 6, fontWeight: 600, fontSize: 15 }}>{score.correct} / {score.total} correct</div>
                <div style={{ marginTop: 4, fontSize: 13, opacity: .8 }}>⏱ {formatTime(score.timeTaken)}</div>
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700 }}>
                  {score.pct >= 80 ? '🎉 Passed! Task marked complete.' : '❌ Need 80% to pass. Try again!'}
                </div>
              </div>

              {questions.map((q, i) => {
                const chosen = answers[i]
                const isCorrect = chosen === q.answer
                return (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Q{i + 1}. {q.question}</div>
                    {(q.options || []).map((opt, j) => {
                      let cls = ''
                      if (j === q.answer) cls = 'correct'
                      else if (j === chosen && !isCorrect) cls = 'wrong'
                      return (
                        <div key={j} className={`dp-quiz-option ${cls}`} style={{ cursor: 'default' }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: cls === 'correct' ? '#22c55e' : cls === 'wrong' ? '#ef4444' : 'var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {cls === 'correct' ? '✓' : cls === 'wrong' ? '✗' : String.fromCharCode(65 + j)}
                          </span>
                          {opt}
                        </div>
                      )
                    })}
                    {q.explanation && (
                      <div className="dp-explanation">
                        <span className="dp-explanation-label">💡 Explanation</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}

              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>Close</button>
            </>
          ) : (
            <>
              {questions.map((q, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--primary)', marginRight: 6 }}>Q{i + 1}.</span>{q.question}
                  </div>
                  {(q.options || []).map((opt, j) => (
                    <div
                      key={j}
                      className={`dp-quiz-option${answers[i] === j ? ' selected' : ''}`}
                      onClick={() => setAnswers(a => ({ ...a, [i]: j }))}
                    >
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: answers[i] === j ? '#6366f1' : 'var(--bg)', border: `2px solid ${answers[i] === j ? '#6366f1' : 'var(--border)'}`, color: answers[i] === j ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all .15s' }}>
                        {String.fromCharCode(65 + j)}
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
              ))}

              <div className="dp-divider" />

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 700, opacity: allAnswered ? 1 : .5 }}
                disabled={!allAnswered}
                onClick={handleSubmit}
              >
                Submit Answers
              </button>
              {!allAnswered && (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Answer all questions to submit
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ section, tasks, done, submission, currentDay, onComplete }) {
  const [open, setOpen] = useState(false)

  const task = tasks[0]
  const isCoding = !task || task.format === 'coding' || section.key === 'coding'

  const handleComplete = (data, pts) => {
    onComplete(section.key, currentDay, data, pts)
  }

  return (
    <>
      <div className={`daily-task-card${done ? ' completed' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div className="daily-task-icon">{section.icon}</div>
          <span className="badge badge-primary" style={{ fontSize: 10 }}>{section.label}</span>
        </div>

        {tasks.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', flex: 1 }}>
            No tasks scheduled for today.
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            {isCoding ? (
              <>
                <div className="daily-task-title">{task.title}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  {task.difficulty && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: task.difficulty === 'Easy' ? '#16a34a' : task.difficulty === 'Medium' ? '#d97706' : '#dc2626' }}>
                      {task.difficulty}
                    </span>
                  )}
                  {task.category && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.category}</span>}
                </div>
                {task.description && (
                  <div className="daily-task-desc" style={{ marginTop: 6 }}>
                    {task.description.length > 80 ? task.description.slice(0, 80) + '…' : task.description}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="daily-task-title">{task.questions?.length || 0} Question Quiz</div>
                {task.questions?.[0] && (
                  <div className="daily-task-desc" style={{ marginTop: 4 }}>
                    {task.questions[0].question.length > 70 ? task.questions[0].question.slice(0, 70) + '…' : task.questions[0].question}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tasks.length > 0 && (
          done ? (
            <div
              className="task-completed-badge"
              style={{ marginTop: 12, cursor: submission?.format === 'quiz' ? 'pointer' : 'default' }}
              onClick={() => submission?.format === 'quiz' && setOpen(true)}
            >
              <span>✅</span>
              <span>
                Completed · +5 pts
                {submission?.score !== undefined && ` · ${submission.score}%`}
                {submission?.timeTaken != null && ` · ⏱ ${formatTime(submission.timeTaken)}`}
              </span>
              {submission?.format === 'quiz' && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6366f1', fontWeight: 600 }}>Review →</span>
              )}
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 12, width: '100%' }}
              onClick={() => setOpen(true)}
            >
              {isCoding ? 'Open Challenge' : 'Start Quiz'} · +5 pts
            </button>
          )
        )}
      </div>

      {open && task && (
        isCoding ? (
          <CodingModal
            task={task}
            done={done}
            submission={submission}
            onComplete={handleComplete}
            onClose={() => setOpen(false)}
          />
        ) : (
          <QuizModal
            task={task}
            done={done}
            submission={submission}
            onComplete={handleComplete}
            onClose={() => setOpen(false)}
            typeLabel={section.label}
            typeColor={section.color}
          />
        )
      )}
    </>
  )
}

// ── Daily Leaderboard ─────────────────────────────────────────────────────────
function DailyLeaderboard({ currentDay, currentUid }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const q = query(collection(db, 'dailyLeaderboard'), where('dayNum', '==', currentDay))
        const snap = await getDocs(q)
        if (cancelled) return
        const data = snap.docs.map(d => d.data())
        // Sort: most tasks completed first, then highest score, then lowest time
        data.sort((a, b) => {
          if (b.tasksCompleted !== a.tasksCompleted) return b.tasksCompleted - a.tasksCompleted
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
          return (a.totalTime || 0) - (b.totalTime || 0)
        })
        setEntries(data)
      } catch (e) {
        console.error('Leaderboard load failed:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [currentDay])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 className="card-title" style={{ margin: 0 }}>Today's Leaderboard — Day {currentDay}</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ranked by score · time</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          No completions yet today. Be the first!
        </div>
      ) : (
        <div>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 90px 90px 80px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: .5 }}>
            <span>#</span><span>Student</span><span style={{ textAlign: 'center' }}>Score</span><span style={{ textAlign: 'center' }}>Time</span><span style={{ textAlign: 'center' }}>Tasks</span>
          </div>
          {entries.map((e, i) => {
            const isMe = e.uid === currentUid
            return (
              <div key={e.uid} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 90px 90px 80px',
                gap: 8, padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                background: isMe ? 'var(--primary-light)' : i % 2 === 0 ? 'var(--bg)' : 'transparent',
                border: isMe ? '1px solid var(--primary)' : '1px solid transparent',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 18, textAlign: 'center' }}>{medals[i] || `${i + 1}`}</span>
                <div>
                  <div style={{ fontWeight: isMe ? 700 : 500, fontSize: 14 }}>
                    {e.name || 'Student'}{isMe && <span style={{ fontSize: 11, color: 'var(--primary)', marginLeft: 6, fontWeight: 700 }}>You</span>}
                  </div>
                  {e.college && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.college}</div>}
                </div>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, color: e.totalScore >= 240 ? '#16a34a' : 'var(--text)' }}>
                  {e.totalScore}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>/300</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ⏱ {formatTime(e.totalTime || 0)}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, background: e.tasksCompleted === 3 ? '#f0fdf4' : '#f1f5f9', color: e.tasksCompleted === 3 ? '#16a34a' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: 10, border: `1px solid ${e.tasksCompleted === 3 ? '#86efac' : 'var(--border)'}` }}>
                    {e.tasksCompleted}/3
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Past Day History ──────────────────────────────────────────────────────────
function PastDayRow({ dayNum, taskContent, dayHistory }) {
  const [open, setOpen] = useState(false)

  const completedCount = SECTIONS.filter(s => dayHistory?.[s.key]).length
  const allDone = completedCount === 3

  const getTaskForDay = (arr, day) => {
    if (!arr || arr.length === 0) return []
    return [arr[(day - 1) % arr.length]]
  }
  const tasksForDay = {
    coding:   getTaskForDay(taskContent.coding,   dayNum),
    aptitude: getTaskForDay(taskContent.aptitude, dayNum),
    revision: getTaskForDay(taskContent.revision, dayNum),
  }
  const hasContent = SECTIONS.some(s => tasksForDay[s.key].length > 0)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', background: 'var(--card-bg)', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Day {dayNum}</span>
          <span style={{ fontSize: 12, fontWeight: 600,
            color: allDone ? '#16a34a' : completedCount > 0 ? '#d97706' : 'var(--text-muted)',
            background: allDone ? '#f0fdf4' : completedCount > 0 ? '#fffbeb' : 'var(--bg)',
            padding: '2px 10px', borderRadius: 20, border: `1px solid ${allDone ? '#86efac' : completedCount > 0 ? '#fcd34d' : 'var(--border)'}`,
          }}>
            {allDone ? '✅ All done' : completedCount > 0 ? `${completedCount}/3 done` : hasContent ? 'Not started' : 'No tasks'}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          {!hasContent ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>No tasks were scheduled for Day {dayNum}.</p>
          ) : (
            SECTIONS.map(section => {
              const tasks = tasksForDay[section.key]
              const sub = dayHistory?.[section.key]
              if (tasks.length === 0) return null
              const task = tasks[0]
              const isCoding = task.format === 'coding' || section.key === 'coding'
              return (
                <div key={section.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{section.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{section.label}</span>
                    {sub ? (
                      <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '1px 8px', borderRadius: 10, border: '1px solid #86efac' }}>
                        ✅ {sub.score !== undefined ? `${sub.score}%` : 'Completed'}
                        {sub.timeTaken != null ? ` · ⏱ ${formatTime(sub.timeTaken)}` : ''}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '1px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>Not completed</span>
                    )}
                  </div>
                  <div style={{ padding: '12px 16px', background: 'var(--card)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }}>
                    {isCoding ? (
                      <>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          {task.difficulty && <span style={{ fontWeight: 700, fontSize: 11, color: task.difficulty === 'Easy' ? '#16a34a' : task.difficulty === 'Medium' ? '#d97706' : '#dc2626' }}>{task.difficulty}</span>}
                          {task.category && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.category}</span>}
                        </div>
                        {task.description && <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{task.description}</p>}
                        {task.example && <pre className="code-block" style={{ fontSize: 12, marginBottom: 0 }}>{task.example}</pre>}
                      </>
                    ) : (
                      (task.questions || []).map((q, qi) => {
                        const chosen = sub?.answers?.[qi]
                        const isCorrect = chosen === q.answer
                        return (
                          <div key={qi} style={{ marginBottom: qi < task.questions.length - 1 ? 14 : 0 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Q{qi + 1}. {q.question}</div>
                            {(q.options || []).map((opt, oi) => {
                              let bg = 'transparent', color = 'inherit', fw = 400
                              if (oi === q.answer) { bg = '#dcfce7'; color = '#15803d'; fw = 600 }
                              else if (sub && oi === chosen && !isCorrect) { bg = '#fee2e2'; color = '#dc2626' }
                              return (
                                <div key={oi} style={{ padding: '4px 10px', borderRadius: 6, marginBottom: 3, background: bg, color, fontWeight: fw, fontSize: 12 }}>
                                  {oi === q.answer ? '✓ ' : (sub && oi === chosen && !isCorrect ? '✗ ' : '  ')}{opt}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DailyPractice() {
  const { dailyTasks, completeTask, streak, user, taskHistory } = useApp()
  const { dailyTasks: taskContent } = useContent()

  const currentDay = getDayNumber(user?.createdAt)

  const getTaskForDay = (arr, day) => {
    if (!arr || arr.length === 0) return []
    return [arr[(day - 1) % arr.length]]
  }

  const todayTasks = {
    coding:   getTaskForDay(taskContent.coding,   currentDay),
    aptitude: getTaskForDay(taskContent.aptitude, currentDay),
    revision: getTaskForDay(taskContent.revision, currentDay),
  }

  const doneCount = SECTIONS.filter(s => dailyTasks[s.key]).length
  const allDone = doneCount === 3
  const hasAnyTasks = SECTIONS.some(s => todayTasks[s.key].length > 0)
  const pastDays = currentDay > 1 ? Array.from({ length: currentDay - 1 }, (_, i) => currentDay - 1 - i) : []

  // Write leaderboard entry whenever a task completes
  const handleComplete = async (type, dayNum, data, pts) => {
    completeTask(type, dayNum, data, pts)

    if (!user) return
    try {
      // Merge new task data into existing history to compute totals
      const dayKey = `day_${dayNum}`
      const existing = taskHistory?.[dayKey] || {}
      const merged = { ...existing, [type]: data }

      let totalScore = 0
      let totalTime = 0
      let tasksCompleted = 0
      SECTIONS.forEach(s => {
        const sub = merged[s.key]
        if (sub) {
          tasksCompleted++
          totalScore += sub.score != null ? sub.score : 100
          totalTime += sub.timeTaken || 0
        }
      })

      await setDoc(doc(db, 'dailyLeaderboard', `${user.uid}_day${dayNum}`), {
        uid: user.uid,
        name: user.name || user.email || 'Student',
        college: user.college || '',
        dayNum,
        totalScore,
        totalTime,
        tasksCompleted,
        updatedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Leaderboard update failed:', e)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Daily Practice
          <span style={{ marginLeft: 12, fontSize: 16, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 12px', borderRadius: 20 }}>
            Day {currentDay}
          </span>
        </h1>
        <p className="page-subtitle">
          Complete all 3 tasks to maintain your streak · Current streak: 🔥 {streak.count} days
        </p>
      </div>

      {allDone ? (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          🎉 All done for today! Your streak continues. Come back tomorrow for Day {currentDay + 1}!
        </div>
      ) : hasAnyTasks ? (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          Complete <strong>{3 - doneCount} more task{3 - doneCount !== 1 ? 's' : ''}</strong> to maintain your streak and earn bonus points.
        </div>
      ) : (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          No tasks scheduled for Day {currentDay} yet. Check back soon or review past days below!
        </div>
      )}

      <div className="daily-tasks-grid">
        {SECTIONS.map(section => (
          <TaskCard
            key={section.key}
            section={section}
            tasks={todayTasks[section.key]}
            done={dailyTasks[section.key]}
            submission={taskHistory?.[`day_${currentDay}`]?.[section.key]}
            currentDay={currentDay}
            onComplete={handleComplete}
          />
        ))}
      </div>

      <DailyLeaderboard currentDay={currentDay} currentUid={user?.uid} />

      {pastDays.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Practice History</h3>
          {pastDays.map(day => (
            <PastDayRow
              key={day}
              dayNum={day}
              taskContent={taskContent}
              dayHistory={taskHistory?.[`day_${day}`]}
            />
          ))}
        </div>
      )}
    </div>
  )
}