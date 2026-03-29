import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'

const LEVEL_ORDER      = ['Rookie', 'Explorer', 'Coder', 'Master']
const NEXT_LEVEL_COLOR = { Explorer: '#6366f1', Coder: '#f59e0b', Master: '#ef4444' }
const LEVEL_MAP        = { Rookie: 'beginner', Explorer: 'beginnerPlus', Coder: 'intermediate', Master: 'advanced' }
const LEVEL_COLOR      = { beginner: '#6366f1', beginnerPlus: '#8b5cf6', intermediate: '#f59e0b', advanced: '#ef4444' }

const PHASES = [
  { icon: '🚀', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', accent: '#6366f1' },
  { icon: '⚡', gradient: 'linear-gradient(135deg,#3730a3,#4f46e5)', accent: '#4f46e5' },
  { icon: '🌊', gradient: 'linear-gradient(135deg,#0e7490,#06b6d4)', accent: '#06b6d4' },
  { icon: '🔥', gradient: 'linear-gradient(135deg,#b45309,#f59e0b)', accent: '#f59e0b' },
  { icon: '🌟', gradient: 'linear-gradient(135deg,#7e22ce,#a855f7)', accent: '#a855f7' },
]

function topicType(topic) {
  if (topic.quiz?.length > 0 && topic.resources?.length > 0) return { label: 'Quiz + Video', icon: '🎯', color: '#8b5cf6' }
  if (topic.quiz?.length > 0) return { label: `${topic.quiz.length}Q Quiz`, icon: '📝', color: '#6366f1' }
  if (topic.resources?.length > 0) return { label: 'Video', icon: '▶', color: '#ef4444' }
  return { label: 'Read', icon: '📖', color: '#6366f1' }
}

function ProgressRing({ pct, color, size = 56 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${circ * pct / 100} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 11, fontWeight: 800, fill: '#fff' }}>
        {pct}%
      </text>
    </svg>
  )
}

function TopicRow({ topic, idx, isDone, isCurrent, canOpen, accent, onClick }) {
  const type  = topicType(topic)
  const state = isDone ? 'done' : isCurrent ? 'current' : canOpen ? 'open' : 'locked'

  return (
    <div className={`rm-topic-row rm-topic-${state}`} onClick={() => canOpen && onClick(topic)}>
      {isCurrent && <div className="rm-topic-pulse" style={{ borderColor: accent }} />}

      <div className="rm-topic-num" style={{
        background: isDone ? '#6366f1' : isCurrent ? accent : canOpen ? accent + '33' : '#334155',
        color: isDone || isCurrent ? '#fff' : canOpen ? accent : '#64748b',
      }}>
        {isDone ? '✓' : !canOpen ? '🔒' : isCurrent ? '▶' : idx + 1}
      </div>

      <div className="rm-topic-body">
        <div className="rm-topic-name">{topic.name}</div>
        <div className="rm-topic-meta">
          <span className="rm-topic-type-chip" style={{ color: type.color, background: type.color + '18' }}>
            {type.icon} {type.label}
          </span>
          <span className={`rm-topic-xp${isDone ? ' done' : ''}`}>
            {isDone ? '✓ +8 XP earned' : '+8 XP'}
          </span>
        </div>
      </div>

      <div className="rm-topic-action">
        {isDone && <span className="rm-done-tag">Done</span>}
        {isCurrent && <span className="rm-play-tag" style={{ background: accent }}>▶ Start</span>}
        {!isDone && !isCurrent && canOpen && <span className="rm-open-tag">Open →</span>}
      </div>
    </div>
  )
}

