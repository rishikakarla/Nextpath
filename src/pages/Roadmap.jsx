import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'


export default function Roadmap() {
  const navigate = useNavigate()
  const { progress, assessmentResult } = useApp()
  const { roadmapPhases: roadmapByLevel } = useContent()

  const LEVEL_MAP = { 'Beginner': 'beginner', 'Beginner+': 'beginnerPlus', 'Intermediate': 'intermediate', 'Advanced': 'advanced' }
  const LEVEL_COLORS = { beginner: '#10b981', beginnerPlus: '#6366f1', intermediate: '#f59e0b', advanced: '#ef4444' }
  const levelKey = assessmentResult?.level ? (LEVEL_MAP[assessmentResult.level] || 'beginner') : null
  const roadmapPhases = levelKey ? (roadmapByLevel[levelKey] || []) : []

  const [open, setOpen] = useState(0)

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
    navigate(`/roadmap/topic/${topic.id}`)
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

    </div>
  )
}
