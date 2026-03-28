import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { ROADMAP_PHASES } from '../data/appData'

const LEVELS = [
  { min: 0,    max: 99,   name: 'Rookie',   color: '#94a3b8', next: 100  },
  { min: 100,  max: 299,  name: 'Explorer', color: '#10b981', next: 300  },
  { min: 300,  max: 599,  name: 'Coder',    color: '#6366f1', next: 600  },
  { min: 600,  max: 999,  name: 'Ninja',    color: '#8b5cf6', next: 1000 },
  { min: 1000, max: Infinity, name: 'Master', color: '#f59e0b', next: null },
]
const getLvl = pts => LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0]

const CAT_COLORS = {
  Arrays: '#6366f1', Strings: '#8b5cf6', Recursion: '#ec4899',
  'Linked Lists': '#f59e0b', Stacks: '#10b981', Queues: '#06b6d4',
}
const CAT_ICONS = {
  Arrays: '📊', Strings: '🔤', Recursion: '🔄',
  'Linked Lists': '🔗', Stacks: '📚', Queues: '🎯',
}

function SkillBar({ label, sub, pct, color, icon, onClick }) {
  return (
    <div className="pr-skill-row" onClick={onClick}>
      <div className="pr-skill-icon" style={{ background: color + '18' }}>{icon}</div>
      <div className="pr-skill-info">
        <div className="pr-skill-top-row">
          <span className="pr-skill-name">{label}</span>
          <span className="pr-skill-pct" style={{ color }}>{pct}%</span>
        </div>
        <div className="pr-skill-track">
          <div className="pr-skill-fill"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
        </div>
        <div className="pr-skill-sub">{sub}</div>
      </div>
    </div>
  )
}

