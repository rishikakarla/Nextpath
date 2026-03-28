import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { ROADMAP_PHASES } from '../data/appData'

// ── SVG Ring ──────────────────────────────────────────────────────────────────
function Ring({ pct, size = 80, stroke = 8, color = '#6366f1', label, sub }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="pg-ring-wrap">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .6s ease' }} />
      </svg>
      <div className="pg-ring-center">
        <div className="pg-ring-pct" style={{ color }}>{pct}%</div>
      </div>
      {label && <div className="pg-ring-label">{label}</div>}
      {sub   && <div className="pg-ring-sub">{sub}</div>}
    </div>
  )
}

// ── Bar ───────────────────────────────────────────────────────────────────────
function Bar({ pct, color }) {
  return (
    <div className="pg-bar-track">
      <div className="pg-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ── Milestone ─────────────────────────────────────────────────────────────────
function Milestone({ icon, label, desc, unlocked }) {
  return (
    <div className={`pg-milestone${unlocked ? ' unlocked' : ''}`}>
      <div className="pg-ms-icon">{icon}</div>
      <div className="pg-ms-label">{label}</div>
      <div className="pg-ms-desc">{desc}</div>
      {!unlocked && <div className="pg-ms-lock">🔒</div>}
    </div>
  )
}

const CAT_COLORS = {
  Arrays: '#6366f1', Strings: '#8b5cf6', Recursion: '#ec4899',
  'Linked Lists': '#f59e0b', Stacks: '#10b981', Queues: '#06b6d4',
}
const CAT_ICONS = {
  Arrays: '📊', Strings: '🔤', Recursion: '🔄',
  'Linked Lists': '🔗', Stacks: '📚', Queues: '🎯',
}

export default function Progress() {
  const navigate = useNavigate()
  const { progress, solvedProblems, streak, points, dailyTasks, quizAttempts } = useApp()
  const { aptitudeTopics, codingProblems } = useContent()

  const TOTAL_PROBLEMS = codingProblems.length || 1
  const TOTAL_TOPICS   = ROADMAP_PHASES.reduce((a, p) => a + p.topics.length, 0)
  const completedTopics = progress.completedTopics?.length ?? 0
  const tasksToday = [dailyTasks.coding, dailyTasks.aptitude, dailyTasks.revision].filter(Boolean).length
  const activeDays = streak.history?.length ?? 0

  // Aptitude
  const aptitudePassed = aptitudeTopics.filter(t => {
    const best = (quizAttempts[t.id] || []).reduce((b, a) => a.score > (b?.score ?? -1) ? a : b, null)
    return best && best.score >= 60
  }).length
  const aptitudePct = aptitudeTopics.length ? Math.round((aptitudePassed / aptitudeTopics.length) * 100) : 0

  // DSA pct
  const dsaPct = Math.round((solvedProblems.length / TOTAL_PROBLEMS) * 100)
  const roadmapPct = TOTAL_TOPICS ? Math.round((completedTopics / TOTAL_TOPICS) * 100) : 0

  // Category stats
  const categories = ['Arrays', 'Strings', 'Recursion', 'Linked Lists', 'Stacks', 'Queues']
  const categoryStats = categories.map(cat => {
    const total  = codingProblems.filter(p => p.category === cat).length
    const solved = codingProblems.filter(p => p.category === cat && solvedProblems.includes(p.id)).length
    return { cat, solved, total, pct: total ? Math.round((solved / total) * 100) : 0 }
  })

  // Roadmap phases
  const phaseStats = ROADMAP_PHASES.map(phase => {
    const done = phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length
    return { ...phase, done, pct: Math.round((done / phase.topics.length) * 100) }
  })

  // Milestones
  const milestones = [
    { icon: '🌱', label: 'First Step',     desc: 'Solve your first problem',         unlocked: solvedProblems.length >= 1 },
    { icon: '🔥', label: '7-Day Streak',   desc: 'Maintain a 7-day streak',          unlocked: streak.count >= 7 },
    { icon: '💯', label: 'Century',        desc: 'Earn 100 points',                  unlocked: points >= 100 },
    { icon: '🧠', label: 'DSA Explorer',   desc: 'Solve 10 problems',                unlocked: solvedProblems.length >= 10 },
    { icon: '📖', label: 'Phase Master',   desc: 'Complete a roadmap phase',         unlocked: phaseStats.some(p => p.pct === 100) },
    { icon: '⚡', label: 'Speed Demon',    desc: '30-day streak',                    unlocked: streak.count >= 30 },
    { icon: '🏆', label: 'Half Century',   desc: 'Solve 50 problems',                unlocked: solvedProblems.length >= 50 },
    { icon: '🎯', label: 'Quiz Master',    desc: 'Pass 5 aptitude topics',           unlocked: aptitudePassed >= 5 },
  ]

  return (
    <div>
      {/* ── Header ── */}
      <div className="pg-header">
        <div>
          <h1 className="page-title" style={{ color: '#fff', margin: 0 }}>My Progress</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', marginTop: 4, fontSize: 14 }}>
            Detailed view of your learning journey
          </p>
        </div>
        <div className="pg-header-stats">
          {[
            { value: solvedProblems.length, label: 'Problems', icon: '💻', color: '#a5b4fc' },
            { value: completedTopics,       label: 'Topics',   icon: '📚', color: '#6ee7b7' },
            { value: `🔥 ${streak.count}`, label: 'Streak',   icon: null, color: '#fcd34d' },
            { value: points,               label: 'Points',   icon: '⭐', color: '#fcd34d' },
          ].map(s => (
            <div key={s.label} className="pg-hstat">
              <div className="pg-hstat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="pg-hstat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Learning Overview ── */}
      <div className="lov-section">
        <div className="lov-head">
          <div>
            <h3 className="lov-title">Learning Overview</h3>
            <p className="lov-subtitle">Your progress across all domains</p>
          </div>
          <div className="lov-overall">
            <div className="lov-overall-pct">
              {Math.round((dsaPct + aptitudePct + roadmapPct) / 3)}%
            </div>
            <div className="lov-overall-lbl">Overall</div>
          </div>
        </div>

        <div className="lov-grid">
          {[
            {
              pct: dsaPct, color: '#6366f1', glow: '#6366f115',
              icon: '💻', label: 'DSA Problems',
              value: solvedProblems.length, total: TOTAL_PROBLEMS, unit: 'solved',
              route: '/coding-practice',
              tip: solvedProblems.length === 0 ? 'Start solving!' : dsaPct === 100 ? 'All done!' : `${TOTAL_PROBLEMS - solvedProblems.length} left`,
            },
            {
              pct: aptitudePct, color: '#f59e0b', glow: '#f59e0b15',
              icon: '🧮', label: 'Aptitude',
              value: aptitudePassed, total: aptitudeTopics.length, unit: 'topics passed',
              route: '/aptitude-training',
              tip: aptitudePassed === 0 ? 'Take your first quiz!' : aptitudePct === 100 ? 'Mastered!' : `${aptitudeTopics.length - aptitudePassed} topics left`,
            },
            {
              pct: roadmapPct, color: '#10b981', glow: '#10b98115',
              icon: '🗺️', label: 'Roadmap',
              value: completedTopics, total: TOTAL_TOPICS, unit: 'topics done',
              route: '/roadmap',
              tip: completedTopics === 0 ? 'Pick a topic!' : roadmapPct === 100 ? 'Level up!' : `${TOTAL_TOPICS - completedTopics} topics left`,
            },
            {
              pct: Math.round((tasksToday / 3) * 100),
              color: tasksToday === 3 ? '#10b981' : '#8b5cf6', glow: '#8b5cf615',
              icon: '⚡', label: "Today's Tasks",
              value: tasksToday, total: 3, unit: 'completed',
              route: '/practice/daily',
              tip: tasksToday === 3 ? 'All done today!' : `${3 - tasksToday} task${3 - tasksToday > 1 ? 's' : ''} remaining`,
            },
          ].map(d => (
            <div key={d.label} className="lov-card" onClick={() => navigate(d.route)}
              style={{ '--lc': d.color, '--lg': d.glow }}>
              {/* Glow layer */}
              <div className="lov-card-glow" />

              {/* Top row */}
              <div className="lov-card-header">
                <span className="lov-card-icon">{d.icon}</span>
                <span className="lov-card-label">{d.label}</span>
              </div>

              {/* Ring */}
              <div className="lov-card-ring">
                <Ring pct={d.pct} size={96} stroke={9} color={d.color} />
              </div>

              {/* Stats */}
              <div className="lov-card-score">
                <span className="lov-score-val" style={{ color: d.color }}>{d.value}</span>
                <span className="lov-score-sep">/</span>
                <span className="lov-score-total">{d.total}</span>
              </div>
              <div className="lov-card-unit">{d.unit}</div>

              {/* Tip */}
              <div className="lov-card-tip" style={{ color: d.color }}>{d.tip}</div>

              {/* CTA */}
              <div className="lov-card-cta">View →</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* ── DSA by Category ── */}
        <div className="card">
          <h3 className="card-title">DSA by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categoryStats.map(s => (
              <div key={s.cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{CAT_ICONS[s.cat]}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.cat}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.solved}/{s.total}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: s.pct === 100 ? '#d1fae5' : 'var(--primary-light)',
                      color: s.pct === 100 ? '#065f46' : 'var(--primary)',
                    }}>{s.pct}%</span>
                  </div>
                </div>
                <Bar pct={s.pct} color={s.pct === 100 ? '#10b981' : CAT_COLORS[s.cat]} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats + Streak ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick stats */}
          <div className="card">
            <h3 className="card-title">Activity Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Active Days',    value: activeDays,                 icon: '📅', color: '#6366f1' },
                { label: 'Current Streak', value: `${streak.count} days`,     icon: '🔥', color: '#f59e0b' },
                { label: 'Best Streak',    value: `${streak.best ?? streak.count} days`, icon: '🏅', color: '#10b981' },
                { label: 'Tasks Today',    value: `${tasksToday}/3`,          icon: '✅', color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} className="pg-stat-tile" style={{ '--stc': s.color }}>
                  <div className="pg-stat-icon">{s.icon}</div>
                  <div className="pg-stat-val">{s.value}</div>
                  <div className="pg-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Points breakdown */}
          <div className="card">
            <h3 className="card-title">Points Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'From DSA Problems',  pts: solvedProblems.length * 10, icon: '💻', color: '#6366f1' },
                { label: 'From Aptitude',      pts: aptitudePassed * 8,         icon: '🧮', color: '#f59e0b' },
                { label: 'From Roadmap Topics',pts: completedTopics * 8,        icon: '🗺️', color: '#10b981' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{row.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{row.label}</div>
                    <div className="pg-bar-track">
                      <div className="pg-bar-fill" style={{
                        width: points ? `${Math.min((row.pts / points) * 100, 100)}%` : '0%',
                        background: row.color,
                      }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color, minWidth: 40, textAlign: 'right' }}>
                    {row.pts}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Total Points</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{points} ⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Roadmap Phases ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 16 }}>Roadmap Phase Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {phaseStats.map(p => (
            <div key={p.id} className={`pg-phase-card${p.pct === 100 ? ' done' : ''}`}
              onClick={() => navigate('/roadmap')} style={{ cursor: 'pointer' }}>
              <div className="pg-phase-top">
                <div className="pg-phase-num">Phase {p.id}</div>
                {p.pct === 100 && <span className="pg-phase-badge">✓ Done</span>}
              </div>
              <div className="pg-phase-title">{p.title}</div>
              <div className="pg-bar-track" style={{ margin: '10px 0 6px' }}>
                <div className="pg-bar-fill" style={{
                  width: `${p.pct}%`,
                  background: p.pct === 100 ? '#10b981' : '#6366f1',
                }} />
              </div>
              <div className="pg-phase-foot">
                <span>{p.done}/{p.topics.length} topics</span>
                <span style={{ fontWeight: 700, color: p.pct === 100 ? '#10b981' : 'var(--primary)' }}>{p.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Milestones ── */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>
          Milestones
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 10 }}>
            {milestones.filter(m => m.unlocked).length}/{milestones.length} unlocked
          </span>
        </h3>
        <div className="pg-milestones">
          {milestones.map(m => <Milestone key={m.label} {...m} />)}
        </div>
      </div>
    </div>
  )
}