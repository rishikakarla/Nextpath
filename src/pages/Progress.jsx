import { useApp } from '../context/AppContext'
import { CODING_PROBLEMS, ROADMAP_PHASES } from '../data/appData'

const TOTAL_TOPICS = ROADMAP_PHASES.reduce((a, p) => a + p.topics.length, 0)
const TOTAL_PROBLEMS = CODING_PROBLEMS.length

export default function Progress() {
  const { progress, solvedProblems, streak, points, dailyTasks, user } = useApp()

  const categoryStats = ['Arrays', 'Strings', 'Recursion', 'Linked Lists', 'Stacks', 'Queues'].map(cat => {
    const total = CODING_PROBLEMS.filter(p => p.category === cat).length
    const solved = CODING_PROBLEMS.filter(p => p.category === cat && solvedProblems.includes(p.id)).length
    return { cat, solved, total, pct: total ? Math.round((solved / total) * 100) : 0 }
  })

  const phaseStats = ROADMAP_PHASES.map(phase => {
    const done = phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length
    return { ...phase, done, pct: Math.round((done / phase.topics.length) * 100) }
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">Detailed view of your learning journey</p>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card indigo">
          <div className="stat-icon">💻</div>
          <div className="stat-value">{solvedProblems.length}</div>
          <div className="stat-label">Problems Solved</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{progress.completedTopics?.length ?? 0}</div>
          <div className="stat-label">Topics Completed</div>
        </div>
        <div className="stat-card violet">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{streak.count}</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{points}</div>
          <div className="stat-label">Total Points</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Overall Progress */}
        <div className="card">
          <h3 className="card-title">Overall Progress</h3>

          <div className="progress-item">
            <div className="progress-label">
              <span>DSA Problems</span>
              <span>{solvedProblems.length}/{TOTAL_PROBLEMS}</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill indigo" style={{ width: `${progress.dsa}%` }} />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              <span>Aptitude</span>
              <span>{progress.aptitude}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill amber" style={{ width: `${progress.aptitude}%` }} />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-label">
              <span>Roadmap</span>
              <span>{progress.completedTopics?.length ?? 0}/{TOTAL_TOPICS}</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill green" style={{ width: `${progress.roadmap ?? 0}%` }} />
            </div>
          </div>

          <div className="divider" />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>
                {[dailyTasks.coding, dailyTasks.aptitude, dailyTasks.revision].filter(Boolean).length}/3
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tasks Today</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
                {streak.history?.length ?? 0}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Days</div>
            </div>
          </div>
        </div>

        {/* DSA by Category */}
        <div className="card">
          <h3 className="card-title">DSA by Category</h3>
          {categoryStats.map(s => (
            <div key={s.cat} className="progress-item">
              <div className="progress-label">
                <span>{s.cat}</span>
                <span>{s.solved}/{s.total}</span>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill indigo"
                  style={{ width: `${s.pct}%`, background: s.pct === 100 ? 'var(--success)' : 'var(--primary)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Phase Breakdown */}
      <div className="card">
        <h3 className="card-title">Roadmap Phase Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {phaseStats.map(p => (
            <div key={p.id} style={{
              background: 'var(--bg)', borderRadius: 8, padding: 14,
              border: `1px solid ${p.pct === 100 ? 'var(--success)' : 'var(--border)'}`,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Phase {p.id}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{p.title}</div>
              <div className="progress-bar-wrap" style={{ marginBottom: 6 }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${p.pct}%`,
                    background: p.pct === 100 ? 'var(--success)' : 'var(--primary)',
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {p.done}/{p.topics.length} topics · {p.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
