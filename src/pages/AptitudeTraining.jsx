import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { LEVEL_ORDER, getRecommendedLevel } from '../data/aptitudeData'

// ── helpers ──────────────────────────────────────────────────────────────────
function bestAttempt(attempts = []) {
  if (!attempts.length) return null
  return attempts.reduce((best, a) => (a.score > (best?.score ?? -1) ? a : best), null)
}

const LEVEL_COLOR = {
  Beginner:     { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  Intermediate: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  Advanced:     { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
}
const LEVEL_BADGE_CLASS = {
  Beginner: 'badge-success', Intermediate: 'badge-primary', Advanced: 'badge-danger',
}

// ── Topic card ────────────────────────────────────────────────────────────────
function TopicCard({ topic, attempts, recommended, onClick }) {
  const best    = bestAttempt(attempts)
  const pct     = best ? Math.round(best.score) : null
  const solved  = pct !== null && pct >= 60
  const lc      = LEVEL_COLOR[topic.level]

  return (
    <div
      className={`at-card${solved ? ' at-card-done' : ''}${recommended ? ' at-card-recommended' : ''}`}
      onClick={() => onClick(topic)}
      style={{ '--lc-bg': lc.bg, '--lc-border': lc.border }}
    >
      {recommended && <div className="at-recommended-tag">⭐ Recommended for you</div>}

      <div className="at-card-top">
        <span className="at-card-icon">{topic.icon}</span>
        <span className={`badge ${LEVEL_BADGE_CLASS[topic.level]}`}>{topic.level}</span>
      </div>

      <div className="at-card-title">{topic.title}</div>
      <div className="at-card-desc">{topic.description}</div>

      <div className="at-card-footer">
        <span className="at-card-meta">{topic.quiz.length} questions</span>
        {pct !== null ? (
          <span className={`at-score-badge ${solved ? 'pass' : 'fail'}`}>
            Best: {pct}%
          </span>
        ) : (
          <span className="at-score-badge untried">Not attempted</span>
        )}
      </div>

      {pct !== null && (
        <div className="at-progress-bar-wrap">
          <div className="at-progress-bar-fill" style={{ width: pct + '%', background: solved ? '#10b981' : '#f59e0b' }} />
        </div>
      )}
    </div>
  )
}

// ── Learn tab ─────────────────────────────────────────────────────────────────
function LearnTab({ topic }) {
  return (
    <div className="at-learn">
      {topic.module.concepts.map((c, i) => (
        <div key={i} className="at-concept-block">
          <div className="at-concept-heading">{c.heading}</div>
          <pre className="at-concept-body">{c.body}</pre>
        </div>
      ))}
    </div>
  )
}

// ── Quiz tab ──────────────────────────────────────────────────────────────────
function QuizTab({ topic, onComplete }) {
  const [answers, setAnswers]     = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore]         = useState(null)

  const questions = topic.quiz

  const pick = (qi, opt) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [qi]: opt }))
  }

  const submit = () => {
    if (Object.keys(answers).length < questions.length) return
    let correct = 0
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++ })
    const pct = Math.round((correct / questions.length) * 100)
    setScore({ correct, total: questions.length, pct })
    setSubmitted(true)
    onComplete({ score: pct, correct, total: questions.length, date: new Date().toISOString() })
  }

  const reset = () => { setAnswers({}); setSubmitted(false); setScore(null) }

  return (
    <div className="at-quiz">
      {score && (
        <div className={`at-quiz-result ${score.pct >= 60 ? 'pass' : 'fail'}`}>
          <div className="at-quiz-result-score">{score.pct}%</div>
          <div className="at-quiz-result-label">
            {score.correct}/{score.total} correct &nbsp;·&nbsp;
            {score.pct >= 60 ? '✅ Passed' : '❌ Keep practising'}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={reset} style={{ marginTop: 8 }}>Try Again</button>
        </div>
      )}

      {questions.map((q, qi) => {
        const chosen   = answers[qi]
        const isRight  = submitted && chosen === q.answer
        const isWrong  = submitted && chosen !== undefined && chosen !== q.answer

        return (
          <div key={qi} className={`at-question${submitted ? ' at-question-done' : ''}`}>
            <div className="at-question-num">Q{qi + 1}</div>
            <div className="at-question-text">{q.q}</div>

            <div className="at-options">
              {q.options.map((opt, oi) => {
                let cls = 'at-option'
                if (submitted) {
                  if (oi === q.answer) cls += ' correct'
                  else if (oi === chosen) cls += ' wrong'
                } else if (chosen === oi) {
                  cls += ' selected'
                }
                return (
                  <button key={oi} className={cls} onClick={() => pick(qi, oi)}>
                    <span className="at-opt-letter">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {submitted && (
              <div className="at-explanation">
                {isRight ? '✅' : '❌'} <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        )
      })}

      {!submitted && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 12, marginTop: 8 }}
          onClick={submit}
          disabled={Object.keys(answers).length < questions.length}
        >
          Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
        </button>
      )}
    </div>
  )
}

// ── Topic Modal ───────────────────────────────────────────────────────────────
function TopicModal({ topic, attempts, onComplete, onClose }) {
  const [tab, setTab] = useState('learn')
  const lc = LEVEL_COLOR[topic.level]

  return (
    <div className="at-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="at-modal">
        {/* Header */}
        <div className="at-modal-header" style={{ borderBottom: `3px solid ${lc.border}` }}>
          <div className="at-modal-icon">{topic.icon}</div>
          <div className="at-modal-meta">
            <div className="at-modal-title">{topic.title}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
              <span className={`badge ${LEVEL_BADGE_CLASS[topic.level]}`}>{topic.level}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{topic.quiz.length} questions</span>
              {bestAttempt(attempts) && (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Best: {Math.round(bestAttempt(attempts).score)}%
                  &nbsp;·&nbsp;{attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <button className="dp-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="at-tabs">
          <button className={`at-tab${tab === 'learn' ? ' active' : ''}`} onClick={() => setTab('learn')}>
            📖 Learn
          </button>
          <button className={`at-tab${tab === 'quiz' ? ' active' : ''}`} onClick={() => setTab('quiz')}>
            📝 Quiz
          </button>
        </div>

        {/* Body */}
        <div className="at-modal-body">
          {tab === 'learn'
            ? <LearnTab topic={topic} />
            : <QuizTab topic={topic} onComplete={onComplete} />
          }
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AptitudeTraining() {
  const { quizAttempts, saveQuizAttempt, assessmentResult } = useApp()
  const { aptitudeTopics } = useContent()

  const [levelFilter, setLevelFilter] = useState('All')
  const [modal, setModal]             = useState(null) // topic object

  const recommended = getRecommendedLevel(assessmentResult)

  const filtered = useMemo(() =>
    levelFilter === 'All'
      ? aptitudeTopics
      : aptitudeTopics.filter(t => t.level === levelFilter),
    [levelFilter, aptitudeTopics]
  )

  // overall stats
  const totalTopics    = aptitudeTopics.length
  const attemptedCount = aptitudeTopics.filter(t => (quizAttempts[t.id] || []).length > 0).length
  const passedCount    = aptitudeTopics.filter(t => {
    const b = bestAttempt(quizAttempts[t.id])
    return b && b.score >= 60
  }).length

  const handleComplete = (attempt) => {
    if (modal) saveQuizAttempt(modal.id, attempt)
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Aptitude Training</h1>
        <p className="page-subtitle">
          Level-based modules and quizzes to sharpen your aptitude skills
        </p>
      </div>

      {/* Stats bar */}
      <div className="at-stats-row">
        <div className="at-stat-card">
          <div className="at-stat-num">{totalTopics}</div>
          <div className="at-stat-label">Topics</div>
        </div>
        <div className="at-stat-card">
          <div className="at-stat-num">{attemptedCount}</div>
          <div className="at-stat-label">Attempted</div>
        </div>
        <div className="at-stat-card">
          <div className="at-stat-num" style={{ color: 'var(--success)' }}>{passedCount}</div>
          <div className="at-stat-label">Passed (≥60%)</div>
        </div>
        <div className="at-stat-card">
          <div className="at-stat-num" style={{ color: 'var(--primary)' }}>
            {assessmentResult ? assessmentResult.level : '—'}
          </div>
          <div className="at-stat-label">Your Level</div>
        </div>
      </div>

      {/* Level filter */}
      <div className="category-tabs" style={{ marginBottom: 24 }}>
        {['All', ...LEVEL_ORDER].map(l => (
          <button
            key={l}
            className={`category-tab${levelFilter === l ? ' active' : ''}`}
            onClick={() => setLevelFilter(l)}
          >
            {l}
            {l !== 'All' && (
              <span style={{ marginLeft: 4, opacity: .7 }}>
                ({aptitudeTopics.filter(t => t.level === l).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Topic grid */}
      {LEVEL_ORDER.filter(l => levelFilter === 'All' || levelFilter === l).map(level => {
        const topics = filtered.filter(t => t.level === level)
        if (!topics.length) return null
        return (
          <div key={level} className="at-level-section">
            <div className="at-level-heading">
              <span
                className="at-level-dot"
                style={{ background: LEVEL_COLOR[level].border }}
              />
              {level}
              <span className="at-level-count">{topics.length} topics</span>
              {level === recommended && (
                <span className="at-level-rec-tag">⭐ Your recommended level</span>
              )}
            </div>
            <div className="at-grid">
              {topics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  attempts={quizAttempts[topic.id] || []}
                  recommended={topic.level === recommended}
                  onClick={setModal}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Modal */}
      {modal && (
        <TopicModal
          topic={modal}
          attempts={quizAttempts[modal.id] || []}
          onComplete={handleComplete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}