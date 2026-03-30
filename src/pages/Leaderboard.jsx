import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'

const RANK_STYLE = [
  { bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', shadow: '0 4px 16px rgba(245,158,11,.35)', medal: '🥇', text: '#fff' },
  { bg: 'linear-gradient(135deg,#6b7280,#9ca3af)',  shadow: '0 4px 16px rgba(107,114,128,.3)',  medal: '🥈', text: '#fff' },
  { bg: 'linear-gradient(135deg,#cd7c3f,#f97316)',  shadow: '0 4px 16px rgba(205,124,63,.3)',   medal: '🥉', text: '#fff' },
]

function Avatar({ name, size = 38, bg = '#6366f1', color = '#fff' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.37, fontWeight: 800,
    }}>
      {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
  )
}

export default function Leaderboard() {
  const { user, points, streak } = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('points')

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'leaderboard'),
      snap => {
        const data = snap.docs.map(d => {
          const u = d.data()
          return { uid: d.id, name: u.name || '', college: u.college || '', points: u.points || 0, streak: u.streak || 0 }
        })
        setEntries(data)
        setLoading(false)
      },
      err => { console.error('Leaderboard read failed:', err); setLoading(false) }
    )
    return unsub
  }, [])

  const sorted = [...entries].sort((a, b) => {
    if (tab === 'points') return b.points !== a.points ? b.points - a.points : b.streak - a.streak
    return b.streak !== a.streak ? b.streak - a.streak : b.points - a.points
  }).map((e, i) => ({ ...e, rank: i + 1 }))

  const myEntry  = sorted.find(e => e.uid === user?.uid)
  const maxScore = sorted[0] ? (tab === 'points' ? sorted[0].points : sorted[0].streak) : 1

  return (
    <div className="lb-page">

      {/* ── Top section ── */}
      <div className="lb-top">
        {/* Left: title + your position */}
        <div className="lb-top-left">
          <div className="lb-eyebrow">Live Rankings</div>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-sub">Compete with students · earn points · climb the ranks</p>

          {/* How to earn */}
          <div className="lb-earn-chips">
            {[
              { e: '✅', l: 'Daily Task',     p: '+5' },
              { e: '🎯', l: 'All 3 Tasks',    p: '+15' },
              { e: '💻', l: 'Coding Problem', p: '+10' },
              { e: '📚', l: 'Roadmap Topic',  p: '+8' },
            ].map(x => (
              <span key={x.l} className="lb-earn-chip">
                {x.e} <strong>{x.p}</strong> {x.l}
              </span>
            ))}
          </div>
        </div>

        {/* Right: your stats */}
        <div className="lb-your-card">
          <div className="lb-your-rank">
            {myEntry
              ? (myEntry.rank <= 3
                  ? <span className="lb-your-medal">{RANK_STYLE[myEntry.rank - 1].medal}</span>
                  : <span className="lb-your-rank-num">#{myEntry.rank}</span>)
              : <span className="lb-your-rank-num">—</span>
            }
          </div>
          <div className="lb-your-label">Your Rank</div>
          <div className="lb-your-divider" />
          <div className="lb-your-stats">
            <div className="lb-your-stat">
              <span className="lb-your-stat-val">{points}</span>
              <span className="lb-your-stat-lbl">Points</span>
            </div>
            <div className="lb-your-stat">
              <span className="lb-your-stat-val">🔥 {streak.count}</span>
              <span className="lb-your-stat-lbl">Streak</span>
            </div>
            <div className="lb-your-stat">
              <span className="lb-your-stat-val">{loading ? '…' : sorted.length}</span>
              <span className="lb-your-stat-lbl">Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rankings card ── */}
      <div className="lb-card">
        {/* Card header */}
        <div className="lb-card-header">
          <div className="lb-card-title">🏆 Rankings</div>
          <div className="lb-card-tabs">
            {[{ key: 'points', label: 'Points' }, { key: 'streak', label: 'Streak' }].map(t => (
              <button
                key={t.key}
                className={`lb-card-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="lb-card-count">
            {loading ? 'Loading…' : `${sorted.length} student${sorted.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Column labels */}
        {!loading && sorted.length > 0 && (
          <div className="lb-col-head">
            <span className="lb-col lb-col-rank">Rank</span>
            <span className="lb-col lb-col-name">Student</span>
            <span className="lb-col lb-col-bar">Score</span>
            <span className="lb-col lb-col-pts">{tab === 'points' ? 'Points' : 'Streak'}</span>
            <span className="lb-col lb-col-sec">{tab === 'points' ? 'Streak' : 'Points'}</span>
          </div>
        )}

        {/* Rows */}
        {loading ? (
          <div className="lb-state">
            <div className="lb-state-icon">⏳</div>
            <div>Loading rankings…</div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="lb-state">
            <div className="lb-state-icon">🏁</div>
            <div>No students yet — be the first!</div>
          </div>
        ) : (
          <div className="lb-list">
            {sorted.map(entry => {
              const isMe    = entry.uid === user?.uid
              const rs      = entry.rank <= 3 ? RANK_STYLE[entry.rank - 1] : null
              const score   = tab === 'points' ? entry.points : entry.streak
              const secScore= tab === 'points' ? entry.streak : entry.points
              const barPct  = maxScore > 0 ? Math.max(4, Math.round((score / maxScore) * 100)) : 4
              const barColor= rs ? (entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : '#f97316')
                                 : isMe ? '#6366f1' : '#cbd5e1'

              return (
                <div key={entry.uid} className={`lb-entry${rs ? ` lb-top${entry.rank}` : ''}${isMe ? ' lb-me' : ''}`}>

                  {/* Rank */}
                  <div className="lb-entry-rank">
                    {rs ? (
                      <div className="lb-medal-badge" style={{ background: rs.bg, boxShadow: rs.shadow }}>
                        <span className="lb-medal-emoji">{rs.medal}</span>
                      </div>
                    ) : (
                      <div className="lb-rank-circle" style={{ color: isMe ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {entry.rank}
                      </div>
                    )}
                  </div>

                  {/* Avatar + Name */}
                  <div className="lb-entry-name">
                    <Avatar
                      name={entry.name}
                      size={36}
                      bg={rs ? (entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#94a3b8' : '#f97316') : isMe ? '#6366f1' : '#e2e8f0'}
                      color={rs || isMe ? '#fff' : '#64748b'}
                    />
                    <div className="lb-entry-info">
                      <div className="lb-entry-student">
                        {entry.name || 'Student'}
                        {isMe && <span className="lb-you-badge">You</span>}
                        {entry.rank === 1 && <span className="lb-top1-badge">Top Scorer</span>}
                      </div>
                      {entry.college && <div className="lb-entry-college">{entry.college}</div>}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="lb-entry-bar">
                    <div className="lb-bar-track">
                      <div className="lb-bar-fill" style={{ width: `${barPct}%`, background: barColor }} />
                    </div>
                  </div>

                  {/* Primary score */}
                  <div className="lb-entry-score">
                    <span className="lb-score-val" style={{ color: rs ? barColor : isMe ? 'var(--primary)' : 'var(--text)' }}>
                      {tab === 'points' ? score : `🔥 ${score}`}
                    </span>
                    <span className="lb-score-lbl">{tab === 'points' ? 'pts' : 'days'}</span>
                  </div>

                  {/* Secondary score */}
                  <div className="lb-entry-sec">
                    <span className="lb-sec-val">{tab === 'points' ? `🔥 ${secScore}` : secScore}</span>
                    <span className="lb-score-lbl">{tab === 'points' ? 'days' : 'pts'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
