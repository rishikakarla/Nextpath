import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'

function AttemptsTable({ attempts }) {
  const best = Math.max(...attempts.map(a => a.score))
  return (
    <div style={{ textAlign: 'left', marginTop: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Quiz Attempts · Best score: <span style={{ color: best >= 80 ? 'var(--success)' : '#ef4444' }}>{best}%</span>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '7px 12px', background: 'var(--bg)', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Date</span><span>Score</span><span>Correct</span><span>Result</span>
        </div>
        {[...attempts].reverse().map((a, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 12px', fontSize: 13, borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--card)' : 'transparent' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span style={{ fontWeight: 700, color: a.score >= 80 ? 'var(--success)' : '#ef4444' }}>{a.score}%</span>
            <span>{a.correct}/{a.total}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: a.score >= 80 ? 'var(--success)' : '#ef4444' }}>{a.score >= 80 ? '✓ Pass' : '✗ Fail'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Roadmap() {
  const { progress, toggleTopic, quizAttempts, saveQuizAttempt, assessmentResult } = useApp()
  const { roadmapPhases: roadmapByLevel } = useContent()

  const LEVEL_MAP = { 'Beginner': 'beginner', 'Beginner+': 'beginnerPlus', 'Intermediate': 'intermediate', 'Advanced': 'advanced' }
  const LEVEL_COLORS = { beginner: '#10b981', beginnerPlus: '#6366f1', intermediate: '#f59e0b', advanced: '#ef4444' }
  const levelKey = assessmentResult?.level ? (LEVEL_MAP[assessmentResult.level] || 'beginner') : null
  const roadmapPhases = levelKey ? (roadmapByLevel[levelKey] || []) : []

  const [open, setOpen] = useState(0)

  // Modal state
  const [topicModal, setTopicModal] = useState(null) // { topic, status }
  const [step, setStep] = useState('content') // 'content' | 'quiz' | 'result'
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizScore, setQuizScore] = useState(null)

  const TOTAL_TOPICS = roadmapPhases.reduce((a, p) => a + p.topics.length, 0)
  const completedCount = progress.completedTopics?.length ?? 0

  const getPhaseStatus = (phase, idx) => {
    const done = phase.topics.every(t => progress.completedTopics?.includes(t.id))
    if (done) return 'completed'
    if (idx === 0) return 'active'
    const prevDone = roadmapPhases.slice(0, idx).every(p =>
      p.topics.every(t => progress.completedTopics?.includes(t.id))
    )
    return prevDone ? 'active' : 'locked'
  }

  const openTopic = (topic, status) => {
    if (status === 'locked') return
    setTopicModal({ topic, status })
    setStep('content')
    setQuizAnswers({})
    setQuizScore(null)
  }

  const closeModal = () => setTopicModal(null)

  const isDone = topicModal && progress.completedTopics?.includes(topicModal.topic.id)
  const quiz = topicModal?.topic?.quiz || []

  const submitQuiz = () => {
    if (quiz.length === 0) {
      if (!isDone) toggleTopic(topicModal.topic.id, TOTAL_TOPICS)
      closeModal()
      return
    }
    const correct = quiz.filter((q, i) => quizAnswers[i] === q.answer).length
    const score = Math.round((correct / quiz.length) * 100)
    setQuizScore(score)
    setStep('result')
    saveQuizAttempt(topicModal.topic.id, {
      score,
      correct,
      total: quiz.length,
      date: new Date().toISOString(),
    })
    if (score >= 80 && !isDone) {
      toggleTopic(topicModal.topic.id, TOTAL_TOPICS)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Learning Roadmap</h1>
        <p className="page-subtitle">
          Structured phases to guide your career preparation
          {assessmentResult?.level && (
            <span style={{ marginLeft: 10, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: LEVEL_COLORS[levelKey] + '22', color: LEVEL_COLORS[levelKey] }}>
              {assessmentResult.level} Track
            </span>
          )}
        </p>
      </div>

      {!levelKey && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          <strong>Take the assessment first!</strong> Your roadmap is personalized based on your skill level.
          {' '}<a href="/assessment" style={{ color: 'var(--primary)', fontWeight: 600 }}>Start Assessment →</a>
        </div>
      )}

      {levelKey && roadmapPhases.length === 0 && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          No roadmap has been configured for the <strong>{assessmentResult.level}</strong> level yet. Check back soon!
        </div>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex-between">
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Overall Progress</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {completedCount} of {TOTAL_TOPICS} topics completed
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{progress.roadmap ?? 0}%</div>
        </div>
        <div className="progress-bar-wrap" style={{ marginTop: 12 }}>
          <div className="progress-bar-fill indigo" style={{ width: `${progress.roadmap ?? 0}%` }} />
        </div>
      </div>

      <div className="roadmap-phases">
        {roadmapPhases.map((phase, idx) => {
          const status = getPhaseStatus(phase, idx)
          const isOpen = open === idx
          const phaseCompleted = phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length

          return (
            <div key={phase.id} className="phase-card">
              <div className="phase-header" onClick={() => setOpen(isOpen ? -1 : idx)}>
                <div className={`phase-number ${status}`}>
                  {status === 'completed' ? '✓' : idx + 1}
                </div>
                <div className="phase-info">
                  <div className="phase-title">Phase {idx + 1} – {phase.title}</div>
                  <div className="phase-meta">
                    {phase.duration} · {phaseCompleted}/{phase.topics.length} topics
                    {status === 'locked' && ' · Complete previous phase first'}
                  </div>
                </div>
                <div style={{ marginRight: 8 }}>
                  <div className="badge" style={{
                    background: status === 'completed' ? 'var(--success-light)' : status === 'active' ? 'var(--primary-light)' : 'var(--bg)',
                    color: status === 'completed' ? '#065f46' : status === 'active' ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                    {status === 'completed' ? '✓ Done' : status === 'active' ? 'In Progress' : '🔒 Locked'}
                  </div>
                </div>
                <span className={`phase-chevron${isOpen ? ' open' : ''}`}>▶</span>
              </div>

              {isOpen && (
                <div className="phase-body">
                  <div className="topic-list">
                    {phase.topics.map(topic => {
                      const done = progress.completedTopics?.includes(topic.id)
                      const canOpen = status !== 'locked'
                      return (
                        <div
                          key={topic.id}
                          className={`topic-item${done ? ' done' : ''}`}
                          onClick={() => canOpen && openTopic(topic, status)}
                          style={{ cursor: canOpen ? 'pointer' : 'default', opacity: canOpen ? 1 : 0.6 }}
                        >
                          <div className="topic-check">{done ? '✓' : ''}</div>
                          <span className="topic-name">{topic.name}</span>
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {done ? (
                              <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>+8 pts</span>
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 500 }}>
                                {topic.quiz?.length > 0 ? `Quiz (${topic.quiz.length}Q)` : topic.resources?.length > 0 ? '▶ Video' : 'Start →'}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Topic Modal ─────────────────────────────────────────────────────── */}
      {topicModal && (
        <div className="problem-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="problem-modal" style={{ maxWidth: 580, maxHeight: '88vh', overflowY: 'auto' }}>

            {/* Header */}
            <div className="modal-header">
              <div>
                <div className="modal-title">{topicModal.topic.name}</div>
                {isDone && (
                  <span style={{ display: 'inline-block', marginTop: 6, fontSize: 12, background: 'var(--success-light)', color: '#065f46', borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>
                    ✓ Completed
                  </span>
                )}
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* ── Step: Content ─────────────────────────────────────────── */}
            {step === 'content' && (
              <>
                {topicModal.topic.description && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      About this Topic
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.75, margin: 0 }}>{topicModal.topic.description}</p>
                  </div>
                )}

                {topicModal.topic.resources?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                      Learning Resources
                    </div>
                    {topicModal.topic.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                        background: 'var(--bg)', borderRadius: 8, marginBottom: 8,
                        textDecoration: 'none', color: 'var(--text)',
                        border: '1px solid var(--border)', fontSize: 14,
                      }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>▶</span>
                        <span style={{ flex: 1, fontWeight: 500 }}>{r.title || r.url}</span>
                        <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>Watch →</span>
                      </a>
                    ))}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                      Videos open in a new tab. You can skip and come back anytime.
                    </div>
                  </div>
                )}

                {!topicModal.topic.description && !topicModal.topic.resources?.length && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20, fontStyle: 'italic' }}>
                    No content added for this topic yet.
                  </div>
                )}

                {isDone && quizAttempts[topicModal.topic.id]?.length > 0 && (
                  <AttemptsTable attempts={quizAttempts[topicModal.topic.id]} />
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {isDone ? (
                    <button className="btn btn-ghost" onClick={closeModal}>Close</button>
                  ) : quiz.length > 0 ? (
                    <>
                      <button className="btn btn-primary" onClick={() => setStep('quiz')}>
                        Take Quiz ({quiz.length} Q) →
                      </button>
                      <button className="btn btn-ghost" onClick={closeModal}>Skip for now</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-success" onClick={submitQuiz}>
                        ✓ Mark as Complete (+8 pts)
                      </button>
                      <button className="btn btn-ghost" onClick={closeModal}>Close</button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── Step: Quiz ────────────────────────────────────────────── */}
            {step === 'quiz' && (
              <>
                <div style={{ marginBottom: 20, padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 8, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                  Score 80% or above to complete this topic and earn +8 pts
                </div>

                {quiz.map((q, qi) => (
                  <div key={qi} style={{ marginBottom: 22 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
                      Q{qi + 1}. {q.question}
                    </div>
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setQuizAnswers(a => ({ ...a, [qi]: oi }))}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '9px 14px', marginBottom: 6, borderRadius: 8,
                          border: `2px solid ${quizAnswers[qi] === oi ? 'var(--primary)' : 'var(--border)'}`,
                          background: quizAnswers[qi] === oi ? 'var(--primary-light)' : 'var(--bg)',
                          color: 'var(--text)', cursor: 'pointer', fontSize: 13,
                        }}
                      >
                        <span style={{ fontWeight: 700, marginRight: 8 }}>{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-primary"
                    onClick={submitQuiz}
                    disabled={quiz.some((_, i) => quizAnswers[i] === undefined)}
                  >
                    Submit Quiz
                  </button>
                  <button className="btn btn-ghost" onClick={() => setStep('content')}>← Back</button>
                </div>
              </>
            )}

            {/* ── Step: Result ──────────────────────────────────────────── */}
            {step === 'result' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>{quizScore >= 80 ? '🎉' : '😔'}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: quizScore >= 80 ? 'var(--success)' : '#ef4444', marginBottom: 4 }}>
                  {quizScore}%
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                  {quiz.filter((q, i) => quizAnswers[i] === q.answer).length} / {quiz.length} correct
                </div>

                {quizScore >= 80 ? (
                  <>
                    <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: 15, marginBottom: 20 }}>
                      Topic completed! +8 pts added to your score.
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={closeModal}>Continue →</button>
                  </>
                ) : (
                  <>
                    <div style={{ color: '#ef4444', fontSize: 14, marginBottom: 20 }}>
                      You need at least 80% to complete this topic. Give it another try!
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
                      <button className="btn btn-primary" onClick={() => { setQuizAnswers({}); setStep('quiz') }}>Try Again</button>
                      <button className="btn btn-ghost" onClick={closeModal}>Close</button>
                    </div>
                  </>
                )}
                {quizAttempts[topicModal.topic.id]?.length > 0 && (
                  <AttemptsTable attempts={quizAttempts[topicModal.topic.id]} />
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
