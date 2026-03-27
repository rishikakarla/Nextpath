import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { user, points, streak } = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('points')

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'leaderboard'),
      snap => {
        const data = snap.docs.map(d => {
          const u = d.data()
          return {
            uid: d.id,
            name: u.name || '',
            college: u.college || '',
            points: u.points || 0,
            streak: u.streak || 0,
          }
        })
        setEntries(data)
        setLoading(false)
      },
      err => {
        console.error('Leaderboard read failed:', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // Sort based on active tab
  const sorted = [...entries].sort((a, b) => {
    if (tab === 'points') {
      if (b.points !== a.points) return b.points - a.points
      return b.streak - a.streak
    }
    // streak tab
    if (b.streak !== a.streak) return b.streak - a.streak
    return b.points - a.points
  }).map((e, i) => ({ ...e, rank: i + 1 }))

  const myEntry = sorted.find(e => e.uid === user?.uid)

  const rankColor = (r) => r === 1 ? '#f59e0b' : r === 2 ? '#94a3b8' : r === 3 ? '#cd7c3f' : 'var(--text-muted)'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">Live rankings across all students</p>
      </div>

      {/* My ranking card */}
      {myEntry && (
        <div className="card" style={{ marginBottom: 20, background: 'var(--primary-light)', border: '1.5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>
                Your Ranking
              </div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>
                {MEDALS[myEntry.rank - 1] || `#${myEntry.rank}`}
                {myEntry.rank > 3 && <span style={{ fontSize: 22, marginLeft: 4 }}>Rank #{myEntry.rank}</span>}
              </div>
              {myEntry.college && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{myEntry.college}</div>}
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{points}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4 }}>Points</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>🔥 {streak.count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4 }}>Day Streak</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{sorted.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4 }}>Students</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points guide */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
          {[
            { label: 'Daily Task', pts: '+5 pts' },
            { label: 'All 3 Tasks', pts: '+15 pts' },
            { label: 'Coding Problem', pts: '+10 pts' },
            { label: 'Roadmap Topic', pts: '+8 pts' },
          ].map(item => (
            <div key={item.label} style={{ padding: '10px 8px', background: 'var(--bg)', borderRadius: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{item.pts}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'points', label: '🏆 By Points' },
          { key: 'streak', label: '🔥 By Streak' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '7px 20px', borderRadius: 20, border: '2px solid',
            borderColor: tab === t.key ? 'var(--primary)' : 'var(--border)',
            background: tab === t.key ? 'var(--primary-light)' : 'transparent',
            color: tab === t.key ? 'var(--primary)' : 'var(--text)',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            {t.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
          {loading ? 'Loading…' : `${sorted.length} student${sorted.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          Loading rankings…
        </div>
      ) : sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          No students yet. Be the first to earn points!
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 110px 110px', gap: 8, padding: '6px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: .5 }}>
            <span>Rank</span><span>Student</span>
            <span style={{ textAlign: 'right' }}>Points</span>
            <span style={{ textAlign: 'right' }}>Streak</span>
          </div>

          <div className="leaderboard-list">
            {sorted.map(entry => {
              const isMe = entry.uid === user?.uid
              return (
                <div
                  key={entry.uid}
                  className={`leaderboard-row${isMe ? ' me' : ''}${entry.rank === 1 ? ' top-1' : ''}`}
                  style={isMe ? { border: '1.5px solid var(--primary)', background: 'var(--primary-light)' } : {}}
                >
                  {/* Rank */}
                  <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
                    {entry.rank <= 3 ? (
                      <span style={{ fontSize: 22 }}>{MEDALS[entry.rank - 1]}</span>
                    ) : (
                      <span style={{ fontSize: 15, fontWeight: 700, color: rankColor(entry.rank) }}>#{entry.rank}</span>
                    )}
                  </div>

                  {/* Name + college */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: isMe ? 700 : 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name || 'Student'}</span>
                      {isMe && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: '#fff', padding: '1px 7px', borderRadius: 10, border: '1px solid var(--primary)', whiteSpace: 'nowrap' }}>You</span>
                      )}
                    </div>
                    {entry.college && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.college}</div>
                    )}
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: tab === 'points' ? 'var(--primary)' : 'var(--text)' }}>{entry.points ?? 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>pts</div>
                  </div>

                  {/* Streak */}
                  <div style={{ textAlign: 'right', minWidth: 80, flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: tab === 'streak' ? '#f59e0b' : 'var(--text)' }}>🔥 {entry.streak ?? 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>days</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}