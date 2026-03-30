import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'

const MEDAL_COLOR = ['#f59e0b', '#94a3b8', '#cd7c3f']
const MEDAL_BG    = ['#fffbeb', '#f8fafc', '#fff7ed']
const MEDAL_BORDER= ['#fcd34d', '#cbd5e1', '#fdba74']

const POINTS_GUIDE = [
  { icon: '✅', label: 'Daily Task',      pts: '+5' },
  { icon: '🎯', label: 'All 3 Tasks',     pts: '+15' },
  { icon: '💻', label: 'Coding Problem',  pts: '+10' },
  { icon: '📚', label: 'Roadmap Topic',   pts: '+8'  },
]

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

  const myEntry = sorted.find(e => e.uid === user?.uid)
  const top3    = sorted.slice(0, 3)
  const rest    = sorted.slice(3)

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumHeight = ['72px', '96px', '56px']
  const podiumHeightFor = (e) => {
    if (!e) return '56px'
    if (e.rank === 1) return '96px'
    if (e.rank === 2) return '72px'
    return '56px'
  }

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div className="lb-hero">
        <div className="lb-hero-left">
          <div className="lb-hero-eyebrow">🏆 Live Rankings</div>
          <div className="lb-hero-title">Leaderboard</div>
          <div className="lb-hero-sub">Rankings across all students · updates in real time</div>
          {myEntry && (
            <div className="lb-hero-myrank">
              <span className="lb-hero-myrank-label">Your rank</span>
              <span className="lb-hero-myrank-val">
                {myEntry.rank <= 3 ? ['🥇','🥈','🥉'][myEntry.rank - 1] : `#${myEntry.rank}`}
              </span>
            </div>
          )}
        </div>
        <div className="lb-hero-stats">
          {[
            { val: points,       lbl: 'Your Points', icon: '⚡' },
            { val: `🔥 ${streak.count}`, lbl: 'Streak',  icon: '' },
            { val: myEntry ? `#${myEntry.rank}` : '—', lbl: 'Rank', icon: '🎯' },
            { val: sorted.length, lbl: 'Students', icon: '👥' },
          ].map(s => (
            <div key={s.lbl} className="lb-hero-stat">
              <div className="lb-hero-stat-val">{s.val}</div>
              <div className="lb-hero-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Points guide ── */}
      <div className="lb-guide">
        {POINTS_GUIDE.map(g => (
          <div key={g.label} className="lb-guide-item">
            <span className="lb-guide-icon">{g.icon}</span>
            <span className="lb-guide-pts">{g.pts} pts</span>
            <span className="lb-guide-lbl">{g.label}</span>
          </div>
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div className="lb-tabs">
        {[{ key: 'points', label: '🏆 By Points' }, { key: 'streak', label: '🔥 By Streak' }].map(t => (
          <button
            key={t.key}
            className={`lb-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <span className="lb-count">
          {loading ? 'Loading…' : `${sorted.length} student${sorted.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {loading ? (
        <div className="lb-empty">
          <div className="lb-empty-icon">⏳</div>
          Loading rankings…
        </div>
      ) : sorted.length === 0 ? (
        <div className="lb-empty">
          <div className="lb-empty-icon">🏁</div>
          No students yet. Be the first to earn points!
        </div>
      ) : (
        <>
          {/* ── Top 3 Podium ── */}
          {top3.length > 0 && (
            <div className="lb-podium-wrap">
              {podiumOrder.map((entry, pi) => {
                const isMe = entry.uid === user?.uid
                const mc   = MEDAL_COLOR[entry.rank - 1]
                const mb   = MEDAL_BG[entry.rank - 1]
                const mbo  = MEDAL_BORDER[entry.rank - 1]
                return (
                  <div key={entry.uid} className={`lb-podium-card${isMe ? ' me' : ''}`}
                    style={{ borderColor: isMe ? 'var(--primary)' : mbo, background: isMe ? 'var(--primary-light)' : mb }}
                  >
                    {isMe && <div className="lb-podium-you-tag">You</div>}
                    <div className="lb-podium-avatar" style={{ background: mc + '22', borderColor: mc }}>
                      <span className="lb-podium-initials" style={{ color: mc }}>
                        {entry.name ? entry.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="lb-podium-medal">
                      {['🥇','🥈','🥉'][entry.rank - 1]}
                    </div>
                    <div className="lb-podium-name">{entry.name || 'Student'}</div>
                    {entry.college && <div className="lb-podium-college">{entry.college}</div>}
                    <div className="lb-podium-pts" style={{ color: mc }}>{tab === 'points' ? entry.points : `🔥 ${entry.streak}`}</div>
                    <div className="lb-podium-pts-lbl">{tab === 'points' ? 'points' : 'day streak'}</div>
                    <div className="lb-podium-base" style={{ height: podiumHeightFor(entry), background: mc + '22', borderTop: `3px solid ${mc}` }}>
                      <span style={{ color: mc, fontWeight: 900, fontSize: 18 }}>#{entry.rank}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Rankings Table ── */}
          {rest.length > 0 && (
            <div className="lb-table">
              <div className="lb-table-head">
                <span className="lb-th lb-th-rank">Rank</span>
                <span className="lb-th lb-th-name">Student</span>
                <span className="lb-th lb-th-pts">Points</span>
                <span className="lb-th lb-th-streak">Streak</span>
              </div>

              {rest.map(entry => {
                const isMe = entry.uid === user?.uid
                return (
                  <div key={entry.uid} className={`lb-row${isMe ? ' lb-row-me' : ''}`}>
                    <span className="lb-td lb-td-rank">
                      <span className="lb-rank-num" style={{ color: isMe ? 'var(--primary)' : 'var(--text-muted)' }}>
                        #{entry.rank}
                      </span>
                    </span>
                    <span className="lb-td lb-td-name">
                      <div className="lb-row-avatar" style={{ background: isMe ? 'var(--primary)' : '#e2e8f0', color: isMe ? '#fff' : 'var(--text-secondary)' }}>
                        {entry.name ? entry.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="lb-name-wrap">
                        <div className="lb-name">
                          {entry.name || 'Student'}
                          {isMe && <span className="lb-you-tag">You</span>}
                        </div>
                        {entry.college && <div className="lb-college">{entry.college}</div>}
                      </div>
                    </span>
                    <span className="lb-td lb-td-pts">
                      <div className="lb-pts-val" style={{ color: tab === 'points' ? 'var(--primary)' : 'var(--text)' }}>{entry.points}</div>
                      <div className="lb-pts-sub">pts</div>
                    </span>
                    <span className="lb-td lb-td-streak">
                      <div className="lb-streak-val" style={{ color: tab === 'streak' ? '#f59e0b' : 'var(--text)' }}>🔥 {entry.streak}</div>
                      <div className="lb-pts-sub">days</div>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