export default function Progress() {
  const navigate = useNavigate()
  const { progress, solvedProblems, streak, points, dailyTasks, quizAttempts } = useApp()
  const { aptitudeTopics, codingProblems } = useContent()

  const TOTAL_PROBLEMS  = codingProblems.length || 1
  const TOTAL_TOPICS    = ROADMAP_PHASES.reduce((a, p) => a + p.topics.length, 0)
  const completedTopics = progress.completedTopics?.length ?? 0
  const tasksToday      = [dailyTasks.coding, dailyTasks.aptitude, dailyTasks.revision].filter(Boolean).length
  const activeDays      = streak.history?.length ?? 0

  const aptitudePassed = aptitudeTopics.filter(t => {
    const best = (quizAttempts[t.id] || []).reduce((b, a) => a.score > (b?.score ?? -1) ? a : b, null)
    return best && best.score >= 60
  }).length
  const aptitudePct = aptitudeTopics.length ? Math.round((aptitudePassed / aptitudeTopics.length) * 100) : 0
  const dsaPct      = Math.round((solvedProblems.length / TOTAL_PROBLEMS) * 100)
  const roadmapPct  = TOTAL_TOPICS ? Math.round((completedTopics / TOTAL_TOPICS) * 100) : 0
  const overallPct  = Math.round((dsaPct + aptitudePct + roadmapPct) / 3)

  const categoryStats = ['Arrays', 'Strings', 'Recursion', 'Linked Lists', 'Stacks', 'Queues'].map(cat => {
    const total  = codingProblems.filter(p => p.category === cat).length
    const solved = codingProblems.filter(p => p.category === cat && solvedProblems.includes(p.id)).length
    return { cat, solved, total, pct: total ? Math.round((solved / total) * 100) : 0 }
  })

  const phaseStats = ROADMAP_PHASES.map(phase => {
    const done = phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length
    return { ...phase, done, pct: Math.round((done / phase.topics.length) * 100) }
  })

  // Level / XP
  const level    = getLvl(points)
  const nextLvl  = LEVELS[LEVELS.findIndex(l => l.name === level.name) + 1]
  const xpIn     = points - level.min
  const xpNeeded = (nextLvl?.min ?? level.min + 100) - level.min
  const xpPct    = Math.min(Math.round((xpIn / xpNeeded) * 100), 100)

  const milestones = [
    { icon: '🌱', label: 'First Step',   desc: 'Solve your first problem',  unlocked: solvedProblems.length >= 1 },
    { icon: '🔥', label: '7-Day Streak', desc: 'Maintain a 7-day streak',   unlocked: streak.count >= 7 },
    { icon: '💯', label: 'Century',      desc: 'Earn 100 points',           unlocked: points >= 100 },
    { icon: '🧠', label: 'DSA Explorer', desc: 'Solve 10 problems',         unlocked: solvedProblems.length >= 10 },
    { icon: '📖', label: 'Phase Master', desc: 'Complete a roadmap phase',  unlocked: phaseStats.some(p => p.pct === 100) },
    { icon: '⚡', label: 'Speed Demon',  desc: '30-day streak',             unlocked: streak.count >= 30 },
    { icon: '🏆', label: 'Half Century', desc: 'Solve 50 problems',         unlocked: solvedProblems.length >= 50 },
    { icon: '🎯', label: 'Quiz Master',  desc: 'Pass 5 aptitude topics',    unlocked: aptitudePassed >= 5 },
  ]
  const unlockedCount = milestones.filter(m => m.unlocked).length

  return (
    <div className="pr-root">

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <div className="pr-hero">
        {/* Background decorative rings */}
        <div className="pr-hero-ring-lg" />
        <div className="pr-hero-ring-sm" />

        <div className="pr-hero-body">
          {/* Left: identity */}
          <div className="pr-hero-left">
            <div className="pr-hero-eyebrow">Learning Progress</div>
            <h1 className="pr-hero-title">My Journey</h1>
            <div className="pr-hero-level" style={{ background: level.color + '30', borderColor: level.color + '60', color: '#fff' }}>
              <span className="pr-level-dot" style={{ background: level.color }} />
              {level.name}
            </div>
          </div>

          {/* Center: overall ring */}
          <div className="pr-hero-center">
            <div className="pr-overall-ring">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="9" />
                <circle cx="55" cy="55" r="46" fill="none" stroke="#fff" strokeWidth="9"
                  strokeDasharray={`${2 * Math.PI * 46 * overallPct / 100} ${2 * Math.PI * 46}`}
                  strokeLinecap="round" transform="rotate(-90 55 55)"
                  style={{ transition: 'stroke-dasharray .8s ease' }} />
              </svg>
              <div className="pr-overall-label">
                <div className="pr-overall-pct">{overallPct}%</div>
                <div className="pr-overall-sub">Overall</div>
              </div>
            </div>
          </div>

          {/* Right: stats */}
          <div className="pr-hero-right">
            {[
              { v: solvedProblems.length, l: 'Problems Solved', c: '#a5b4fc' },
              { v: completedTopics,       l: 'Topics Done',     c: '#6ee7b7' },
              { v: streak.count,          l: 'Day Streak 🔥',   c: '#fcd34d' },
              { v: points,               l: 'Total XP ⭐',     c: '#f9a8d4' },
            ].map(s => (
              <div key={s.l} className="pr-hstat">
                <div className="pr-hstat-val" style={{ color: s.c }}>{s.v}</div>
                <div className="pr-hstat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* XP progress bar */}
        {nextLvl && (
          <div className="pr-xp-row">
            <span className="pr-xp-cur">{level.name}</span>
            <div className="pr-xp-bar-wrap">
              <div className="pr-xp-bar" style={{ width: `${xpPct}%` }} />
            </div>
            <span className="pr-xp-next">{nextLvl.name} ({nextLvl.min - points} XP away)</span>
          </div>
        )}
        {!nextLvl && (
          <div className="pr-xp-row">
            <span className="pr-xp-cur" style={{ color: '#fcd34d' }}>🏆 Maximum level reached!</span>
          </div>
        )}
      </div>

      {/* ══ SKILLS ════════════════════════════════════════════════════ */}
      <div className="pr-section">
        <div className="pr-section-head">
          <h3 className="pr-section-title">Skills Overview</h3>
          <span className="pr-section-sub">Click any skill to practice</span>
        </div>
        <div className="pr-card pr-skills-card">
          <SkillBar label="DSA Problems"  icon="💻" color="#6366f1"
            pct={dsaPct}      sub={`${solvedProblems.length} of ${TOTAL_PROBLEMS} problems solved`}
            onClick={() => navigate('/coding-practice')} />
          <SkillBar label="Aptitude"      icon="🧮" color="#f59e0b"
            pct={aptitudePct} sub={`${aptitudePassed} of ${aptitudeTopics.length} topics passed`}
            onClick={() => navigate('/aptitude-training')} />
          <SkillBar label="Roadmap"       icon="🗺️" color="#10b981"
            pct={roadmapPct}  sub={`${completedTopics} of ${TOTAL_TOPICS} topics completed`}
            onClick={() => navigate('/roadmap')} />
          <SkillBar label="Daily Tasks"   icon="⚡" color="#8b5cf6"
            pct={Math.round((tasksToday / 3) * 100)}
            sub={`${tasksToday} of 3 tasks done today`}
            onClick={() => navigate('/practice/daily')} />
        </div>
      </div>

      {/* ══ 2-COL ROW ═════════════════════════════════════════════════ */}
      <div className="pr-two-col">

        {/* DSA Categories */}
        <div>
          <div className="pr-section-head">
            <h3 className="pr-section-title">DSA Categories</h3>
            <span className="pr-badge-chip">{solvedProblems.length} / {TOTAL_PROBLEMS}</span>
          </div>
          <div className="pr-card">
            <div className="pr-cats-grid">
              {categoryStats.map(s => {
                const color = s.pct === 100 ? '#10b981' : CAT_COLORS[s.cat]
                return (
                  <div key={s.cat} className={`pr-cat${s.pct === 100 ? ' done' : ''}`}
                    style={{ '--cc': color }}>
                    <div className="pr-cat-header">
                      <span className="pr-cat-icon" style={{ background: color + '18' }}>{CAT_ICONS[s.cat]}</span>
                      {s.pct === 100 && <span className="pr-cat-done-chip">✓</span>}
                    </div>
                    <div className="pr-cat-name">{s.cat}</div>
                    <div className="pr-cat-pct" style={{ color }}>{s.pct}%</div>
                    <div className="pr-cat-track">
                      <div className="pr-cat-fill" style={{ width: `${s.pct}%`, background: color }} />
                    </div>
                    <div className="pr-cat-count">{s.solved} / {s.total}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Activity + Points */}
        <div className="pr-right-col">
          {/* Activity */}
          <div>
            <div className="pr-section-head">
              <h3 className="pr-section-title">Activity</h3>
              <span className="pr-badge-chip">{activeDays} days active</span>
            </div>
            <div className="pr-card pr-activity-card">
              <div className="pr-week-row">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date()
                  d.setDate(d.getDate() - (6 - i))
                  const active = streak.history?.includes(d.toDateString())
                  return (
                    <div key={i} className="pr-day">
                      <div className={`pr-day-dot${active ? ' on' : ''}`} />
                      <div className="pr-day-lbl">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()]}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="pr-streak-row">
                <div className="pr-streak-item">
                  <span className="pr-streak-num" style={{ color: '#f59e0b' }}>{streak.count}</span>
                  <span className="pr-streak-lbl">Current Streak 🔥</span>
                </div>
                <div className="pr-streak-divider" />
                <div className="pr-streak-item">
                  <span className="pr-streak-num" style={{ color: '#10b981' }}>{streak.best ?? streak.count}</span>
                  <span className="pr-streak-lbl">Best Streak 🏅</span>
                </div>
              </div>
              <div className="pr-tasks-row">
                {[
                  { label: 'Coding',    done: dailyTasks.coding },
                  { label: 'Aptitude',  done: dailyTasks.aptitude },
                  { label: 'Revision',  done: dailyTasks.revision },
                ].map(t => (
                  <div key={t.label} className={`pr-task-chip${t.done ? ' done' : ''}`}>
                    {t.done ? '✓' : '○'} {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Points */}
          <div>
            <div className="pr-section-head">
              <h3 className="pr-section-title">Points Breakdown</h3>
              <span className="pr-badge-chip" style={{ color: 'var(--primary)', background: 'var(--primary-light)', borderColor: '#c7d2fe' }}>
                {points} ⭐ total
              </span>
            </div>
            <div className="pr-card pr-pts-card">
              {[
                { label: 'DSA Problems',   pts: solvedProblems.length * 10, color: '#6366f1', icon: '💻' },
                { label: 'Aptitude Quiz',  pts: aptitudePassed * 8,         color: '#f59e0b', icon: '🧮' },
                { label: 'Roadmap Topics', pts: completedTopics * 8,        color: '#10b981', icon: '🗺️' },
              ].map(row => (
                <div key={row.label} className="pr-pts-row">
                  <div className="pr-pts-icon" style={{ background: row.color + '18' }}>{row.icon}</div>
                  <div className="pr-pts-bar-group">
                    <div className="pr-pts-label">{row.label}</div>
                    <div className="pr-pts-track">
                      <div className="pr-pts-fill" style={{
                        width: points ? `${Math.min((row.pts / points) * 100, 100)}%` : '0%',
                        background: `linear-gradient(90deg, ${row.color}, ${row.color}bb)`,
                      }} />
                    </div>
                  </div>
                  <span className="pr-pts-val" style={{ color: row.color }}>{row.pts}</span>
                </div>
              ))}
              <div className="pr-pts-total">
                <span>Total</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 18 }}>{points} ⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ACHIEVEMENTS ══════════════════════════════════════════════ */}
      <div className="pr-section">
        <div className="pr-section-head">
          <h3 className="pr-section-title">Achievements</h3>
          <span className="pr-badge-chip" style={{ color: '#f59e0b', background: '#fef3c7', borderColor: '#fde68a' }}>
            🏅 {unlockedCount} / {milestones.length} unlocked
          </span>
        </div>
        <div className="pr-ach-grid">
          {milestones.map(m => (
            <div key={m.label} className={`pr-ach${m.unlocked ? ' unlocked' : ''}`}>
              <div className="pr-ach-icon-wrap">
                <span className="pr-ach-icon">{m.icon}</span>
              </div>
              <div className="pr-ach-name">{m.label}</div>
              <div className="pr-ach-desc">{m.desc}</div>
              {m.unlocked
                ? <div className="pr-ach-earned">Earned ✓</div>
                : <div className="pr-ach-locked">🔒 Locked</div>
              }
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}