import { useState } from 'react'
import { useApp } from '../context/AppContext'

const YEARS    = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = ['Computer Science', 'Information Technology', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS    = ['Product Company (FAANG/Unicorn)', 'Service Company (TCS/Infosys/Wipro)', 'Startup', 'Higher Studies']
const SKILL_SUGGESTIONS = ['Python', 'Java', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL', 'DSA', 'Machine Learning', 'Git', 'HTML/CSS', 'TypeScript', 'MongoDB', 'AWS', 'Docker']

const RANK_TIERS = [
  { name: 'Rookie',   min: 0,    icon: '🎮', color: '#64748b', bg: 'rgba(100,116,139,.15)', glow: 'rgba(100,116,139,.3)', next: 100  },
  { name: 'Bronze',   min: 100,  icon: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,.12)',  glow: 'rgba(205,127,50,.35)', next: 300  },
  { name: 'Silver',   min: 300,  icon: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,.12)', glow: 'rgba(148,163,184,.3)', next: 600  },
  { name: 'Gold',     min: 600,  icon: '🏆', color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  glow: 'rgba(245,158,11,.4)',  next: 1000 },
  { name: 'Platinum', min: 1000, icon: '💜', color: '#a78bfa', bg: 'rgba(167,139,250,.12)', glow: 'rgba(167,139,250,.4)', next: 2000 },
  { name: 'Diamond',  min: 2000, icon: '💎', color: '#06b6d4', bg: 'rgba(6,182,212,.12)',   glow: 'rgba(6,182,212,.4)',   next: null },
]

const RARITY = {
  common:    { color: '#94a3b8', bg: 'rgba(148,163,184,.08)',  border: 'rgba(148,163,184,.2)',  label: 'Common'    },
  rare:      { color: '#3b82f6', bg: 'rgba(59,130,246,.08)',   border: 'rgba(59,130,246,.25)',  label: 'Rare'      },
  epic:      { color: '#8b5cf6', bg: 'rgba(139,92,246,.08)',   border: 'rgba(139,92,246,.25)',  label: 'Epic'      },
  legendary: { color: '#f59e0b', bg: 'rgba(245,158,11,.08)',   border: 'rgba(245,158,11,.3)',   label: 'Legendary' },
}

function getRank(pts) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (pts >= RANK_TIERS[i].min) return RANK_TIERS[i]
  }
  return RANK_TIERS[0]
}

function Card({ title, icon, children, action }) {
  return (
    <div className="gpf-card">
      <div className="gpf-card-hdr">
        <div className="gpf-card-hdr-left">
          <span className="gpf-card-icon">{icon}</span>
          <span className="gpf-card-title">{title}</span>
        </div>
        {action}
      </div>
      <div className="gpf-card-body">{children}</div>
    </div>
  )
}

function EditBtn({ onClick }) {
  return <button className="gpf-edit-btn" onClick={onClick}>✏️ Edit</button>
}

