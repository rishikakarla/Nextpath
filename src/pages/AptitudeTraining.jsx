import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { LEVEL_ORDER, getRecommendedLevel } from '../data/aptitudeData'

// ── helpers ──────────────────────────────────────────────────────────────────
function bestAttempt(attempts = []) {
  if (!attempts.length) return null
  return attempts.reduce((best, a) => (a.score > (best?.score ?? -1) ? a : best), null)
}

const LEVEL_META = {
  Rookie: { color: '#10b981', light: '#d1fae5', border: '#6ee7b7', label: 'Beginner', icon: '🟢', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  Coder:  { color: '#6366f1', light: '#eef2ff', border: '#a5b4fc', label: 'Intermediate', icon: '🔷', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  Master: { color: '#ef4444', light: '#fef2f2', border: '#fca5a5', label: 'Advanced', icon: '🔴', gradient: 'linear-gradient(135deg,#ef4444,#f59e0b)' },
}

// ── Topic Card ────────────────────────────────────────────────────────────────
function TopicCard({ topic, attempts, recommended, onClick }) {
  const best   = bestAttempt(attempts)
  const pct    = best ? Math.round(best.score) : null
  const solved = pct !== null && pct >= 60
  const lm     = LEVEL_META[topic.level]

  return (
    <div
      className={`at-card${solved ? ' at-card-done' : ''}${recommended ? ' at-card-rec' : ''}`}
      onClick={() => onClick(topic)}
    >
      {recommended && <div className="at-rec-ribbon">⭐ Recommended</div>}

      {/* Colored header strip */}
      <div className="at-card-header" style={{ background: lm.gradient }}>
        <span className="at-card-big-icon">{topic.icon}</span>
        <span className="at-card-level-pill" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
          {topic.level}
        </span>
        {solved && <div className="at-card-solved-ring">✓</div>}
      </div>

      <div className="at-card-body">
        <div className="at-card-title">{topic.title}</div>
        <div className="at-card-desc">{topic.description}</div>

        <div className="at-card-footer">
          <span className="at-card-qcount">📝 {topic.quiz.length} questions</span>
          {pct !== null ? (
            <span className={`at-score-pill${solved ? ' pass' : ' warn'}`}>
              {solved ? '✓' : '~'} {pct}%
            </span>
          ) : (
            <span className="at-score-pill untried">Not tried</span>
          )}
        </div>

        {pct !== null && (
          <div className="at-card-bar">
            <div
              className="at-card-bar-fill"
              style={{
                width: pct + '%',
                background: solved ? '#10b981' : '#f59e0b',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Learn Tab ─────────────────────────────────────────────────────────────────
function LearnTab({ topic }) {
  return (
    <div className="at-learn">
      {topic.module.concepts.map((c, i) => (
        <div key={i} className="at-concept-block">
          <div className="at-concept-num">
            <span>{i + 1}</span>
          </div>
          <div className="at-concept-content">
            <div className="at-concept-heading">{c.heading}</div>
            <pre className="at-concept-body">{c.body}</pre>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Quiz Tab ──────────────────────────────────────────────────────────────────
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

  const answered = Object.keys(answers).length

  return (
    <div className="at-quiz">
      {score && (
        <div className={`at-result-box${score.pct >= 60 ? ' pass' : ' fail'}`}>
          <div className="at-result-score">{score.pct}%</div>
          <div className="at-result-detail">
            {score.correct}/{score.total} correct &nbsp;·&nbsp;
            {score.pct >= 60 ? '✅ Passed!' : '❌ Keep practising'}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={reset} style={{ marginTop: 10 }}>
            🔄 Try Again
          </button>
        </div>
      )}

      {questions.map((q, qi) => {
        const chosen  = answers[qi]
        const isRight = submitted && chosen === q.answer
        const isWrong = submitted && chosen !== undefined && chosen !== q.answer

        return (
          <div key={qi} className={`at-question${submitted ? ' done' : ''}`}>
            <div className="at-q-header">
              <span className="at-q-num">Q{qi + 1}</span>
              {submitted && (
                <span className={`at-q-status${isRight ? ' correct' : ' wrong'}`}>
                  {isRight ? '✓ Correct' : '✗ Wrong'}
                </span>
              )}
            </div>
            <div className="at-q-text">{q.q}</div>

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
                <span className="at-expl-icon">{isRight ? '💡' : '📖'}</span>
                <span><strong>Explanation:</strong> {q.explanation}</span>
              </div>
            )}
          </div>
        )
      })}

      {!submitted && (
        <button
          className="at-submit-btn"
          disabled={answered < questions.length}
          onClick={submit}
        >
          Submit Quiz
          <span className="at-submit-progress">
            {answered}/{questions.length} answered
          </span>
        </button>
      )}
    </div>
  )
}

// ── Topic Modal ───────────────────────────────────────────────────────────────
function TopicModal({ topic, attempts, onComplete, onClose }) {
  const [tab, setTab] = useState('learn')
  const lm   = LEVEL_META[topic.level]
  const best = bestAttempt(attempts)

  return (
    <div className="at-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="at-modal">
        {/* Modal Header */}
        <div className="at-modal-hdr" style={{ background: lm.gradient }}>
          <div className="at-modal-hdr-left">
            <span className="at-modal-big-icon">{topic.icon}</span>
            <div>
              <div className="at-modal-level-tag">{lm.icon} {topic.level} · {topic.quiz.length} questions</div>
              <div className="at-modal-title">{topic.title}</div>
              {best && (
                <div className="at-modal-best">
                  Best score: {Math.round(best.score)}% · {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <button className="at-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="at-tabs">
          <button
            className={`at-tab${tab === 'learn' ? ' active' : ''}`}
            style={tab === 'learn' ? { borderBottomColor: lm.color, color: lm.color } : {}}
            onClick={() => setTab('learn')}
          >
            📖 Learn
          </button>
          <button
            className={`at-tab${tab === 'quiz' ? ' active' : ''}`}
            style={tab === 'quiz' ? { borderBottomColor: lm.color, color: lm.color } : {}}
            onClick={() => setTab('quiz')}
          >
            🧠 Quiz
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
  const [modal, setModal]             = useState(null)

  const recommended = getRecommendedLevel(assessmentResult)

  const filtered = useMemo(() =>
    levelFilter === 'All'
      ? aptitudeTopics
      : aptitudeTopics.filter(t => t.level === levelFilter),
    [levelFilter, aptitudeTopics]
  )

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
      {/* ── Hero Banner ── */}
      <div className="at-hero">
        {/* Decorative math symbols */}
        <div className="at-hero-symbols" aria-hidden="true">
          <span>Σ</span><span>π</span><span>∞</span><span>√</span>
          <span>÷</span><span>∧</span><span>∫</span><span>Δ</span>
          <span>%</span><span>∑</span><span>≠</span><span>∴</span>
        </div>

        <div className="at-hero-left">
          <div className="at-hero-eyebrow">🧮 Quantitative Reasoning · Logic</div>
          <div className="at-hero-title">Aptitude Training</div>
          <div className="at-hero-sub">Sharpen your maths and logical thinking skills</div>
          {assessmentResult?.level && (
            <div className="at-hero-badge" style={{ background: LEVEL_META[assessmentResult.level]?.color + '33' || '#6366f133', borderColor: LEVEL_META[assessmentResult.level]?.color + '66' || '#6366f166', color: LEVEL_META[assessmentResult.level]?.color || '#6366f1' }}>
              <span className="at-hero-badge-dot" style={{ background: LEVEL_META[assessmentResult.level]?.color || '#6366f1' }} />
              {assessmentResult.level} Level
            </div>
          )}
        </div>

        <div className="at-hero-stats">
          {[
            { val: totalTopics,    lbl: 'Topics',    icon: '📚' },
            { val: attemptedCount, lbl: 'Attempted',  icon: '✏️' },
            { val: passedCount,    lbl: 'Passed',     icon: '✅' },
            { val: assessmentResult?.level || '—', lbl: 'Your Level', icon: '🎯' },
          ].map(s => (
            <div key={s.lbl} className="at-hero-stat">
              <div className="at-hero-stat-icon">{s.icon}</div>
              <div className="at-hero-stat-val">{s.val}</div>
              <div className="at-hero-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Level Filter ── */}
      <div className="at-filter-bar">
        <button
          className={`at-filter-btn${levelFilter === 'All' ? ' active' : ''}`}
          onClick={() => setLevelFilter('All')}
        >
          All Topics
          <span className="at-filter-count">{aptitudeTopics.length}</span>
        </button>
        {LEVEL_ORDER.map(l => {
          const lm = LEVEL_META[l]
          const count = aptitudeTopics.filter(t => t.level === l).length
          return (
            <button
              key={l}
              className={`at-filter-btn${levelFilter === l ? ' active' : ''}`}
              style={levelFilter === l ? { borderColor: lm.color, color: lm.color, background: lm.light } : {}}
              onClick={() => setLevelFilter(l)}
            >
              {lm.icon} {l}
              <span className="at-filter-count">{count}</span>
              {l === recommended && <span className="at-filter-rec">★</span>}
            </button>
          )
        })}
      </div>

      {/* ── Topic Sections ── */}
      {LEVEL_ORDER.filter(l => levelFilter === 'All' || levelFilter === l).map(level => {
        const topics = filtered.filter(t => t.level === level)
        if (!topics.length) return null
        const lm = LEVEL_META[level]
        const levelPassed = topics.filter(t => {
          const b = bestAttempt(quizAttempts[t.id])
          return b && b.score >= 60
        }).length

        return (
          <div key={level} className="at-section">
            {/* Section header */}
            <div className="at-section-hdr">
              <div className="at-section-hdr-left">
                <div className="at-section-accent" style={{ background: lm.gradient }} />
                <div>
                  <div className="at-section-title">
                    {lm.icon} {level}
                    {level === recommended && (
                      <span className="at-section-rec-tag" style={{ background: lm.light, color: lm.color, borderColor: lm.border }}>
                        ⭐ Recommended for you
                      </span>
                    )}
                  </div>
                  <div className="at-section-meta" style={{ color: lm.color }}>
                    {lm.label} · {topics.length} topics · {levelPassed} passed
                  </div>
                </div>
              </div>
              <div className="at-section-progress-ring">
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="17" fill="none" stroke={lm.border} strokeWidth="4"/>
                  <circle cx="22" cy="22" r="17" fill="none" stroke={lm.color} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 17 * (topics.length ? levelPassed / topics.length : 0) * 100 / 100} ${2 * Math.PI * 17}`}
                    strokeLinecap="round" transform="rotate(-90 22 22)"
                    style={{ transition: 'stroke-dasharray .8s ease' }}
                  />
                </svg>
                <span className="at-section-ring-pct" style={{ color: lm.color }}>
                  {topics.length ? Math.round((levelPassed / topics.length) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Cards grid */}
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

      {/* ── Modal ── */}
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
