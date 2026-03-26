import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppContext'
import { ROADMAP_PHASES } from '../data/appData'

function useTopPerformers(currentUid) {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(5))
    const unsub = onSnapshot(q, (snap) => {
      const entries = snap.docs.map((doc, i) => ({
        id: doc.id,
        rank: i + 1,
        isMe: doc.id === currentUid,
        ...doc.data(),
      }))
      setBoard(entries)
      setLoading(false)
    })
    return unsub
  }, [currentUid])

  return { board, loading }
}

export default function Dashboard() {
  const { user, streak, progress, solvedProblems, dailyTasks, assessmentResult, getLeaderboard } = useApp()
  const navigate = useNavigate()

  const { board: topBoard, loading: boardLoading } = useTopPerformers(user?.uid)

  // Fallback rank from full leaderboard (local) until real-time data loads
  const fullBoard = getLeaderboard()
  const myRank = topBoard.find(e => e.isMe)?.rank
    ?? fullBoard.find(e => e.isMe)?.rank
    ?? '—'
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

        {/* Top Leaderboard — real-time */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title" style={{ margin: 0 }}>
              Top Performers
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginLeft: 10, fontSize: 11, fontWeight: 600,
                color: '#10b981', verticalAlign: 'middle',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#10b981',
                  animation: 'livePulse 1.5s ease-in-out infinite',
                  display: 'inline-block',
                }} />
                LIVE
              </span>
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leaderboard')}>
              Full Board
            </button>
          </div>

          {boardLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ width: 22, height: 14, borderRadius: 4, background: 'var(--border)' }} />
                <div style={{ flex: 1, height: 14, borderRadius: 4, background: 'var(--border)' }} />
                <div style={{ width: 48, height: 14, borderRadius: 4, background: 'var(--border)' }} />
              </div>
            ))
          ) : topBoard.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>
              No data yet — be the first on the board!
            </div>
          ) : (
            topBoard.map(entry => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: '1px solid var(--border)',
                background: entry.isMe ? 'var(--primary-light)' : 'transparent',
                borderRadius: entry.isMe ? 6 : 0,
                padding: entry.isMe ? '8px 8px' : '8px 0',
              }}>
                <span style={{ width: 22, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                  {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: entry.isMe ? 700 : 500,
                    color: entry.isMe ? 'var(--primary)' : 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {entry.name} {entry.isMe ? '(You)' : ''}
                  </div>
                  {entry.college && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{entry.college}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{entry.points} pts</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {entry.streak}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