export default function Profile() {
  const { user, points, streak, progress, solvedProblems, quizAttempts, updateProfile } = useApp()

  const [editSection, setEditSection] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const [aboutForm,    setAboutForm]    = useState({ name: user?.name || '', college: user?.college || '', branch: user?.branch || '', yearOfStudy: user?.yearOfStudy || '', bio: user?.bio || '', phone: user?.phone || '' })
  const [skillInput,   setSkillInput]   = useState('')
  const [skillsForm,   setSkillsForm]   = useState(user?.skills || [])
  const [projectsForm, setProjectsForm] = useState(user?.projects || [])
  const [careerForm,   setCareerForm]   = useState({ careerGoal: user?.careerGoal || '', dreamCompany: user?.dreamCompany || '', openToInternship: user?.openToInternship ?? true })
  const [socialForm,   setSocialForm]   = useState({ linkedin: user?.linkedin || '', github: user?.github || '', twitter: user?.twitter || '', website: user?.website || '' })

  const isComplete = !!(user?.name && user?.college && user?.branch && user?.yearOfStudy && user?.careerGoal)

  // ── XP / Level / Rank ──────────────────────────────────────────────────────
  const level     = Math.max(1, Math.floor(points / 50) + 1)
  const xpInLevel = points % 50
  const xpPct     = Math.round((xpInLevel / 50) * 100)
  const rank      = getRank(points)
  const nextRank  = RANK_TIERS.find(r => r.min > points) || null

  // ── All achievements (locked + unlocked) ───────────────────────────────────
  const ALL_ACHIEVEMENTS = [
    { icon: '💻', title: 'First Blood',    desc: 'Solve your first problem',       rarity: 'common',    unlocked: solvedProblems.length >= 1 },
    { icon: '🔥', title: 'Problem Slayer', desc: 'Solve 5 problems',               rarity: 'common',    unlocked: solvedProblems.length >= 5 },
    { icon: '⚔️', title: 'Code Warrior',  desc: 'Solve 10 problems',              rarity: 'rare',      unlocked: solvedProblems.length >= 10 },
    { icon: '🏆', title: 'Code Champion',  desc: 'Solve 25 problems',              rarity: 'epic',      unlocked: solvedProblems.length >= 25 },
    { icon: '⚡', title: 'On a Roll',      desc: '3-day practice streak',          rarity: 'common',    unlocked: streak.count >= 3 },
    { icon: '🌟', title: 'Streak Master',  desc: '7-day streak',                   rarity: 'rare',      unlocked: streak.count >= 7 },
    { icon: '👑', title: 'Unstoppable',    desc: '30-day streak',                  rarity: 'legendary', unlocked: streak.count >= 30 },
    { icon: '🎯', title: 'XP Starter',     desc: 'Earn 50 XP',                     rarity: 'common',    unlocked: points >= 50 },
    { icon: '💎', title: 'Century Club',   desc: 'Earn 100 XP',                    rarity: 'rare',      unlocked: points >= 100 },
    { icon: '🚀', title: 'XP Hunter',      desc: 'Earn 500 XP',                    rarity: 'epic',      unlocked: points >= 500 },
    { icon: '⭐', title: 'Elite Player',   desc: 'Earn 1000 XP',                   rarity: 'legendary', unlocked: points >= 1000 },
    { icon: '🧮', title: 'Quiz Taker',     desc: 'Attempt an aptitude quiz',       rarity: 'common',    unlocked: Object.values(quizAttempts).some(a => a?.length > 0) },
    { icon: '✅', title: 'Profile Pro',    desc: 'Complete your profile (+50 XP)', rarity: 'rare',      unlocked: isComplete },
    { icon: '🗺️', title: 'Pathfinder',    desc: '50% roadmap complete',           rarity: 'epic',      unlocked: progress.roadmap >= 50 },
    { icon: '🌍', title: 'Road Master',    desc: '100% roadmap complete',          rarity: 'legendary', unlocked: progress.roadmap >= 100 },
  ]
  const unlockedCount = ALL_ACHIEVEMENTS.filter(a => a.unlocked).length

  // ── Helpers ────────────────────────────────────────────────────────────────
  const save = async (data) => {
    setSaving(true)
    try {
      await updateProfile({ ...data, photoURL: user?.photoURL || '' })
      setEditSection(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  const addSkill    = (s) => { const t = s.trim(); if (t && !skillsForm.includes(t)) setSkillsForm(p => [...p, t]); setSkillInput('') }
  const removeSkill = (s) => setSkillsForm(p => p.filter(x => x !== s))

  const blankProject  = () => ({ id: Date.now(), title: '', desc: '', tech: '', link: '' })
  const addProject    = () => setProjectsForm(p => [...p, blankProject()])
  const setProject    = (id, k, v) => setProjectsForm(p => p.map(x => x.id === id ? { ...x, [k]: v } : x))
  const removeProject = (id) => setProjectsForm(p => p.filter(x => x.id !== id))

  return (
    <div className="gpf-page">

      {/* ══ PLAYER CARD HERO ══════════════════════════════════════════════════ */}
      <div className="gpf-hero" style={{ '--rank-color': rank.color, '--rank-glow': rank.glow }}>

        {/* Left: avatar + identity */}
        <div className="gpf-hero-left">
          <div className="gpf-avatar-wrap">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="gpf-avatar-img" referrerPolicy="no-referrer" />
              : <div className="gpf-avatar-fallback">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
            }
            <div className="gpf-rank-pip" style={{ background: rank.bg, color: rank.color, borderColor: rank.color }}>
              {rank.icon} {rank.name}
            </div>
          </div>

          <div className="gpf-hero-info">
            <div className="gpf-player-name">{user?.name || 'Your Name'}</div>
            <div className="gpf-player-sub">
              {[user?.college, user?.branch, user?.yearOfStudy].filter(Boolean).join(' · ') || 'Complete your profile to get started'}
            </div>

            {/* XP bar */}
            <div className="gpf-xp-row">
              <span className="gpf-level-badge" style={{ color: rank.color, borderColor: rank.color, background: rank.bg }}>
                Lv.{level}
              </span>
              <div className="gpf-xp-track">
                <div className="gpf-xp-fill" style={{ width: `${xpPct}%`, background: rank.color, boxShadow: `0 0 8px ${rank.color}` }} />
              </div>
              <span className="gpf-xp-text">{xpInLevel}<span>/50 XP</span></span>
            </div>

            {/* Next rank teaser */}
            <div className="gpf-rank-row">
              {nextRank
                ? <span className="gpf-next-rank-hint">🎯 {nextRank.min - points} XP to reach {nextRank.icon} {nextRank.name}</span>
                : <span className="gpf-max-rank">👑 MAX RANK ACHIEVED</span>
              }
              {user?.careerGoal && <span className="gpf-career-chip">🎯 {user.careerGoal}</span>}
            </div>
          </div>
        </div>

        {/* Right: stat counters */}
        <div className="gpf-hero-stats">
          {[
            { icon: '⚡', val: points,                lbl: 'Total XP',  color: rank.color   },
            { icon: '📊', val: `Lv.${level}`,         lbl: 'Level',     color: '#818cf8'    },
            { icon: '🔥', val: streak.count,           lbl: 'Streak',    color: '#f59e0b'    },
            { icon: '💻', val: solvedProblems.length,  lbl: 'Solved',    color: '#10b981'    },
            { icon: '🏅', val: `${unlockedCount}/${ALL_ACHIEVEMENTS.length}`, lbl: 'Badges', color: '#a78bfa' },
          ].map(s => (
            <div key={s.lbl} className="gpf-stat-box">
              <div className="gpf-stat-icon">{s.icon}</div>
              <div className="gpf-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="gpf-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {saved && <div className="gpf-toast">✅ Profile saved! XP synced.</div>}

      {/* ══ MAIN GRID ══════════════════════════════════════════════════════════ */}
      <div className="gpf-grid">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="gpf-col">

          {/* Character Info */}
          <Card title="Character Info" icon="👤" action={editSection !== 'about' && <EditBtn onClick={() => setEditSection('about')} />}>
            {editSection === 'about' ? (
              <form onSubmit={e => { e.preventDefault(); save({ ...user, ...aboutForm, skills: skillsForm, projects: projectsForm, ...careerForm, ...socialForm }) }} className="gpf-form">
                <div className="gpf-form-row">
                  <div className="gpf-fg"><label>Full Name *</label><input value={aboutForm.name} onChange={e => setAboutForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Sharma" required /></div>
                  <div className="gpf-fg"><label>Phone</label><input value={aboutForm.phone} onChange={e => setAboutForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" /></div>
                </div>
                <div className="gpf-form-row">
                  <div className="gpf-fg"><label>College *</label><input value={aboutForm.college} onChange={e => setAboutForm(f => ({ ...f, college: e.target.value }))} placeholder="VIT Vellore" required /></div>
                  <div className="gpf-fg"><label>Branch *</label>
                    <select value={aboutForm.branch} onChange={e => setAboutForm(f => ({ ...f, branch: e.target.value }))} required>
                      <option value="">Select branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="gpf-fg"><label>Year *</label>
                  <select value={aboutForm.yearOfStudy} onChange={e => setAboutForm(f => ({ ...f, yearOfStudy: e.target.value }))} required>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="gpf-fg"><label>Bio <span className="gpf-opt">(optional)</span></label>
                  <textarea value={aboutForm.bio} onChange={e => setAboutForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} />
                </div>
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="gpf-info-grid">
                {[
                  { l: 'Name', v: user?.name }, { l: 'Email', v: user?.email },
                  { l: 'Phone', v: user?.phone }, { l: 'College', v: user?.college },
                  { l: 'Branch', v: user?.branch }, { l: 'Year', v: user?.yearOfStudy },
                ].map(f => (
                  <div key={f.l} className="gpf-info-row">
                    <span className="gpf-info-lbl">{f.l}</span>
                    <span className={`gpf-info-val${!f.v ? ' gpf-empty' : ''}`}>{f.v || '—'}</span>
                  </div>
                ))}
                {user?.bio && <div className="gpf-bio-quote">"{user.bio}"</div>}
              </div>
            )}
          </Card>

          {/* Skill Tree */}
          <Card title="Skill Tree" icon="⚡" action={editSection !== 'skills' && <EditBtn onClick={() => setEditSection('skills')} />}>
            {editSection === 'skills' ? (
              <div className="gpf-form">
                <div className="gpf-skill-input-row">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                    placeholder="Type a skill and press Enter" className="gpf-skill-input" />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addSkill(skillInput)}>Add</button>
                </div>
                <div className="gpf-suggest-row">
                  {SKILL_SUGGESTIONS.filter(s => !skillsForm.includes(s)).map(s => (
                    <button key={s} type="button" className="gpf-suggest-chip" onClick={() => addSkill(s)}>+ {s}</button>
                  ))}
                </div>
                <div className="gpf-tags-list">
                  {skillsForm.map(s => (
                    <span key={s} className="gpf-skill-tag gpf-skill-tag--edit">{s}<button onClick={() => removeSkill(s)}>×</button></span>
                  ))}
                </div>
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => save({ ...user, skills: skillsForm })}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <div className="gpf-tags-list">
                {(user?.skills || []).length > 0
                  ? user.skills.map(s => <span key={s} className="gpf-skill-tag">{s}</span>)
                  : <span className="gpf-empty">No skills unlocked yet — add some!</span>
                }
              </div>
            )}
          </Card>

          {/* Quest Log (Projects) */}
          <Card title="Quest Log" icon="🚀" action={editSection !== 'projects' && <EditBtn onClick={() => setEditSection('projects')} />}>
            {editSection === 'projects' ? (
              <div className="gpf-form">
                {projectsForm.map((p, i) => (
                  <div key={p.id} className="gpf-proj-edit">
                    <div className="gpf-proj-edit-hdr">
                      <span className="gpf-proj-num">Quest {i + 1}</span>
                      <button type="button" className="gpf-remove-btn" onClick={() => removeProject(p.id)}>Remove</button>
                    </div>
                    <div className="gpf-form-row">
                      <div className="gpf-fg"><label>Title</label><input value={p.title} onChange={e => setProject(p.id, 'title', e.target.value)} placeholder="My Project" /></div>
                      <div className="gpf-fg"><label>Tech Stack</label><input value={p.tech} onChange={e => setProject(p.id, 'tech', e.target.value)} placeholder="React, Node.js" /></div>
                    </div>
                    <div className="gpf-fg"><label>Description</label>
                      <textarea value={p.desc} onChange={e => setProject(p.id, 'desc', e.target.value)} placeholder="What does it do?" rows={2} />
                    </div>
                    <div className="gpf-fg"><label>Link (GitHub / Live)</label>
                      <input value={p.link} onChange={e => setProject(p.id, 'link', e.target.value)} placeholder="github.com/..." />
                    </div>
                  </div>
                ))}
                <button type="button" className="gpf-add-quest-btn" onClick={addProject}>+ Add Quest</button>
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => save({ ...user, projects: projectsForm })}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <div className="gpf-projects-list">
                {(user?.projects || []).length > 0 ? user.projects.map(p => (
                  <div key={p.id} className="gpf-project-card">
                    <div className="gpf-project-top">
                      <div className="gpf-project-title">{p.title}</div>
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="gpf-project-link">↗ View</a>}
                    </div>
                    {p.desc && <div className="gpf-project-desc">{p.desc}</div>}
                    {p.tech && <div className="gpf-tech-row">{p.tech.split(',').map(t => <span key={t} className="gpf-tech-chip">{t.trim()}</span>)}</div>}
                  </div>
                )) : <span className="gpf-empty">No quests logged yet — add a project!</span>}
              </div>
            )}
          </Card>

        </div>

        {/* ── RIGHT COLUMN ──────────────────────────────────────────────────── */}
        <div className="gpf-col">

          {/* Achievements */}
          <Card title={`Achievements · ${unlockedCount} / ${ALL_ACHIEVEMENTS.length} Unlocked`} icon="🏆">
            <div className="gpf-badges-grid">
              {ALL_ACHIEVEMENTS.map((a, i) => {
                const rc = RARITY[a.rarity]
                return (
                  <div key={i}
                    className={`gpf-badge ${a.unlocked ? 'gpf-badge--unlocked' : 'gpf-badge--locked'}`}
                    style={a.unlocked ? { background: rc.bg, borderColor: rc.border } : {}}>
                    <div className="gpf-badge-icon">{a.unlocked ? a.icon : '🔒'}</div>
                    <div className="gpf-badge-title" style={a.unlocked ? { color: rc.color } : {}}>{a.title}</div>
                    <div className="gpf-badge-desc">{a.desc}</div>
                    {a.unlocked && <div className="gpf-badge-rarity" style={{ color: rc.color }}>{rc.label}</div>}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Player Stats */}
          <Card title="Player Stats" icon="📊">
            <div className="gpf-stats-grid">
              {[
                { icon: '⚡', val: points,                  lbl: 'Total XP',       color: '#818cf8' },
                { icon: '🔥', val: streak.count,            lbl: 'Day Streak',     color: '#f59e0b' },
                { icon: '💻', val: solvedProblems.length,   lbl: 'Problems Solved',color: '#10b981' },
                { icon: '🗺️', val: `${progress.roadmap||0}%`, lbl: 'Roadmap',     color: '#8b5cf6' },
                { icon: '🧮', val: Object.values(quizAttempts).filter(a => a?.some(x => x.score >= 60)).length, lbl: 'Quizzes Passed', color: '#06b6d4' },
                { icon: '🏅', val: unlockedCount,           lbl: 'Badges Earned',  color: '#f59e0b' },
              ].map(s => (
                <div key={s.lbl} className="gpf-stat-card">
                  <div className="gpf-stat-card-icon">{s.icon}</div>
                  <div className="gpf-stat-card-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="gpf-stat-card-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Mission Objective (Career) */}
          <Card title="Mission Objective" icon="🎯" action={editSection !== 'career' && <EditBtn onClick={() => setEditSection('career')} />}>
            {editSection === 'career' ? (
              <form onSubmit={e => { e.preventDefault(); save({ ...user, ...careerForm }) }} className="gpf-form">
                <div className="gpf-fg"><label>Career Goal *</label>
                  <select value={careerForm.careerGoal} onChange={e => setCareerForm(f => ({ ...f, careerGoal: e.target.value }))} required>
                    <option value="">Select goal</option>
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="gpf-fg"><label>Dream Company <span className="gpf-opt">(optional)</span></label>
                  <input value={careerForm.dreamCompany} onChange={e => setCareerForm(f => ({ ...f, dreamCompany: e.target.value }))} placeholder="Google, Microsoft, Zepto…" />
                </div>
                <div className="gpf-fg gpf-checkbox-row">
                  <input type="checkbox" id="intern" checked={careerForm.openToInternship} onChange={e => setCareerForm(f => ({ ...f, openToInternship: e.target.checked }))} />
                  <label htmlFor="intern">Open to Internship Opportunities</label>
                </div>
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="gpf-career-view">
                <div className="gpf-career-row"><span className="gpf-career-lbl">Goal</span><span className={`gpf-career-val${!user?.careerGoal ? ' gpf-empty' : ''}`}>{user?.careerGoal || '—'}</span></div>
                {user?.dreamCompany && <div className="gpf-career-row"><span className="gpf-career-lbl">Dream Co.</span><span className="gpf-career-val">⭐ {user.dreamCompany}</span></div>}
                <div className="gpf-career-row">
                  <span className="gpf-career-lbl">Internship</span>
                  <span className="gpf-career-val">
                    {user?.openToInternship !== false
                      ? <span className="gpf-open-chip">✅ Open</span>
                      : <span className="gpf-closed-chip">Not looking</span>}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Social Links */}
          <Card title="Social Links" icon="🔗" action={editSection !== 'social' && <EditBtn onClick={() => setEditSection('social')} />}>
            {editSection === 'social' ? (
              <form onSubmit={e => { e.preventDefault(); save({ ...user, ...socialForm }) }} className="gpf-form">
                {[
                  { k: 'linkedin', label: 'LinkedIn',  placeholder: 'linkedin.com/in/yourname' },
                  { k: 'github',   label: 'GitHub',    placeholder: 'github.com/yourname' },
                  { k: 'twitter',  label: 'Twitter',   placeholder: 'twitter.com/yourname' },
                  { k: 'website',  label: 'Portfolio', placeholder: 'yoursite.com' },
                ].map(f => (
                  <div key={f.k} className="gpf-fg">
                    <label>{f.label}</label>
                    <input value={socialForm[f.k]} onChange={e => setSocialForm(s => ({ ...s, [f.k]: e.target.value }))} placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="gpf-social-list">
                {[
                  { k: 'linkedin', icon: '💼', label: 'LinkedIn' },
                  { k: 'github',   icon: '🐙', label: 'GitHub' },
                  { k: 'twitter',  icon: '🐦', label: 'Twitter' },
                  { k: 'website',  icon: '🌐', label: 'Website' },
                ].map(s => (
                  <div key={s.k} className="gpf-social-row">
                    <span className="gpf-social-icon">{s.icon}</span>
                    {user?.[s.k]
                      ? <a href={user[s.k].startsWith('http') ? user[s.k] : `https://${user[s.k]}`} target="_blank" rel="noreferrer" className="gpf-social-link">{user[s.k]}</a>
                      : <span className="gpf-empty">{s.label} not added</span>
                    }
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  )
}
