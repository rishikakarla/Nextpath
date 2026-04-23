import { useState, useMemo, useRef } from 'react'
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
function getYTId(url = '') {
  const m = url.match(/[?&]v=([^&]{11})/) || url.match(/youtu\.be\/([^?]{11})/)
  return m ? m[1] : null
}

function LearnTab({ topic }) {
  const m = topic.module
  const secRef = useRef({})
  const [active, setActive] = useState('overview')

  const hasFormulas  = m.formulas?.length > 0
  const hasTips      = m.tips?.length > 0
  const hasShortcuts = m.shortcuts?.length > 0
  const hasSteps     = m.howToSolve?.length > 0
  const hasConcepts  = m.concepts?.length > 0
  const hasVideos    = m.videos?.length > 0

  const navItems = [
    { key: 'overview',  icon: '📘', label: 'Overview' },
    hasConcepts  && { key: 'concepts',  icon: '📖', label: 'Concepts',   count: m.concepts.length },
    hasFormulas  && { key: 'formulas',  icon: '🧮', label: 'Formulas',   count: m.formulas.length },
    hasTips      && { key: 'tips',      icon: '💡', label: 'Tips',       count: m.tips.length },
    hasShortcuts && { key: 'shortcuts', icon: '⚡', label: 'Shortcuts',  count: m.shortcuts.length },
    hasSteps     && { key: 'steps',     icon: '🎯', label: 'Steps' },
    hasVideos    && { key: 'videos',    icon: '▶️', label: 'Videos',     count: m.videos.length },
  ].filter(Boolean)

  const scrollTo = key => {
    secRef.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(key)
  }

  const statItems = [
    hasFormulas  && { icon: '🧮', val: m.formulas.length,   lbl: 'Formulas' },
    hasTips      && { icon: '💡', val: m.tips.length,       lbl: 'Tips' },
    hasShortcuts && { icon: '⚡', val: m.shortcuts.length,  lbl: 'Shortcuts' },
    hasSteps     && { icon: '🎯', val: m.howToSolve.length, lbl: 'Steps' },
    hasConcepts  && { icon: '📖', val: m.concepts.length,   lbl: 'Concepts' },
    hasVideos    && { icon: '▶️', val: m.videos.length,     lbl: 'Videos' },
  ].filter(Boolean)

  return (
    <div className="al-wrap">

      {/* ── Sticky section nav ── */}
      <div className="al-nav">
        {navItems.map(n => (
          <button key={n.key} className={`al-nav-pill${active === n.key ? ' active' : ''}`} onClick={() => scrollTo(n.key)}>
            <span className="al-nav-icon">{n.icon}</span>
            <span className="al-nav-label">{n.label}</span>
            {n.count != null && <span className="al-nav-badge">{n.count}</span>}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      <div ref={el => secRef.current.overview = el} className="al-section">
        <div className="al-sec-hdr" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <span className="al-sec-icon">📘</span>
          <span className="al-sec-title">Overview</span>
        </div>
        <div className="al-overview-body">
          <p className="al-overview-text">{m.description}</p>
          {statItems.length > 0 && (
            <div className="al-stats-row">
              {statItems.map((st, i) => (
                <button key={i} className="al-stat-chip" onClick={() => scrollTo(
                  st.lbl === 'Formulas' ? 'formulas' : st.lbl === 'Tips' ? 'tips' :
                  st.lbl === 'Shortcuts' ? 'shortcuts' : st.lbl === 'Steps' ? 'steps' :
                  st.lbl === 'Concepts' ? 'concepts' : 'videos'
                )}>
                  <span className="al-stat-icon">{st.icon}</span>
                  <span className="al-stat-val">{st.val}</span>
                  <span className="al-stat-lbl">{st.lbl}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Concepts (admin-uploaded topics) ── */}
      {hasConcepts && (
        <div ref={el => secRef.current.concepts = el} className="al-section">
          <div className="al-sec-hdr" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
            <span className="al-sec-icon">📖</span>
            <span className="al-sec-title">Concepts</span>
            <span className="al-sec-count">{m.concepts.length}</span>
          </div>
          <div className="al-concepts-list">
            {m.concepts.map((c, i) => (
              <div key={i} className="al-concept-card">
                <div className="al-concept-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="al-concept-body">
                  {c.heading && <div className="al-concept-heading">{c.heading}</div>}
                  <p className="al-concept-text" style={{ whiteSpace: 'pre-wrap' }}>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Formulas ── */}
      {hasFormulas && (
        <div ref={el => secRef.current.formulas = el} className="al-section">
          <div className="al-sec-hdr" style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
            <span className="al-sec-icon">🧮</span>
            <span className="al-sec-title">Formulas</span>
            <span className="al-sec-count">{m.formulas.length}</span>
          </div>
          <div className="al-formulas-grid">
            {m.formulas.map((f, i) => (
              <div key={i} className="al-formula-card">
                <div className="al-formula-top">
                  <span className="al-formula-index">#{i + 1}</span>
                  <span className="al-formula-label">{f.label}</span>
                </div>
                <div className="al-formula-value">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tips & Tricks ── */}
      {hasTips && (
        <div ref={el => secRef.current.tips = el} className="al-section">
          <div className="al-sec-hdr" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
            <span className="al-sec-icon">💡</span>
            <span className="al-sec-title">Tips & Tricks</span>
            <span className="al-sec-count">{m.tips.length}</span>
          </div>
          <div className="al-tips-list">
            {m.tips.map((tip, i) => (
              <div key={i} className="al-tip-card">
                <div className="al-tip-num">{String(i + 1).padStart(2, '0')}</div>
                <span className="al-tip-bulb">💡</span>
                <p className="al-tip-text">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Shortcuts ── */}
      {hasShortcuts && (
        <div ref={el => secRef.current.shortcuts = el} className="al-section">
          <div className="al-sec-hdr" style={{ background: 'linear-gradient(135deg,#10b981,#0ea5e9)' }}>
            <span className="al-sec-icon">⚡</span>
            <span className="al-sec-title">Shortcuts</span>
            <span className="al-sec-count">{m.shortcuts.length}</span>
          </div>
          <div className="al-shortcuts-list">
            {m.shortcuts.map((sc, i) => (
              <div key={i} className="al-shortcut-card">
                <div className="al-shortcut-badge">
                  <span>⚡</span><span>{i + 1}</span>
                </div>
                <p className="al-shortcut-text">{sc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── How to Solve — timeline ── */}
      {hasSteps && (
        <div ref={el => secRef.current.steps = el} className="al-section">
          <div className="al-sec-hdr" style={{ background: 'linear-gradient(135deg,#ef4444,#f59e0b)' }}>
            <span className="al-sec-icon">🎯</span>
            <span className="al-sec-title">How to Solve</span>
            <span className="al-sec-count">{m.howToSolve.length} steps</span>
          </div>
          <div className="al-timeline">
            {m.howToSolve.map((step, i) => {
              const text = step.replace(/^Step\s+\d+:\s*/i, '')
              const isLast = i === m.howToSolve.length - 1
              return (
                <div key={i} className="al-timeline-row">
                  <div className="al-timeline-spine">
                    <div className="al-timeline-dot">{i + 1}</div>
                    {!isLast && <div className="al-timeline-connector" />}
                  </div>
                  <div className={`al-timeline-card${isLast ? ' al-timeline-card--last' : ''}`}>
                    <div className="al-timeline-step-tag">Step {i + 1}</div>
                    <p className="al-timeline-text">{text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Video Resources ── */}
      {hasVideos && (
        <div ref={el => secRef.current.videos = el} className="al-section">
          <div className="al-sec-hdr" style={{ background: 'linear-gradient(135deg,#ff0000,#ff6b35)' }}>
            <span className="al-sec-icon">▶️</span>
            <span className="al-sec-title">Video Resources</span>
            <span className="al-sec-count">{m.videos.length}</span>
          </div>
          <div className="al-videos-grid">
            {m.videos.map((vid, i) => {
              const ytId = getYTId(vid.url)
              return (
                <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" className="al-video-card">
                  <div className="al-video-thumb">
                    {ytId
                      ? <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={vid.title} className="al-video-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                      : null
                    }
                    <div className="al-video-fallback" style={{ display: ytId ? 'none' : 'flex' }}>▶</div>
                    <div className="al-video-overlay">▶ Watch</div>
                  </div>
                  <div className="al-video-info">
                    <div className="al-video-title">{vid.title}</div>
                    <div className="al-video-meta">
                      {vid.channel && <span className="al-video-channel">📺 {vid.channel}</span>}
                      {vid.duration && <span className="al-video-dur">⏱ {vid.duration}</span>}
                    </div>
                    <div className="al-video-cta">Watch on YouTube ↗</div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
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
    <div className="at-quiz-game">
      {/* Top bar: progress + counter + streak */}
      <div className="at-game-topbar">
        <div className="at-game-counter">
          <span className="at-game-counter-cur">{current + 1}</span>
          <span className="at-game-counter-sep"> / {questions.length}</span>
        </div>
        <div className="at-game-prog-bar">
          <div className="at-game-prog-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
        </div>
        <div className="at-game-right">
          {streak >= 2 && !revealed && (
            <span className="at-streak-badge">🔥 {streak}</span>
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

      {/* Question hexagon */}
      <div className="at-game-q-wrap">
        <div className={`at-game-qbox${revealed ? (isRight ? ' correct' : ' wrong') : ''}`}>
          {q.q}
        </div>
      </div>

      {/* Options 2×2 grid */}
      <div className="at-game-options">
        {q.options.map((opt, oi) => {
          let state = ''
          if (revealed) {
            if (oi === q.answer)    state = ' correct'
            else if (oi === chosen) state = ' wrong'
          } else if (chosen === oi) {
            state = ' selected'
          }
          return (
            <div key={oi} className={`at-game-opt-wrap${state}`}>
              <button className={`at-game-opt${state}`} onClick={() => pick(oi)} disabled={revealed}>
                <span className="at-game-opt-letter">{String.fromCharCode(65 + oi)}:</span>
                <span className="at-game-opt-text">{opt}</span>
                {revealed && oi === q.answer && <span className="at-game-opt-check">✓</span>}
              </button>
            </div>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && q.explanation && (
        <div className="at-game-explanation">
          <span className="at-expl-icon">{isRight ? '💡' : '📖'}</span>
          <span><strong>Explanation:</strong> {q.explanation}</span>
        </div>
      )}

      {/* Action button */}
      <div className="at-game-actions">
        {!revealed ? (
          <button className="at-game-btn" disabled={chosen === undefined} onClick={handleSubmitQ}>
            Confirm Answer
          </button>
        ) : (
          <button className="at-game-btn active" onClick={handleNext}>
            {isLast ? '🏁 See Results' : 'Next Question →'}
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

      <div className={`at-fullpage-body${tab === 'quiz' ? ' at-fullpage-body--quiz' : ''}`}>
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
