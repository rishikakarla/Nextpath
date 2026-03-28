import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'

const LEVEL_MAP   = { 'Beginner': 'beginner', 'Beginner+': 'beginnerPlus', 'Intermediate': 'intermediate', 'Advanced': 'advanced' }
const LEVEL_COLOR = { beginner: '#10b981', beginnerPlus: '#6366f1', intermediate: '#f59e0b', advanced: '#ef4444' }

const PHASE_ACCENT = [
  { from: '#6366f1', to: '#818cf8' },
  { from: '#8b5cf6', to: '#a78bfa' },
  { from: '#06b6d4', to: '#38bdf8' },
  { from: '#10b981', to: '#34d399' },
  { from: '#f59e0b', to: '#fbbf24' },
]

function topicType(topic) {
  if (topic.quiz?.length > 0 && topic.resources?.length > 0) return { label: 'Quiz + Video', icon: '🎯', color: '#8b5cf6' }
  if (topic.quiz?.length > 0) return { label: `Quiz · ${topic.quiz.length}Q`, icon: '📝', color: '#6366f1' }
  if (topic.resources?.length > 0) return { label: 'Video', icon: '▶', color: '#ef4444' }
  return { label: 'Article', icon: '📖', color: '#10b981' }
}

function StatCard({ value, label, icon, color }) {
  return (
    <div className="rm-stat-card">
      <div className="rm-stat-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div>
        <div className="rm-stat-value" style={{ color }}>{value}</div>
        <div className="rm-stat-label">{label}</div>
      </div>
    </div>
  )
}

