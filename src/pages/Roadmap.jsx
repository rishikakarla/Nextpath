import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'

const LEVEL_ORDER     = ['Rookie', 'Explorer', 'Coder', 'Master']
const NEXT_LEVEL_COLOR = { Explorer: '#6366f1', Coder: '#f59e0b', Master: '#ef4444' }
const LEVEL_MAP        = { Rookie: 'beginner', Explorer: 'beginnerPlus', Coder: 'intermediate', Master: 'advanced' }
const LEVEL_COLOR      = { beginner: '#10b981', beginnerPlus: '#6366f1', intermediate: '#f59e0b', advanced: '#ef4444' }

// World themes per phase index
const WORLDS = [
  { emoji: '🌿', name: 'World',   from: '#166534', mid: '#16a34a', to: '#4ade80', light: '#dcfce7' },
  { emoji: '⚡', name: 'World',   from: '#3730a3', mid: '#6366f1', to: '#a5b4fc', light: '#eef2ff' },
  { emoji: '🌊', name: 'World',   from: '#0e7490', mid: '#06b6d4', to: '#67e8f9', light: '#ecfeff' },
  { emoji: '🔥', name: 'World',   from: '#b45309', mid: '#f59e0b', to: '#fde68a', light: '#fffbeb' },
  { emoji: '🌟', name: 'World',   from: '#7e22ce', mid: '#a855f7', to: '#d8b4fe', light: '#faf5ff' },
]

function topicType(topic) {
  if (topic.quiz?.length > 0 && topic.resources?.length > 0) return { label: 'Quiz + Video', icon: '🎯', color: '#8b5cf6' }
  if (topic.quiz?.length > 0) return { label: `${topic.quiz.length}Q Quiz`, icon: '📝', color: '#6366f1' }
  if (topic.resources?.length > 0) return { label: 'Video', icon: '▶', color: '#ef4444' }
  return { label: 'Read', icon: '📖', color: '#10b981' }
}

function Stars({ done, total }) {
  const filled = Math.round((done / total) * 3)
  return (
    <div className="gm-stars">
      {[0,1,2].map(i => (
        <span key={i} className={`gm-star${i < filled ? ' lit' : ''}`}>★</span>
      ))}
    </div>
  )
}

function TopicNode({ topic, idx, isDone, isCurrent, canOpen, world, onClick }) {
  const type = topicType(topic)
  const state = isDone ? 'done' : isCurrent ? 'current' : canOpen ? 'open' : 'locked'

  return (
    <div className={`gm-node gm-node-${state}`} onClick={() => canOpen && onClick(topic)}>
      {/* Pulse ring on current */}
      {isCurrent && <div className="gm-pulse-ring" />}

      {/* Circle badge */}
      <div className="gm-node-badge" style={{
        background: isDone
          ? 'linear-gradient(135deg,#10b981,#34d399)'
          : isCurrent
          ? `linear-gradient(135deg,${world.mid},${world.to})`
          : canOpen
          ? `linear-gradient(135deg,${world.mid}88,${world.to}66)`
          : 'linear-gradient(135deg,#334155,#475569)',
        boxShadow: isCurrent ? `0 0 20px ${world.mid}66` : isDone ? '0 0 14px #10b98144' : 'none',
      }}>
        {isDone ? '✓' : !canOpen ? '🔒' : isCurrent ? '▶' : idx + 1}
      </div>

      {/* Content */}
      <div className="gm-node-name">{topic.name}</div>
      <div className="gm-node-row">
        <span className="gm-node-type-chip" style={{ color: type.color, background: type.color + '18' }}>
          {type.icon} {type.label}
        </span>
      </div>
      <div className={`gm-node-xp${isDone ? ' earned' : ''}`}>
        {isDone ? '✓ +8 XP' : '+8 XP'}
      </div>

      {/* Play/Done CTA */}
      {isCurrent && <div className="gm-node-play" style={{ background: `linear-gradient(135deg,${world.mid},${world.to})` }}>▶ PLAY</div>}
      {isDone && <div className="gm-node-done-tag">Completed</div>}
    </div>
  )
}

