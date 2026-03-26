import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROADMAP_PHASES } from '../data/appData'

export default function Dashboard() {
  const { user, streak, progress, solvedProblems, dailyTasks, points, assessmentResult, getLeaderboard } = useApp()
  const navigate = useNavigate()

  const board = getLeaderboard()
  const myRank = board.find(e => e.isMe)?.rank ?? '—'
  const tasksToday = [dailyTasks.coding, dailyTasks.aptitude, dailyTasks.revision].filter(Boolean).length
  const allPhasesTopicCount = ROADMAP_PHASES.reduce((a, p) => a + p.topics.length, 0)

  // Build last 28 days for activity heatmap
  const today = new Date()
  const last28 = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (27 - i))
    return d.toDateString()
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="page-subtitle">{user?.careerGoal} — {user?.yearOfStudy}, {user?.branch}</p>
      </div>

      {assessmentResult && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          Assessment result: <strong>{assessmentResult.level}</strong> level —
          Recommended track: <strong>{assessmentResult.track}</strong>.
          Focus area: <strong>{assessmentResult.weakArea}</strong>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card indigo">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{streak.count}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{tasksToday}/3</div>
          <div className="stat-label">Tasks Today</div>
        </div>
        <div className="stat-card violet">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{progress.roadmap}%</div>
          <div className="stat-label">Roadmap Progress</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">#{myRank}</div>
          <div className="stat-label">Leaderboard Rank</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* Today's Tasks */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title" style={{ margin: 0 }}>Today's Tasks</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/practice/daily')}>
              Go to Practice
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'coding', icon: '💻', label: 'Coding Problem' },
              { key: 'aptitude', icon: '🧮', label: 'Aptitude Question' },
              { key: 'revision', icon: '📖', label: 'Concept Revision' },
            ].map(t => (
              <div key={t.key} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 8, background: dailyTasks[t.key] ? 'var(--success-light)' : 'var(--bg)',
                border: `1px solid ${dailyTasks[t.key] ? 'var(--success)' : 'var(--border)'}`,
              }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{t.label}</span>
                <span style={{ fontSize: 18 }}>{dailyTasks[t.key] ? '✅' : '⬜'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title" style={{ margin: 0 }}>Progress Overview</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/progress')}>
              Details
            </button>
          </div>
          <div className="progress-item">
            <div className="progress-label">
              <span>DSA Problems</span>
              <span>{progress.dsa}%</span>
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
              <span>{progress.roadmap}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill green" style={{ width: `${progress.roadmap}%` }} />
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
            {solvedProblems.length} problems solved · {progress.completedTopics?.length ?? 0} of {allPhasesTopicCount} topics done
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Streak Activity */}
        <div className="card">
          <h3 className="card-title">Activity (Last 28 Days)</h3>
          <div className="streak-calendar">
            {last28.map((d, i) => (
              <div
                key={i}
                className={`streak-day${streak.history?.includes(d) ? ' active' : ''}${d === today.toDateString() ? ' today' : ''}`}
                title={d}
              />
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--success)', display: 'inline-block' }} />
              Active day
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--border)', display: 'inline-block' }} />
              Inactive
            </span>
          </div>
        </div>

        {/* Top Leaderboard */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title" style={{ margin: 0 }}>Top Performers</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leaderboard')}>
              Full Board
            </button>
          </div>
          {board.slice(0, 5).map(entry => (
            <div key={entry.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ width: 22, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: entry.isMe ? 700 : 500, color: entry.isMe ? 'var(--primary)' : 'inherit' }}>
                {entry.name} {entry.isMe ? '(You)' : ''}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{entry.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
