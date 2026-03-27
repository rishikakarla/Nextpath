import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { ROADMAP_PHASES } from '../data/appData'

function useTopPerformers(currentUid) {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(5))
    const unsub = onSnapshot(q, snap => {
      setBoard(snap.docs.map((doc, i) => ({ id: doc.id, rank: i + 1, isMe: doc.id === currentUid, ...doc.data() })))
      setLoading(false)
    })
    return unsub
  }, [currentUid])
  return { board, loading }
}

// ── GitHub-style activity heatmap ─────────────────────────────────────────────
function ActivityHeatmap({ history = [], createdAt }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from createdAt, capped at 1 year back
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)
  let start = createdAt ? new Date(createdAt) : new Date(oneYearAgo)
  start.setHours(0, 0, 0, 0)
  if (start < oneYearAgo) start = new Date(oneYearAgo)

  // Align to the Sunday of that week
  const cursor = new Date(start)
  cursor.setDate(cursor.getDate() - cursor.getDay())

  // Build week columns
  const activeSet = new Set(history)
  const isActive  = d => d && activeSet.has(d.toDateString())
  const isToday   = d => d && d.toDateString() === today.toDateString()

  const weeks = []
  while (cursor <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(cursor)
      day.setDate(cursor.getDate() + d)
      week.push(day <= today ? new Date(day) : null)
    }
    weeks.push(week)
    cursor.setDate(cursor.getDate() + 7)
  }

  // Month labels: show at the first column where a new month starts
  let lastMonth = -1
  const weekLabels = weeks.map(week => {
    const first = week.find(d => d !== null)
    const m = first ? first.getMonth() : -1
    const show = first && m !== lastMonth
    if (show) lastMonth = m
    return show ? first.toLocaleString('default', { month: 'short' }) : ''
  })

  const totalActive = [...activeSet].filter(d => new Date(d) >= start).length
  const DAY_LABELS  = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  return (
    <div>
      <div className="gh-scroll">
        {/* Month row */}
        <div className="gh-months-row">
          <div className="gh-label-spacer" />
          {weekLabels.map((lbl, i) => (
            <div key={i} className="gh-month-cell">{lbl}</div>
          ))}
        </div>

        {/* Day labels + grid */}
        <div style={{ display: 'flex', gap: 3 }}>
          <div className="gh-day-labels">
            {DAY_LABELS.map((l, i) => <div key={i} className="gh-day-lbl">{l}</div>)}
          </div>
          <div className="gh-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="gh-week-col">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`gh-cell${!day ? ' empty' : isActive(day) ? ' active' : ''}${isToday(day) ? ' today' : ''}`}
                    title={day
                      ? day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + (isActive(day) ? ' — Active' : '')
                      : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="gh-footer">
        <span>{totalActive} active day{totalActive !== 1 ? 's' : ''} since joining</span>
        <span className="gh-legend">
          Less
          {[false, true].map((a, i) => (
            <div key={i} className={`gh-cell${a ? ' active' : ''}`} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}

function RingProgress({ pct, color, size = 90, stroke = 9 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const filled = Math.max(0, Math.min(pct, 100)) / 100 * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  )
}

export default function Dashboard() {
  const { user, streak, progress, solvedProblems, dailyTasks, points, assessmentResult, quizAttempts, getLeaderboard } = useApp()
  const { aptitudeTopics, codingProblems } = useContent()
  const navigate = useNavigate()
  const { board: topBoard, loading: boardLoading } = useTopPerformers(user?.uid)

  const fullBoard = getLeaderboard()
  const myRank = topBoard.find(e => e.isMe)?.rank ?? fullBoard.find(e => e.isMe)?.rank ?? '—'
  const tasksToday = [dailyTasks.coding, dailyTasks.aptitude, dailyTasks.revision].filter(Boolean).length
  const allPhasesTopicCount = ROADMAP_PHASES.reduce((a, p) => a + p.topics.length, 0)
  const completedTopics = progress.completedTopics?.length ?? 0
  const totalProblems = codingProblems.length || 1

  const aptitudePassed = aptitudeTopics.filter(t => {
    const best = (quizAttempts[t.id] || []).reduce((b, a) => a.score > (b?.score ?? -1) ? a : b, null)
    return best && best.score >= 60
  }).length

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div>
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="db-hero">
        <div className="db-hero-left">
          <div className="db-hero-greeting">Welcome back 👋</div>
          <div className="db-hero-name">{user?.name?.split(' ')[0] || 'Student'}</div>
          <div className="db-hero-meta">
            {[user?.careerGoal, user?.yearOfStudy, user?.branch].filter(Boolean).join(' · ')}
          </div>
          {assessmentResult && (
            <div className="db-hero-badge">
              ⚡ {assessmentResult.level} · {assessmentResult.track}
            </div>
          )}
        </div>
        <div className="db-hero-stats">
          {[
            { val: `🔥 ${streak.count}`, lbl: 'Day Streak' },
            { val: points,               lbl: 'Total Points' },
            { val: `#${myRank}`,         lbl: 'Rank' },
            { val: `${tasksToday}/3`,    lbl: 'Tasks Today' },
          ].map(s => (
            <div key={s.lbl} className="db-hero-stat">
              <div className="db-hero-stat-val">{s.val}</div>
              <div className="db-hero-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Learning Progress ────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="flex-between mb-16">
          <h3 className="card-title" style={{ margin: 0 }}>Learning Progress</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/progress')}>View Details</button>
        </div>
        <div className="db-learn-grid">

          {/* DSA & Coding */}
          <div className="db-learn-card" style={{ '--lc': '#6366f1' }}>
            <div className="db-ring-wrap">
              <RingProgress pct={progress.dsa} color="#6366f1" />
              <div className="db-ring-center">
                <div className="db-ring-pct" style={{ color: '#6366f1' }}>{progress.dsa}%</div>
              </div>
            </div>
            <div className="db-learn-info">
              <div className="db-learn-title">💻 DSA &amp; Coding</div>
              <div className="db-learn-stat">
                <strong>{solvedProblems.length}</strong>
                <span>/ {totalProblems} problems solved</span>
              </div>
              <div className="db-learn-bar-wrap">
                <div className="db-learn-bar-fill" style={{ width: `${progress.dsa}%`, background: '#6366f1' }} />
              </div>
              <button className="db-learn-cta" style={{ color: '#6366f1' }} onClick={() => navigate('/practice/coding')}>
                Practice Now →
              </button>
            </div>
          </div>

          {/* Aptitude */}
          <div className="db-learn-card" style={{ '--lc': '#f59e0b' }}>
            <div className="db-ring-wrap">
              <RingProgress pct={progress.aptitude} color="#f59e0b" />
              <div className="db-ring-center">
                <div className="db-ring-pct" style={{ color: '#f59e0b' }}>{progress.aptitude}%</div>
              </div>
            </div>
            <div className="db-learn-info">
              <div className="db-learn-title">🧮 Aptitude</div>
              <div className="db-learn-stat">
                <strong>{aptitudePassed}</strong>
                <span>/ {aptitudeTopics.length} topics passed</span>
              </div>
              <div className="db-learn-bar-wrap">
                <div className="db-learn-bar-fill" style={{ width: `${progress.aptitude}%`, background: '#f59e0b' }} />
              </div>
              <button className="db-learn-cta" style={{ color: '#f59e0b' }} onClick={() => navigate('/aptitude-training')}>
                Start Training →
              </button>
            </div>
          </div>

          {/* Roadmap */}
          <div className="db-learn-card" style={{ '--lc': '#10b981' }}>
            <div className="db-ring-wrap">
              <RingProgress pct={progress.roadmap} color="#10b981" />
              <div className="db-ring-center">
                <div className="db-ring-pct" style={{ color: '#10b981' }}>{progress.roadmap}%</div>
              </div>
            </div>
            <div className="db-learn-info">
              <div className="db-learn-title">🗺️ Roadmap</div>
              <div className="db-learn-stat">
                <strong>{completedTopics}</strong>
                <span>/ {allPhasesTopicCount} topics done</span>
              </div>
              <div className="db-learn-bar-wrap">
                <div className="db-learn-bar-fill" style={{ width: `${progress.roadmap}%`, background: '#10b981' }} />
              </div>
              <button className="db-learn-cta" style={{ color: '#10b981' }} onClick={() => navigate('/roadmap')}>
                View Roadmap →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────── */}
      <div className="db-quick-grid">
        {[
          { icon: '📅', label: 'Daily Practice',    sub: `${tasksToday}/3 tasks done today`,       color: '#6366f1', bg: '#eef2ff', path: '/practice/daily' },
          { icon: '🧩', label: 'Coding Practice',   sub: `${solvedProblems.length} problems solved`, color: '#8b5cf6', bg: '#f5f3ff', path: '/practice/coding' },
          { icon: '🧮', label: 'Aptitude Training', sub: `${aptitudePassed} of ${aptitudeTopics.length} topics passed`, color: '#f59e0b', bg: '#fffbeb', path: '/aptitude-training' },
          { icon: '🗺️', label: 'Learning Roadmap',  sub: `${completedTopics} of ${allPhasesTopicCount} topics done`,   color: '#10b981', bg: '#ecfdf5', path: '/roadmap' },
        ].map(a => (
          <button key={a.path} className="db-quick-card" onClick={() => navigate(a.path)}
            style={{ '--qa-color': a.color, '--qa-bg': a.bg }}>
            <span className="db-quick-icon">{a.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div className="db-quick-label">{a.label}</div>
              <div className="db-quick-sub">{a.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Today's Tasks + Top Performers ──────────────────────── */}
      <div className="grid-2" style={{ marginBottom: 16 }}>

        {/* Today's Tasks */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title" style={{ margin: 0 }}>Today's Tasks</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: tasksToday === 3 ? 'var(--success)' : 'var(--text-muted)' }}>
                {tasksToday}/3 done
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/practice/daily')}>Go →</button>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="progress-bar-wrap" style={{ height: 6 }}>
              <div className="progress-bar-fill indigo" style={{ width: `${(tasksToday / 3) * 100}%`, transition: 'width .4s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { key: 'coding',   icon: '💻', label: 'Coding Problem',   pts: '+5 pts' },
              { key: 'aptitude', icon: '🧮', label: 'Aptitude Question', pts: '+5 pts' },
              { key: 'revision', icon: '📖', label: 'Concept Revision',  pts: '+5 pts' },
            ].map(t => (
              <div key={t.key} className={`db-task-row${dailyTasks[t.key] ? ' done' : ''}`}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{t.label}</span>
                {dailyTasks[t.key]
                  ? <span className="db-task-done-badge">✓ Done</span>
                  : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{t.pts}</span>
                }
              </div>
            ))}
          </div>

          {tasksToday === 3 && (
            <div className="db-all-done-banner">
              🎉 All tasks completed! +15 pts earned today
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title" style={{ margin: 0 }}>
              Top Performers
              <span className="db-live-badge">
                <span className="db-live-dot" />
                LIVE
              </span>
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leaderboard')}>Full Board</button>
          </div>

          {boardLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 26, height: 14, borderRadius: 4, background: 'var(--border)' }} />
                <div style={{ flex: 1, height: 14, borderRadius: 4, background: 'var(--border)' }} />
                <div style={{ width: 52, height: 14, borderRadius: 4, background: 'var(--border)' }} />
              </div>
            ))
          ) : topBoard.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
              No data yet — be the first on the board!
            </div>
          ) : topBoard.map(entry => (
            <div key={entry.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 8, marginBottom: 4,
              background: entry.isMe ? 'var(--primary-light)' : 'var(--bg)',
              border: `1px solid ${entry.isMe ? 'var(--primary)' : 'transparent'}`,
            }}>
              <span style={{ width: 26, fontSize: 15, fontWeight: 700, flexShrink: 0, textAlign: 'center' }}>
                {entry.rank <= 3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: entry.isMe ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: entry.isMe ? 'var(--primary)' : 'var(--text)' }}>
                  {entry.name || 'Student'}
                  {entry.isMe && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: '#fff', padding: '1px 6px', borderRadius: 10, border: '1px solid var(--primary)', marginLeft: 6 }}>You</span>}
                </div>
                {entry.college && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{entry.college}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{entry.points} pts</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 {entry.streak}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Heatmap ─────────────────────────────────────── */}
      <div className="card">
        <div className="flex-between mb-16">
          <h3 className="card-title" style={{ margin: 0 }}>Activity</h3>
          <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>
            🔥 {streak.count}-day streak
          </span>
        </div>
        <ActivityHeatmap history={streak.history || []} createdAt={user?.createdAt} />
      </div>
    </div>
  )
}