export default function Roadmap() {
  const navigate = useNavigate()
  const { progress, assessmentResult, levelUp } = useApp()
  const { roadmapPhases: roadmapByLevel } = useContent()

  const levelKey     = assessmentResult?.level ? (LEVEL_MAP[assessmentResult.level] || 'beginner') : null
  const roadmapPhases = levelKey ? (roadmapByLevel[levelKey] || []) : []
  const [openPhase, setOpenPhase] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const TOTAL_TOPICS    = roadmapPhases.reduce((a, p) => a + p.topics.length, 0)
  const completedCount  = progress.completedTopics?.length ?? 0
  const phaseDone       = roadmapPhases.filter(p => p.topics.every(t => progress.completedTopics?.includes(t.id))).length
  const totalXP         = completedCount * 8
  const overallPct      = TOTAL_TOPICS ? Math.round((completedCount / TOTAL_TOPICS) * 100) : 0
  const currentLevel    = assessmentResult?.level
  const nextLevel       = LEVEL_ORDER[LEVEL_ORDER.indexOf(currentLevel) + 1] ?? null
  const isComplete      = TOTAL_TOPICS > 0 && completedCount >= TOTAL_TOPICS
  const lvColor         = LEVEL_COLOR[levelKey] || '#6366f1'

  const getPhaseStatus = (phase, idx) => {
    if (phase.topics.every(t => progress.completedTopics?.includes(t.id))) return 'completed'
    if (idx === 0) return 'active'
    const prevDone = roadmapPhases.slice(0, idx).every(p =>
      p.topics.every(t => progress.completedTopics?.includes(t.id))
    )
    return prevDone ? 'active' : 'locked'
  }

  return (
    <div className="gm-root">

      {/* ══ HERO BANNER ════════════════════════════════════════════ */}
      <div className="gm-hero" style={{ '--lc': lvColor }}>
        {/* Stars bg decoration */}
        <div className="gm-hero-stars" />

        <div className="gm-hero-inner">
          <div className="gm-hero-left">
            <div className="gm-hero-eyebrow">🗺️ Adventure Map</div>
            <h1 className="gm-hero-title">Learning Roadmap</h1>
            {assessmentResult?.level && (
              <div className="gm-hero-level" style={{ background: lvColor + '22', borderColor: lvColor + '55', color: lvColor }}>
                <span className="gm-lvl-dot" style={{ background: lvColor }} />
                {assessmentResult.level} Track
              </div>
            )}
          </div>

          {/* XP Ring */}
          {levelKey && (
            <div className="gm-hero-ring">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8"/>
                <circle cx="48" cy="48" r="38" fill="none" stroke={lvColor} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 38 * overallPct / 100} ${2 * Math.PI * 38}`}
                  strokeLinecap="round" transform="rotate(-90 48 48)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="gm-ring-center">
                <div className="gm-ring-pct" style={{ color: lvColor }}>{overallPct}%</div>
                <div className="gm-ring-sub">done</div>
              </div>
            </div>
          )}

          {/* Stats chips */}
          {levelKey && (
            <div className="gm-hero-chips">
              {[
                { v: `${phaseDone}/${roadmapPhases.length}`, l: 'Worlds', e: '🌍' },
                { v: `${completedCount}/${TOTAL_TOPICS}`,    l: 'Levels', e: '🎮' },
                { v: `${totalXP} XP`,                        l: 'Earned',  e: '⚡' },
              ].map(c => (
                <div key={c.l} className="gm-hero-chip">
                  <span className="gm-chip-e">{c.e}</span>
                  <span className="gm-chip-v">{c.v}</span>
                  <span className="gm-chip-l">{c.l}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* XP progress bar */}
        {levelKey && (
          <div className="gm-hero-xpbar">
            <span className="gm-xp-label">Overall Progress</span>
            <div className="gm-xp-track">
              <div className="gm-xp-fill" style={{ width: `${overallPct}%`, background: lvColor }} />
            </div>
            <span className="gm-xp-pct" style={{ color: lvColor }}>{overallPct}%</span>
          </div>
        )}
      </div>

      {/* ══ NO ASSESSMENT ══════════════════════════════════════════ */}
      {!levelKey && (
        <div className="gm-no-assessment">
          <div className="gm-no-assess-icon">🎯</div>
          <h3>Unlock Your Adventure!</h3>
          <p>Take the assessment to get a personalized learning roadmap.</p>
          <a href="/assessment" className="gm-assess-btn">Start Assessment →</a>
        </div>
      )}

      {/* ══ WORLD CARDS ════════════════════════════════════════════ */}
      {levelKey && roadmapPhases.length > 0 && (
        <div className="gm-worlds">
          {roadmapPhases.map((phase, idx) => {
            const status  = getPhaseStatus(phase, idx)
            const world   = WORLDS[idx % WORLDS.length]
            const done    = phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length
            const pct     = Math.round((done / phase.topics.length) * 100)
            const isOpen  = openPhase === idx
            const isLocked = status === 'locked'
            const isDone   = status === 'completed'

            return (
              <div key={phase.id} className={`gm-world${isLocked ? ' locked' : ''}${isDone ? ' completed' : ''}`}>

                {/* World Header */}
                <div className="gm-world-header" style={{
                  background: isLocked
                    ? 'linear-gradient(135deg,#1e293b,#334155)'
                    : `linear-gradient(135deg,${world.from},${world.mid})`,
                }}
                  onClick={() => !isLocked && setOpenPhase(isOpen ? -1 : idx)}>

                  {/* Lock overlay */}
                  {isLocked && <div className="gm-world-lock-overlay" />}

                  <div className="gm-world-hdr-left">
                    <div className="gm-world-num" style={{
                      background: isLocked ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.2)'
                    }}>
                      {isDone ? '✓' : isLocked ? '🔒' : world.emoji}
                    </div>
                    <div>
                      <div className="gm-world-label">World {idx + 1}</div>
                      <div className="gm-world-title">{phase.title}</div>
                      <div className="gm-world-meta">
                        {isLocked
                          ? '🔒 Complete previous world to unlock'
                          : `${phase.duration} · ${done}/${phase.topics.length} levels`}
                      </div>
                    </div>
                  </div>

                  <div className="gm-world-hdr-right">
                    {!isLocked && <Stars done={done} total={phase.topics.length} />}
                    {isDone && <span className="gm-world-badge-done">🏆 CLEARED!</span>}
                    {status === 'active' && !isDone && (
                      <span className="gm-world-badge-active">IN PROGRESS</span>
                    )}
                    {!isLocked && (
                      <svg className={`gm-chevron${isOpen ? ' open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* Progress bar under header */}
                {!isLocked && (
                  <div className="gm-world-progbar">
                    <div className="gm-world-progfill" style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg,${world.mid},${world.to})`,
                    }} />
                  </div>
                )}

                {/* Topic Nodes (open state) */}
                {isOpen && !isLocked && (
                  <div className="gm-topics-area" style={{ '--wlight': world.light }}>
                    {/* path connector decoration */}
                    <div className="gm-path-bg" />

                    <div className="gm-nodes-grid">
                      {phase.topics.map((topic, ti) => {
                        const isDoneTopic = progress.completedTopics?.includes(topic.id)
                        const prevDone    = phase.topics.slice(0, ti).every(t => progress.completedTopics?.includes(t.id))
                        const isCurrent   = !isDoneTopic && prevDone && status !== 'locked'
                        return (
                          <TopicNode
                            key={topic.id}
                            topic={topic}
                            idx={ti}
                            isDone={isDoneTopic}
                            isCurrent={isCurrent}
                            canOpen={status !== 'locked'}
                            world={world}
                            onClick={() => navigate(`/roadmap/topic/${topic.id}`)}
                          />
                        )
                      })}
                    </div>

                    {/* World complete badge */}
                    {isDone && (
                      <div className="gm-world-cleared">
                        <span>🏆</span>
                        <span>World Cleared! You earned <strong>{phase.topics.length * 8} XP</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ══ ROADMAP COMPLETE ═══════════════════════════════════════ */}
      {isComplete && (
        <div className="gm-complete">
          <div className="gm-complete-confetti" />
          <div className="gm-complete-inner">
            <div className="gm-complete-trophy">🏆</div>
            <h2 className="gm-complete-title">Roadmap Cleared!</h2>
            <p className="gm-complete-sub">
              You conquered all <strong>{TOTAL_TOPICS} levels</strong> on the <strong>{currentLevel}</strong> track!
            </p>
            <div className="gm-complete-stats">
              {[
                { v: phaseDone,    l: 'Worlds Cleared', e: '🌍' },
                { v: TOTAL_TOPICS, l: 'Levels Done',    e: '🎮' },
                { v: `${totalXP}`, l: 'XP Earned',      e: '⚡' },
              ].map(s => (
                <div key={s.l} className="gm-complete-stat">
                  <div className="gm-cs-e">{s.e}</div>
                  <div className="gm-cs-v">{s.v}</div>
                  <div className="gm-cs-l">{s.l}</div>
                </div>
              ))}
            </div>
            {nextLevel ? (
              <button className="gm-levelup-btn" onClick={() => setShowLevelUp(true)}>
                🚀 Level Up to {nextLevel} Track
              </button>
            ) : (
              <div className="gm-mastered">🎓 You've mastered all levels! Legend!</div>
            )}
          </div>
        </div>
      )}

      {/* ══ LEVEL UP MODAL ═════════════════════════════════════════ */}
      {showLevelUp && nextLevel && (
        <div className="gm-modal-overlay" onClick={() => setShowLevelUp(false)}>
          <div className="gm-modal" onClick={e => e.stopPropagation()}>
            <div className="gm-modal-icon">🚀</div>
            <h3 className="gm-modal-title">Level Up to {nextLevel}?</h3>
            <p className="gm-modal-body">
              Your roadmap resets for the <strong>{nextLevel}</strong> track.
              Keep all XP, solved problems, and streaks.
              Bonus: <strong>+50 XP!</strong>
            </p>
            <div className="gm-modal-btns">
              <button className="gm-modal-cancel" onClick={() => setShowLevelUp(false)}>
                Stay on {currentLevel}
              </button>
              <button className="gm-modal-confirm"
                style={{ background: NEXT_LEVEL_COLOR[nextLevel] ?? '#6366f1' }}
                onClick={() => { levelUp(); setShowLevelUp(false) }}>
                Yes! Level Up +50 XP
              </button>
            </div>
          </div>
        </div>
      )}

      {levelKey && roadmapPhases.length === 0 && (
        <div className="gm-empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>World coming soon!</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            The <strong>{assessmentResult.level}</strong> track is being built. Check back soon!
          </div>
        </div>
      )}

    </div>
  )
}