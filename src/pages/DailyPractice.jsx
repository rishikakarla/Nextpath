import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { db } from '../firebase'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import ProblemEditor from '../components/ProblemEditor'

const SECTIONS = [
  { key: 'coding',   icon: '💻', label: 'Coding Challenge', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', xp: 10, desc: 'Solve a daily coding problem' },
  { key: 'aptitude', icon: '🧮', label: 'Aptitude Quiz',    color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', xp: 5,  desc: 'Test your logical thinking' },
  { key: 'revision', icon: '📖', label: 'Concept Revision', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', xp: 5,  desc: 'Reinforce core concepts' },
]

const MAX_XP = SECTIONS.reduce((s, sec) => s + sec.xp, 0)

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
  const [testScore, setTestScore] = useState(null)
  const solvedRef = useRef(false)
  const hintUsedRef = useRef(false)

  const handleHintUsed = () => {
    if (hintUsedRef.current) return
    hintUsedRef.current = true
    setPoints(p => Math.max(0, p - 1))
  }

  const handleSolve = ({ passed, total } = {}) => {
    if (solvedRef.current) return
    solvedRef.current = true
    const timeTaken = stop()
    const score = total ? Math.round((passed / total) * 100) : 100
    const pts = total ? Math.round((passed / total) * 10) : 10
    setTestScore({ passed: passed ?? total, total: total ?? 0, pts })
    onComplete({ format: 'coding', title: task.title, score, passed, total, timeTaken, pts }, pts)
  }

  const isCompleted = done || !!testScore

  return (
    <div className="pe-modal-overlay">
      <div className="pe-modal-container">
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
        <ProblemEditor
          problem={task}
          isSolved={isCompleted}
          onSolve={handleSolve}
          onHintUsed={handleHintUsed}
          solvedMessage={
            testScore
              ? `✅ +${testScore.pts} pts · ${testScore.passed}/${testScore.total} test cases passed`
              : done && submission
              ? `✅ Already completed · +${submission.pts ?? 5} pts`
              : null
          }
        />
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
    const pts = questions.length ? Math.max(1, Math.round((correct / questions.length) * 5)) : 5
    setScore({ correct, total: questions.length, pct, timeTaken, pts })
    setSubmitted(true)
    onComplete({ format: 'quiz', score: pct, correct, total: questions.length, answers, timeTaken, pts }, pts)
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length

  if (done && submission) {
    const pastAnswers = submission.answers || {}
    return (
      <div className="dp-overlay" onClick={onClose}>
        <div className="dp-modal" onClick={e => e.stopPropagation()}>
          <div className="dp-modal-header">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .7, textTransform: 'uppercase', color: typeColor, marginBottom: 6 }}>Quiz Review</div>
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
                <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>+{score.pts} pts earned</div>
                <div style={{ marginTop: 2, fontSize: 13, opacity: .8 }}>⏱ {formatTime(score.timeTaken)}</div>
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700 }}>
                  {score.pct >= 80 ? '🎉 Excellent! Task marked complete.' : '📝 Quiz submitted. This is your final score.'}
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

// ── Quest Card ────────────────────────────────────────────────────────────────
function TaskCard({ section, tasks, done, submission, currentDay, onComplete }) {
  const [open, setOpen] = useState(false)
  const [burst, setBurst] = useState(false)

  const task = tasks[0]
  const isCoding = !task || task.format === 'coding' || section.key === 'coding'

  const handleComplete = (data, pts) => {
    setBurst(true)
    setTimeout(() => setBurst(false), 1200)
    onComplete(section.key, currentDay, data, pts)
  }

  return (
    <>
      <div className={`dp-quest-card${done ? ' dp-quest-done' : ''}`}>
        {/* Gradient header strip */}
        <div className="dp-quest-header" style={{ background: section.gradient }}>
          <span className="dp-quest-big-icon">{section.icon}</span>
          <span className="dp-quest-xp-pill">+{section.xp} XP</span>
          {done && <div className="dp-quest-check-ring">✓</div>}
        </div>

        <div className="dp-quest-body">
          <div className="dp-quest-type" style={{ color: section.color }}>{section.label}</div>

          {tasks.length === 0 ? (
            <p className="dp-quest-empty">No task scheduled today.</p>
          ) : (
            <>
              <div className="dp-quest-title">
                {isCoding ? task.title : `${task.questions?.length || 0}-Question Quiz`}
              </div>
              <div className="dp-quest-preview">
                {isCoding
                  ? task.description
                    ? task.description.slice(0, 72) + (task.description.length > 72 ? '…' : '')
                    : section.desc
                  : task.questions?.[0]?.question
                    ? task.questions[0].question.slice(0, 68) + '…'
                    : section.desc
                }
              </div>
              <div className="dp-quest-tags">
                {isCoding && task.difficulty && (
                  <span className={`dp-diff-tag dp-diff-${task.difficulty.toLowerCase()}`}>{task.difficulty}</span>
                )}
                {isCoding && task.category && (
                  <span className="dp-cat-tag">{task.category}</span>
                )}
              </div>
            </>
          )}

          {tasks.length > 0 && (
            done ? (
              <div
                className="dp-quest-complete-row"
                style={{ cursor: submission?.format === 'quiz' ? 'pointer' : 'default' }}
                onClick={() => submission?.format === 'quiz' && setOpen(true)}
              >
                <span className="dp-trophy">🏆</span>
                <div className="dp-quest-complete-text">
                  <span className="dp-quest-complete-title">Quest Complete!</span>
                  <span className="dp-quest-complete-meta">
                    +{submission?.pts ?? 5} XP
                    {submission?.score !== undefined && ` · ${submission.score}%`}
                    {submission?.timeTaken != null && ` · ⏱ ${formatTime(submission.timeTaken)}`}
                  </span>
                </div>
                {submission?.format === 'quiz' && <span className="dp-review-link">Review →</span>}
              </div>
            ) : (
              <button
                className="dp-quest-btn"
                style={{ '--quest-color': section.color }}
                onClick={() => setOpen(true)}
              >
                {isCoding ? '⚔️ Start Challenge' : section.key === 'revision' ? '📚 Start Revision' : '🧩 Start Quiz'}
                <span className="dp-quest-btn-arrow">→</span>
              </button>
            )
          )}
        </div>

        {burst && <div className="dp-xp-burst">+{section.xp} XP!</div>}
      </div>

      {open && task && (
        isCoding ? (
          <CodingModal task={task} done={done} submission={submission} onComplete={handleComplete} onClose={() => setOpen(false)} />
        ) : (
          <QuizModal task={task} done={done} submission={submission} onComplete={handleComplete} onClose={() => setOpen(false)} typeLabel={section.label} typeColor={section.color} />
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
  const maxScore = entries[0]?.totalScore || 300

  return (
    <div className="dp-lb-card">
      <div className="dp-lb-header">
        <div>
          <div className="dp-lb-eyebrow">⚡ Live Rankings</div>
          <h3 className="dp-lb-title">Today's Leaderboard — Day {currentDay}</h3>
        </div>
        <span className="dp-lb-subtitle">Score · Speed</span>
      </div>

      {loading ? (
        <div className="dp-lb-empty">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="dp-lb-empty">
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏁</div>
          No completions yet today. Be the first!
        </div>
      ) : (
        <div className="dp-lb-list">
          {entries.map((e, i) => {
            const isMe = e.uid === currentUid
            const barPct = maxScore > 0 ? Math.round((e.totalScore / maxScore) * 100) : 0
            return (
              <div key={e.uid} className={`dp-lb-row${isMe ? ' dp-lb-me' : ''}`}>
                <div className="dp-lb-rank">
                  {i < 3 ? <span className="dp-lb-medal">{medals[i]}</span> : <span className="dp-lb-rank-num">{i + 1}</span>}
                </div>
                <div className="dp-lb-info">
                  <div className="dp-lb-name">
                    {e.name || 'Student'}
                    {isMe && <span className="dp-lb-you">YOU</span>}
                  </div>
                  {e.college && <div className="dp-lb-college">{e.college}</div>}
                  <div className="dp-lb-bar-track">
                    <div className="dp-lb-bar-fill" style={{ width: `${barPct}%`, background: isMe ? 'var(--primary)' : '#94a3b8' }} />
                  </div>
                </div>
                <div className="dp-lb-stats">
                  <div className="dp-lb-score">{e.totalScore}<span className="dp-lb-score-max">/300</span></div>
                  <div className="dp-lb-time">⏱ {formatTime(e.totalTime || 0)}</div>
                  <span className={`dp-lb-tasks${e.tasksCompleted === 3 ? ' full' : ''}`}>{e.tasksCompleted}/3</span>
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
    <div className="dp-history-row">
      <button className="dp-history-toggle" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="dp-history-day">Day {dayNum}</span>
          <div className="dp-history-dots">
            {SECTIONS.map(s => (
              <span key={s.key} className={`dp-history-dot${dayHistory?.[s.key] ? ' filled' : ''}`} style={{ '--dot-color': s.color }} />
            ))}
          </div>
          <span className={`dp-history-status${allDone ? ' all-done' : completedCount > 0 ? ' partial' : ''}`}>
            {allDone ? '✅ All done' : completedCount > 0 ? `${completedCount}/3 done` : hasContent ? 'Not started' : 'No tasks'}
          </span>
        </div>
        <span className="dp-history-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="dp-history-body">
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
                <div key={section.key} className="dp-history-section">
                  <div className="dp-history-section-head">
                    <span>{section.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{section.label}</span>
                    {sub ? (
                      <span className="dp-history-done-tag">
                        ✅ {sub.score !== undefined ? `${sub.score}%` : 'Completed'}
                        {sub.timeTaken != null ? ` · ⏱ ${formatTime(sub.timeTaken)}` : ''}
                      </span>
                    ) : (
                      <span className="dp-history-skip-tag">Not completed</span>
                    )}
                  </div>
                  <div className="dp-history-content">
                    {isCoding ? (
                      <>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          {task.difficulty && <span style={{ fontWeight: 700, fontSize: 11, color: task.difficulty === 'Easy' ? '#16a34a' : task.difficulty === 'Medium' ? '#d97706' : '#dc2626' }}>{task.difficulty}</span>}
                          {task.category && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.category}</span>}
                        </div>
                        {task.description && <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 13 }}>{task.description}</p>}
                        {task.example && <pre className="code-block" style={{ fontSize: 12, marginBottom: 0 }}>{task.example}</pre>}
                      </>
                    ) : (
                      (task.questions || []).map((q, qi) => {
                        const chosen = sub?.answers?.[qi]
                        const isCorrect = chosen === q.answer
                        return (
                          <div key={qi} style={{ marginBottom: qi < task.questions.length - 1 ? 14 : 0 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Q{qi + 1}. {q.question}</div>
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

  // Calculate XP earned today
  const xpEarned = SECTIONS.reduce((sum, sec) => {
    const sub = taskHistory?.[`day_${currentDay}`]?.[sec.key]
    return sum + (sub?.pts ?? (dailyTasks[sec.key] ? sec.xp : 0))
  }, 0)
  const xpPct = Math.min(100, Math.round((xpEarned / MAX_XP) * 100))

  const handleComplete = async (type, dayNum, data, pts) => {
    completeTask(type, dayNum, data, pts)
    if (!user) return
    try {
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
      {/* ── Hero Banner ── */}
      <div className="dp-hero">
        <div className="dp-hero-left">
          <div className="dp-hero-eyebrow">Daily Practice</div>
          <h1 className="dp-hero-title">
            Day <span className="dp-hero-day">{currentDay}</span>
          </h1>
          <p className="dp-hero-sub">Complete all 3 quests to keep your streak alive</p>

          {/* XP Bar */}
          <div className="dp-hero-xp-wrap">
            <div className="dp-hero-xp-label">
              <span>⚡ Daily XP</span>
              <span className="dp-hero-xp-count">{xpEarned} / {MAX_XP}</span>
            </div>
            <div className="dp-hero-xp-track">
              <div className="dp-hero-xp-fill" style={{ width: `${xpPct}%` }} />
              {xpPct > 0 && <div className="dp-hero-xp-glow" style={{ left: `${xpPct}%` }} />}
            </div>
          </div>
        </div>

        <div className="dp-hero-right">
          {/* Streak */}
          <div className="dp-streak-box">
            <div className="dp-streak-fire">🔥</div>
            <div className="dp-streak-count">{streak.count}</div>
            <div className="dp-streak-label">day streak</div>
          </div>

          {/* Quest progress circles */}
          <div className="dp-quest-progress">
            {SECTIONS.map((sec, i) => (
              <div key={sec.key} className="dp-qp-item">
                {i > 0 && <div className={`dp-qp-line${dailyTasks[SECTIONS[i - 1].key] ? ' done' : ''}`} />}
                <div className={`dp-qp-circle${dailyTasks[sec.key] ? ' done' : ''}`} style={{ '--qp-color': sec.color }}>
                  {dailyTasks[sec.key] ? '✓' : sec.icon}
                </div>
                <div className="dp-qp-label">{sec.label.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Status Banner ── */}
      {allDone ? (
        <div className="dp-status-banner dp-status-win">
          <span className="dp-status-icon">🎉</span>
          <div>
            <div className="dp-status-title">All quests complete!</div>
            <div className="dp-status-sub">Your streak continues. See you tomorrow for Day {currentDay + 1}!</div>
          </div>
        </div>
      ) : hasAnyTasks ? (
        <div className="dp-status-banner dp-status-info">
          <span className="dp-status-icon">⚔️</span>
          <div>
            <div className="dp-status-title">{3 - doneCount} quest{3 - doneCount !== 1 ? 's' : ''} remaining</div>
            <div className="dp-status-sub">Complete all tasks to earn the full {MAX_XP} XP and maintain your streak.</div>
          </div>
        </div>
      ) : (
        <div className="dp-status-banner dp-status-info">
          <span className="dp-status-icon">📅</span>
          <div>
            <div className="dp-status-title">No tasks scheduled yet</div>
            <div className="dp-status-sub">Check back soon or review past days below!</div>
          </div>
        </div>
      )}

      {/* ── Quest Cards ── */}
      <div className="dp-quests-grid">
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

      {/* ── Leaderboard ── */}
      <DailyLeaderboard currentDay={currentDay} currentUid={user?.uid} />

      {/* ── History ── */}
      {pastDays.length > 0 && (
        <div className="dp-history-section-wrap">
          <div className="dp-history-heading">
            <span>📋</span>
            <h3>Practice History</h3>
          </div>
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
