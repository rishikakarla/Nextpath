import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { LEVEL_ORDER, getRecommendedLevel } from '../data/aptitudeData'

function bestAttempt(attempts = []) {
  if (!attempts.length) return null
  return attempts.reduce((best, a) => (a.score > (best?.score ?? -1) ? a : best), null)
}

const LEVEL_META = {
  Rookie: { color: '#10b981', light: '#d1fae5', border: '#6ee7b7', label: 'Beginner',     icon: '🟢', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,.4)' },
  Coder:  { color: '#6366f1', light: '#eef2ff', border: '#a5b4fc', label: 'Intermediate', icon: '🔷', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', glow: 'rgba(99,102,241,.4)' },
  Master: { color: '#ef4444', light: '#fef2f2', border: '#fca5a5', label: 'Advanced',     icon: '🔴', gradient: 'linear-gradient(135deg,#ef4444,#f59e0b)', glow: 'rgba(239,68,68,.4)' },
}

function starsFromPct(pct) {
  if (pct >= 80) return 3
  if (pct >= 60) return 2
  if (pct >= 40) return 1
  return 0
}

// ── Topic Card ────────────────────────────────────────────────────────────────
function TopicCard({ topic, attempts, recommended, onClick }) {
  const best   = bestAttempt(attempts)
  const pct    = best ? Math.round(best.score) : null
  const solved = pct !== null && pct >= 60
  const stars  = pct !== null ? starsFromPct(pct) : null
  const lm     = LEVEL_META[topic.level]
  const maxXP  = topic.quiz.length * 10

  return (
    <div
      className={`at-card${solved ? ' at-card-done' : ''}${recommended ? ' at-card-rec' : ''}`}
      onClick={() => onClick(topic)}
      style={solved ? { '--glow': lm.glow } : {}}
    >
      {recommended && <div className="at-rec-ribbon">⭐ Recommended</div>}

      <div className="at-card-header" style={{ background: lm.gradient }}>
        <span className="at-card-big-icon">{topic.icon}</span>
        <div className="at-card-header-badges">
          <span className="at-card-xp-badge">⚡ +{maxXP} XP</span>
          {solved && <div className="at-card-solved-ring">✓</div>}
        </div>
      </div>

      <div className="at-card-body">
        <div className="at-card-title">{topic.title}</div>
        <div className="at-card-desc">{topic.description}</div>

        <div className="at-card-footer">
          <span className="at-card-qcount">📝 {topic.quiz.length} Qs</span>
          {stars !== null ? (
            <span className="at-card-stars">
              {[0, 1, 2].map(i => (
                <span key={i} className={`at-star${i < stars ? ' filled' : ''}`}>★</span>
              ))}
            </span>
          ) : (
            <span className="at-score-pill untried">Not tried</span>
          )}
        </div>

        {pct !== null && (
          <div className="at-card-bar">
            <div className="at-card-bar-fill" style={{ width: pct + '%', background: solved ? lm.color : '#f59e0b' }} />
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
      <div className="at-learn-header">
        <span className="at-learn-header-icon">{topic.icon}</span>
        <div className="at-learn-header-text">
          <div className="at-learn-header-title">{topic.title}</div>
          <div className="at-learn-header-sub">{topic.description}</div>
        </div>
        <span className="at-learn-header-count">📖 {topic.module.concepts.length} concepts</span>
      </div>
      {topic.module.concepts.map((c, i) => (
        <div key={i} className="at-concept-block">
          <div className="at-concept-num"><span>{i + 1}</span></div>
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
  const questions = topic.quiz
  const [current,   setCurrent]   = useState(0)
  const [answers,   setAnswers]   = useState({})
  const [revealed,  setRevealed]  = useState(false)
  const [finished,  setFinished]  = useState(false)
  const [score,     setScore]     = useState(null)
  const [streak,    setStreak]    = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [xpEarned,  setXpEarned]  = useState(0)
  const [xpPopup,   setXpPopup]   = useState(null)

  const q      = questions[current]
  const chosen = answers[current]
  const isLast = current === questions.length - 1
  const isRight = revealed && chosen === q.answer

  const pick = (oi) => {
    if (revealed) return
    setAnswers(a => ({ ...a, [current]: oi }))
  }

  const handleSubmitQ = () => {
    if (chosen === undefined) return
    setRevealed(true)
    const correct = chosen === q.answer
    if (correct) {
      const newStreak = streak + 1
      const bonus = Math.min(newStreak - 1, 5) * 2
      const xp = 10 + bonus
      setStreak(newStreak)
      setMaxStreak(s => Math.max(s, newStreak))
      setXpEarned(x => x + xp)
      setXpPopup({ amount: xp, key: Date.now() })
    } else {
      setStreak(0)
    }
  }

  const handleNext = () => {
    setRevealed(false)
    if (isLast) {
      let correct = 0
      const fa = { ...answers }
      questions.forEach((q, i) => { if (fa[i] === q.answer) correct++ })
      const pct = Math.round((correct / questions.length) * 100)
      const finalScore = { correct, total: questions.length, pct, xpEarned, maxStreak }
      setScore(finalScore)
      setFinished(true)
      onComplete({ score: pct, correct, total: questions.length, date: new Date().toISOString() })
    } else {
      setCurrent(c => c + 1)
    }
  }

  const reset = () => {
    setCurrent(0); setAnswers({}); setRevealed(false); setFinished(false); setScore(null)
    setStreak(0); setMaxStreak(0); setXpEarned(0); setXpPopup(null)
  }

  if (finished && score) {
    const stars = starsFromPct(score.pct)
    return (
      <div className="at-quiz-result">
        <div className="at-result-trophy">
          {score.pct >= 80 ? '🏆' : score.pct >= 60 ? '🎖️' : '📚'}
        </div>
        <div className="at-result-stars">
          {[0, 1, 2].map(i => (
            <span key={i} className={`at-result-star${i < stars ? ' lit' : ''}`}>★</span>
          ))}
        </div>
        <div className={`at-result-circle${score.pct >= 60 ? ' pass' : ' fail'}`}>
          <div className="at-result-pct">{score.pct}%</div>
          <div className="at-result-label">
            {score.pct >= 80 ? 'Excellent!' : score.pct >= 60 ? 'Passed!' : 'Keep going'}
          </div>
        </div>
        <div className="at-result-xp-earned">⚡ +{score.xpEarned} XP earned</div>
        <div className="at-result-stats">
          <div className="at-result-stat">
            <span className="at-result-stat-val" style={{ color: '#10b981' }}>{score.correct}</span>
            <span className="at-result-stat-lbl">Correct</span>
          </div>
          <div className="at-result-stat">
            <span className="at-result-stat-val" style={{ color: '#ef4444' }}>{score.total - score.correct}</span>
            <span className="at-result-stat-lbl">Wrong</span>
          </div>
          <div className="at-result-stat">
            <span className="at-result-stat-val" style={{ color: '#f59e0b' }}>{score.maxStreak}</span>
            <span className="at-result-stat-lbl">🔥 Best Streak</span>
          </div>
        </div>
        <button className="at-quiz-btn primary" onClick={reset}>🔄 Try Again</button>
      </div>
    )
  }

  return (
    <div className="at-quiz-single">
      {/* Step dots + progress bar */}
      <div className="at-qprog-wrap">
        <div className="at-qprog-bar">
          <div className="at-qprog-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
        </div>
        <div className="at-qprog-steps">
          {questions.map((_, i) => (
            <div key={i} className={`at-qprog-dot${i < current ? ' done' : i === current ? ' active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Counter row */}
      <div className="at-q-counter">
        <span className="at-q-counter-num">
          <span className="at-q-counter-cur">{current + 1}</span>
          <span className="at-q-counter-sep"> / {questions.length}</span>
        </span>
        <div className="at-q-header-right">
          {streak >= 2 && !revealed && (
            <span className="at-streak-badge">🔥 {streak} Streak!</span>
          )}
          {revealed && (
            <span className={`at-q-status${isRight ? ' correct' : ' wrong'}`}>
              {isRight ? '✓ Correct!' : '✗ Wrong'}
            </span>
          )}
        </div>
      </div>

      {/* XP popup */}
      {xpPopup && (
        <div key={xpPopup.key} className="at-xp-popup">+{xpPopup.amount} XP ⚡</div>
      )}

      {/* Question */}
      <div className={`at-q-text-lg${revealed ? (isRight ? ' q-correct' : ' q-wrong') : ''}`}>
        {q.q}
      </div>

      {/* Options */}
      <div className="at-options-single">
        {q.options.map((opt, oi) => {
          let cls = 'at-option-single'
          if (revealed) {
            if (oi === q.answer)       cls += ' correct'
            else if (oi === chosen)    cls += ' wrong'
          } else if (chosen === oi) {
            cls += ' selected'
          }
          return (
            <button key={oi} className={cls} onClick={() => pick(oi)} disabled={revealed}>
              <span className="at-opt-letter">{String.fromCharCode(65 + oi)}</span>
              <span className="at-opt-text">{opt}</span>
              {revealed && oi === q.answer && <span className="at-opt-check">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && q.explanation && (
        <div className="at-explanation-single">
          <span className="at-expl-icon">{isRight ? '💡' : '📖'}</span>
          <span><strong>Explanation:</strong> {q.explanation}</span>
        </div>
      )}

      {/* Actions */}
      <div className="at-quiz-actions">
        {!revealed ? (
          <button className="at-quiz-btn primary" disabled={chosen === undefined} onClick={handleSubmitQ}>
            Submit Answer
          </button>
        ) : (
          <button className="at-quiz-btn primary" onClick={handleNext}>
            {isLast ? '🏁 Finish Quiz' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Topic Full Page ───────────────────────────────────────────────────────────
function TopicModal({ topic, attempts, onComplete, onClose }) {
  const [tab, setTab] = useState('learn')
  const lm   = LEVEL_META[topic.level]
  const best = bestAttempt(attempts)
  const stars = best ? starsFromPct(Math.round(best.score)) : null

  return (
    <div className="at-fullpage">
      <div className="at-fullpage-topbar" style={{ background: lm.gradient }}>
        <div className="at-fullpage-topbar-left">
          <button className="at-back-btn" onClick={onClose}>← Back</button>
          <span className="at-fullpage-icon">{topic.icon}</span>
          <div>
            <div className="at-fullpage-level">{lm.icon} {topic.level}</div>
            <div className="at-fullpage-title">{topic.title}</div>
          </div>
          {best && (
            <div className="at-fullpage-best-wrap">
              <div className="at-fullpage-best">Best: {Math.round(best.score)}%</div>
              <div className="at-fullpage-best-stars">
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ color: i < stars ? '#fbbf24' : 'rgba(255,255,255,.3)', fontSize: 14 }}>★</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="at-fullpage-tabs">
          <button className={`at-fullpage-tab${tab === 'learn' ? ' active' : ''}`} onClick={() => setTab('learn')}>
            📖 Learn
          </button>
          <button className={`at-fullpage-tab${tab === 'quiz' ? ' active' : ''}`} onClick={() => setTab('quiz')}>
            🧠 Quiz · {topic.quiz.length} Qs
          </button>
        </div>
      </div>

      <div className="at-fullpage-body">
        {tab === 'learn'
          ? <LearnTab topic={topic} />
          : <QuizTab topic={topic} onComplete={onComplete} />
        }
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
  const totalXP = aptitudeTopics.reduce((acc, t) => {
    const b = bestAttempt(quizAttempts[t.id])
    return acc + (b ? Math.round(b.score / 100 * t.quiz.length * 10) : 0)
  }, 0)

  const handleComplete = (attempt) => {
    if (modal) saveQuizAttempt(modal.id, attempt)
  }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="at-hero">
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
            <div className="at-hero-badge"
              style={{
                background: (LEVEL_META[assessmentResult.level]?.color || '#6366f1') + '33',
                borderColor: (LEVEL_META[assessmentResult.level]?.color || '#6366f1') + '66',
                color: LEVEL_META[assessmentResult.level]?.color || '#6366f1',
              }}
            >
              <span className="at-hero-badge-dot" style={{ background: LEVEL_META[assessmentResult.level]?.color || '#6366f1' }} />
              {assessmentResult.level} Level
            </div>
          )}
          <div className="at-hero-xp-bar">
            <div className="at-hero-xp-label">
              <span>⚡ Total XP</span>
              <span className="at-hero-xp-val">{totalXP} XP</span>
            </div>
            <div className="at-hero-xp-track">
              <div className="at-hero-xp-fill" style={{ width: `${Math.min(100, totalTopics ? (totalXP / (totalTopics * 100)) * 100 : 0)}%` }} />
            </div>
          </div>
        </div>

        <div className="at-hero-stats">
          {[
            { val: totalTopics,    lbl: 'Topics',   icon: '📚', color: '#818cf8' },
            { val: attemptedCount, lbl: 'Attempted', icon: '✏️', color: '#fbbf24' },
            { val: passedCount,    lbl: 'Passed',    icon: '🏆', color: '#34d399' },
            { val: `${totalXP}`,   lbl: 'Total XP',  icon: '⚡', color: '#c084fc' },
          ].map(s => (
            <div key={s.lbl} className="at-hero-stat">
              <div className="at-hero-stat-icon">{s.icon}</div>
              <div className="at-hero-stat-val" style={{ color: s.color }}>{s.val}</div>
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
          All Topics <span className="at-filter-count">{aptitudeTopics.length}</span>
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
              {lm.icon} {l} <span className="at-filter-count">{count}</span>
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
                    strokeDasharray={`${2 * Math.PI * 17 * (topics.length ? levelPassed / topics.length : 0)} ${2 * Math.PI * 17}`}
                    strokeLinecap="round" transform="rotate(-90 22 22)"
                    style={{ transition: 'stroke-dasharray .8s ease' }}
                  />
                </svg>
                <span className="at-section-ring-pct" style={{ color: lm.color }}>
                  {topics.length ? Math.round((levelPassed / topics.length) * 100) : 0}%
                </span>
              </div>
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