function PhaseNode({ idx, status, accent }) {
  if (status === 'completed') {
    return (
      <div className="rm-node rm-node-done">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 9l3.5 3.5L14 5.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    )
  }
  if (status === 'locked') {
    return (
      <div className="rm-node rm-node-locked">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="6" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="rm-node rm-node-active" style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{idx + 1}</span>
    </div>
  )
}

export default function Roadmap() {
  const navigate = useNavigate()
  const { progress, assessmentResult } = useApp()
  const { roadmapPhases: roadmapByLevel } = useContent()

  const levelKey = assessmentResult?.level ? (LEVEL_MAP[assessmentResult.level] || 'beginner') : null
  const roadmapPhases = levelKey ? (roadmapByLevel[levelKey] || []) : []

  const [open, setOpen] = useState(0)

  const TOTAL_TOPICS = roadmapPhases.reduce((a, p) => a + p.topics.length, 0)
  const completedCount = progress.completedTopics?.length ?? 0
  const phaseDone = roadmapPhases.filter(p =>
    p.topics.every(t => progress.completedTopics?.includes(t.id))
  ).length
  const totalXP = completedCount * 8

  const getPhaseStatus = (phase, idx) => {
    const done = phase.topics.every(t => progress.completedTopics?.includes(t.id))
    if (done) return 'completed'
    if (idx === 0) return 'active'
    const prevDone = roadmapPhases.slice(0, idx).every(p =>
      p.topics.every(t => progress.completedTopics?.includes(t.id))
    )
    return prevDone ? 'active' : 'locked'
  }

  return (
    <div className="rm-root">
      {/* ── Page header ── */}
      <div className="rm-hero">
        <div className="rm-hero-left">
          <div className="rm-hero-eyebrow">Your Journey</div>
          <h1 className="rm-hero-title">Learning Roadmap</h1>
          <p className="rm-hero-sub">Structured phases to guide your career preparation</p>
          {assessmentResult?.level && (
            <span className="rm-level-badge" style={{
              background: LEVEL_COLOR[levelKey] + '18',
              color: LEVEL_COLOR[levelKey],
              borderColor: LEVEL_COLOR[levelKey] + '40'
            }}>
              {assessmentResult.level} Track
            </span>
          )}
        </div>
        {levelKey && (
          <div className="rm-hero-ring">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8"/>
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="var(--primary)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - (progress.roadmap ?? 0) / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="rm-ring-label">
              <div className="rm-ring-pct">{progress.roadmap ?? 0}%</div>
              <div className="rm-ring-sub">Done</div>
            </div>
          </div>
        )}
      </div>

      {/* ── No assessment ── */}
      {!levelKey && (
        <div className="rm-alert">
          <span>🎯</span>
          <div>
            <strong>Take the assessment first!</strong> Your roadmap is personalized based on your skill level.
            {' '}<a href="/assessment" style={{ color: 'var(--primary)', fontWeight: 600 }}>Start Assessment →</a>
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      {levelKey && (
        <div className="rm-stats-row">
          <StatCard value={phaseDone} label="Phases Done"   icon="🏆" color="#f59e0b" />
          <StatCard value={completedCount} label="Topics Done" icon="✅" color="#10b981" />
          <StatCard value={TOTAL_TOPICS - completedCount} label="Remaining"   icon="⏳" color="#6366f1" />
          <StatCard value={`${totalXP}`}   label="XP Earned"   icon="⚡" color="#8b5cf6" />
        </div>
      )}

      {/* ── Timeline ── */}
      {levelKey && roadmapPhases.length > 0 && (
        <div className="rm-timeline">
          {roadmapPhases.map((phase, idx) => {
            const status   = getPhaseStatus(phase, idx)
            const isOpen   = open === idx
            const accent   = PHASE_ACCENT[idx % PHASE_ACCENT.length]
            const done     = phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length
            const pct      = Math.round((done / phase.topics.length) * 100)
            const isLast   = idx === roadmapPhases.length - 1

            return (
              <div key={phase.id} className="rm-phase-row">
                {/* Left rail */}
                <div className="rm-rail">
                  <PhaseNode idx={idx} status={status} accent={accent} />
                  {!isLast && <div className={`rm-connector${status === 'completed' ? ' done' : ''}`} />}
                </div>

                {/* Phase card */}
                <div className={`rm-phase-card${status === 'locked' ? ' locked' : ''}${status === 'completed' ? ' completed' : ''}`}
                  style={{ '--accent-from': accent.from, '--accent-to': accent.to }}>

                  {/* Card top stripe */}
                  {status !== 'locked' && (
                    <div className="rm-phase-stripe"
                      style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />
                  )}

                  {/* Header */}
                  <div className="rm-phase-header" onClick={() => setOpen(isOpen ? -1 : idx)}>
                    <div className="rm-phase-header-left">
                      <div className="rm-phase-label" style={{
                        color: status === 'locked' ? 'var(--text-muted)' : accent.from
                      }}>Phase {idx + 1}</div>
                      <div className="rm-phase-title">{phase.title}</div>
                      <div className="rm-phase-meta">
                        {phase.duration} · {done}/{phase.topics.length} topics
                        {status === 'locked' && ' · Complete previous phase to unlock'}
                      </div>
                    </div>
                    <div className="rm-phase-header-right">
                      {status === 'locked' ? (
                        <span className="rm-status-chip locked">🔒 Locked</span>
                      ) : status === 'completed' ? (
                        <span className="rm-status-chip done">✓ Complete</span>
                      ) : (
                        <span className="rm-status-chip active" style={{ background: accent.from + '18', color: accent.from, borderColor: accent.from + '40' }}>In Progress</span>
                      )}
                      <svg className={`rm-chevron${isOpen ? ' open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {status !== 'locked' && (
                    <div className="rm-phase-progress-wrap">
                      <div className="rm-phase-progress-bar">
                        <div className="rm-phase-progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`
                          }} />
                      </div>
                      <span className="rm-phase-pct">{pct}%</span>
                    </div>
                  )}

                  {/* Topics */}
                  {isOpen && (
                    <div className="rm-topics-wrap">
                      <div className="rm-topics-grid">
                        {phase.topics.map((topic, ti) => {
                          const isDone  = progress.completedTopics?.includes(topic.id)
                          const canOpen = status !== 'locked'
                          const type    = topicType(topic)

                          return (
                            <div
                              key={topic.id}
                              className={`rm-topic${isDone ? ' done' : ''}${!canOpen ? ' locked' : ''}`}
                              onClick={() => canOpen && navigate(`/roadmap/topic/${topic.id}`)}
                            >
                              {/* Topic number */}
                              <div className="rm-topic-num" style={{
                                background: isDone ? 'var(--success)' : canOpen ? accent.from : 'var(--border)',
                                color: isDone || canOpen ? '#fff' : 'var(--text-muted)'
                              }}>
                                {isDone ? '✓' : ti + 1}
                              </div>

                              <div className="rm-topic-body">
                                <div className="rm-topic-name">{topic.name}</div>
                                <div className="rm-topic-tags">
                                  <span className="rm-topic-type" style={{ color: type.color, background: type.color + '15' }}>
                                    {type.icon} {type.label}
                                  </span>
                                </div>
                              </div>

                              <div className="rm-topic-cta">
                                {isDone ? (
                                  <span className="rm-cta-done">+8 pts</span>
                                ) : canOpen ? (
                                  <span className="rm-cta-go" style={{ color: accent.from }}>
                                    Start
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                      <path d="M2.5 6h7m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="rm-cta-locked">🔒</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {levelKey && roadmapPhases.length === 0 && (
        <div className="rm-empty">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No roadmap configured yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            The <strong>{assessmentResult.level}</strong> track is coming soon. Check back later!
          </div>
        </div>
      )}
    </div>
  )
}