export default function Roadmap() {
  const navigate  = useNavigate()
  const { progress, assessmentResult, levelUp } = useApp()
  const { roadmapPhases: roadmapByLevel } = useContent()

  const levelKey      = assessmentResult?.level ? (LEVEL_MAP[assessmentResult.level] || 'beginner') : null
  const roadmapPhases = levelKey ? (roadmapByLevel[levelKey] || []) : []
  const [openPhase, setOpenPhase] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const TOTAL_TOPICS   = roadmapPhases.reduce((a, p) => a + p.topics.length, 0)
  const completedCount = progress.completedTopics?.length ?? 0
  const phaseDone      = roadmapPhases.filter(p => p.topics.every(t => progress.completedTopics?.includes(t.id))).length
  const totalXP        = completedCount * 8
  const overallPct     = TOTAL_TOPICS ? Math.round((completedCount / TOTAL_TOPICS) * 100) : 0
  const currentLevel   = assessmentResult?.level
  const nextLevel      = LEVEL_ORDER[LEVEL_ORDER.indexOf(currentLevel) + 1] ?? null
  const isComplete     = TOTAL_TOPICS > 0 && completedCount >= TOTAL_TOPICS
  const lvColor        = LEVEL_COLOR[levelKey] || '#6366f1'

  const getPhaseStatus = (phase, idx) => {
    if (phase.topics.every(t => progress.completedTopics?.includes(t.id))) return 'completed'
    if (idx === 0) return 'active'
    const prevDone = roadmapPhases.slice(0, idx).every(p =>
      p.topics.every(t => progress.completedTopics?.includes(t.id))
    )
    return prevDone ? 'active' : 'locked'
  }

  return (
    <div className="rm-root">

      {/* ── Hero Banner ── */}
      <div className="rm-hero">
        <div className="rm-hero-left">
          <div className="rm-hero-eyebrow">🗺️ Learning Path</div>
          <div className="rm-hero-title">Learning Roadmap</div>
          {assessmentResult?.level && (
            <div className="rm-hero-badge" style={{ background: lvColor + '33', borderColor: lvColor + '66', color: lvColor }}>
              <span className="rm-hero-badge-dot" style={{ background: lvColor }} />
              {assessmentResult.level} Track
            </div>
          )}
          <div className="rm-hero-sub">Master every topic and level up your skills</div>
        </div>
        <div className="rm-hero-stats">
          {[
            { val: `${phaseDone}/${roadmapPhases.length || '—'}`, lbl: 'Phases Done' },
            { val: `${completedCount}/${TOTAL_TOPICS || '—'}`,    lbl: 'Topics Done' },
            { val: `${totalXP} XP`,                               lbl: 'XP Earned'   },
            { val: `${overallPct}%`,                              lbl: 'Complete'     },
          ].map(s => (
            <div key={s.lbl} className="rm-hero-stat">
              <div className="rm-hero-stat-val">{s.val}</div>
              <div className="rm-hero-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── No Assessment ── */}
      {!levelKey && (
        <div className="rm-no-assess">
          <div className="rm-no-assess-icon">🎯</div>
          <h3>Unlock Your Roadmap</h3>
          <p>Take the assessment to get a personalized learning path tailored to your level.</p>
          <a href="/assessment" className="rm-assess-btn">Start Assessment →</a>
        </div>
      )}

      {/* ── Phase Cards ── */}
      {levelKey && roadmapPhases.length > 0 && (
        <div className="rm-phases">
          {roadmapPhases.map((phase, idx) => {
            const status   = getPhaseStatus(phase, idx)
            const ph       = PHASES[idx % PHASES.length]
            const done     = phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length
            const total    = phase.topics.length
            const pct      = total ? Math.round((done / total) * 100) : 0
            const isOpen   = openPhase === idx
            const isLocked = status === 'locked'
            const isDone   = status === 'completed'

            return (
              <div key={phase.id} className={`rm-phase${isLocked ? ' locked' : ''}${isDone ? ' done' : ''}`}>

                {/* Phase Header */}
                <div
                  className="rm-phase-header"
                  style={{ '--ph-gradient': ph.gradient, '--ph-accent': ph.accent }}
                  onClick={() => !isLocked && setOpenPhase(isOpen ? -1 : idx)}
                >
                  {isLocked && <div className="rm-phase-lock-veil" />}

                  <div className="rm-phase-icon-wrap" style={{ background: isLocked ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.18)' }}>
                    {isDone ? '✓' : isLocked ? '🔒' : ph.icon}
                  </div>

                  <div className="rm-phase-info">
                    <div className="rm-phase-label">Phase {idx + 1}</div>
                    <div className="rm-phase-title">{phase.title}</div>
                    <div className="rm-phase-meta">
                      {isLocked
                        ? '🔒 Complete previous phase to unlock'
                        : `${phase.duration} · ${done}/${total} topics`}
                    </div>
                  </div>

                  <div className="rm-phase-right">
                    {!isLocked && <ProgressRing pct={pct} color={isDone ? '#22c55e' : ph.accent} size={52} />}
                    {isDone && <span className="rm-phase-badge-done">🏆 Done</span>}
                    {status === 'active' && !isDone && <span className="rm-phase-badge-active">In Progress</span>}
                    {!isLocked && (
                      <svg className={`rm-chevron${isOpen ? ' open' : ''}`} width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4.5 7l4.5 4.5L13.5 7" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* Thin progress bar */}
                {!isLocked && (
                  <div className="rm-phase-progbar">
                    <div className="rm-phase-progfill" style={{ width: `${pct}%`, background: ph.gradient }} />
                  </div>
                )}

                {/* Topic List */}
                {isOpen && !isLocked && (
                  <div className="rm-topics-list">
                    {phase.topics.map((topic, ti) => {
                      const isDoneTopic = progress.completedTopics?.includes(topic.id)
                      const prevDone    = phase.topics.slice(0, ti).every(t => progress.completedTopics?.includes(t.id))
                      const isCurrent   = !isDoneTopic && prevDone && status !== 'locked'
                      return (
                        <TopicRow
                          key={topic.id}
                          topic={topic}
                          idx={ti}
                          isDone={isDoneTopic}
                          isCurrent={isCurrent}
                          canOpen={status !== 'locked'}
                          accent={ph.accent}
                          onClick={() => navigate(`/roadmap/topic/${topic.id}`)}
                        />
                      )
                    })}

                    {isDone && (
                      <div className="rm-phase-cleared">
                        🏆 Phase Complete! You earned <strong>{total * 8} XP</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Roadmap Complete ── */}
      {isComplete && (
        <div className="rm-complete">
          <div className="rm-complete-bg" />
          <div className="rm-complete-inner">
            <div className="rm-complete-trophy">🏆</div>
            <h2 className="rm-complete-title">Roadmap Complete!</h2>
            <p className="rm-complete-sub">
              You mastered all <strong>{TOTAL_TOPICS} topics</strong> on the <strong>{currentLevel}</strong> track!
            </p>
            <div className="rm-complete-stats">
              {[
                { v: phaseDone,    l: 'Phases Cleared', e: '🎯' },
                { v: TOTAL_TOPICS, l: 'Topics Done',    e: '📚' },
                { v: `${totalXP}`, l: 'XP Earned',      e: '⚡' },
              ].map(s => (
                <div key={s.l} className="rm-complete-stat">
                  <div className="rm-cs-e">{s.e}</div>
                  <div className="rm-cs-v">{s.v}</div>
                  <div className="rm-cs-l">{s.l}</div>
                </div>
              ))}
            </div>
            {nextLevel ? (
              <button className="rm-levelup-btn" onClick={() => setShowLevelUp(true)}>
                🚀 Level Up to {nextLevel} Track
              </button>
            ) : (
              <div className="rm-mastered">🎓 You've mastered all levels — Legend!</div>
            )}
          </div>
        </div>
      )}

      {/* ── Level Up Modal ── */}
      {showLevelUp && nextLevel && (
        <div className="rm-modal-overlay" onClick={() => setShowLevelUp(false)}>
          <div className="rm-modal" onClick={e => e.stopPropagation()}>
            <div className="rm-modal-icon">🚀</div>
            <h3 className="rm-modal-title">Level Up to {nextLevel}?</h3>
            <p className="rm-modal-body">
              Your roadmap resets for the <strong>{nextLevel}</strong> track.
              All XP, solved problems, and streaks carry over.
              Bonus: <strong>+50 XP!</strong>
            </p>
            <div className="rm-modal-btns">
              <button className="rm-modal-cancel" onClick={() => setShowLevelUp(false)}>
                Stay on {currentLevel}
              </button>
              <button
                className="rm-modal-confirm"
                style={{ background: NEXT_LEVEL_COLOR[nextLevel] ?? '#6366f1' }}
                onClick={() => { levelUp(); setShowLevelUp(false) }}
              >
                Yes, Level Up! +50 XP
              </button>
            </div>
          </div>
        </div>
      )}

      {levelKey && roadmapPhases.length === 0 && (
        <div className="rm-empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Coming soon!</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            The <strong>{assessmentResult.level}</strong> track is being built. Check back soon!
          </div>
        </div>
      )}

    </div>
  )
}
