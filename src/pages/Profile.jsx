import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import { ROADMAP_PHASES } from '../data/appData'
import BadgeModal from '../components/BadgeModal'

const YEARS    = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = ['Computer Science', 'Information Technology', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS    = ['Product Company (FAANG/Unicorn)', 'Service Company (TCS/Infosys/Wipro)', 'Startup', 'Higher Studies']
const SKILL_SUGGESTIONS = ['Python', 'Java', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL', 'DSA', 'Machine Learning', 'Git', 'HTML/CSS', 'TypeScript', 'MongoDB', 'AWS', 'Docker']

// Assessment levels (from assessment result)
const LEVEL_STYLES = {
  Rookie:   { icon: '🎮', color: '#64748b', bg: 'rgba(100,116,139,.15)', glow: 'rgba(100,116,139,.25)' },
  Explorer: { icon: '🧭', color: '#3b82f6', bg: 'rgba(59,130,246,.12)',  glow: 'rgba(59,130,246,.3)'  },
  Coder:    { icon: '💻', color: '#8b5cf6', bg: 'rgba(139,92,246,.12)',  glow: 'rgba(139,92,246,.35)' },
  Master:   { icon: '👑', color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  glow: 'rgba(245,158,11,.4)'  },
}
const LEVEL_ORDER = ['Rookie', 'Explorer', 'Coder', 'Master']

const RARITY = {
  common:    { color: '#94a3b8', bg: 'rgba(148,163,184,.08)', border: 'rgba(148,163,184,.2)',  label: 'C' },
  rare:      { color: '#3b82f6', bg: 'rgba(59,130,246,.08)',  border: 'rgba(59,130,246,.25)',  label: 'R' },
  epic:      { color: '#8b5cf6', bg: 'rgba(139,92,246,.08)',  border: 'rgba(139,92,246,.25)',  label: 'E' },
  legendary: { color: '#f59e0b', bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.28)',  label: 'L' },
}

function Card({ title, icon, children, action, noPad }) {
  return (
    <div className="gpf-card">
      <div className="gpf-card-hdr">
        <div className="gpf-card-hdr-left">
          <span className="gpf-card-icon">{icon}</span>
          <span className="gpf-card-title">{title}</span>
        </div>
        {action}
      </div>
      <div className={noPad ? '' : 'gpf-card-body'}>{children}</div>
    </div>
  )
}

function EditBtn({ onClick }) {
  return <button className="gpf-edit-btn" onClick={onClick}>✏️ Edit</button>
}

export default function Profile() {
  const { user, points, streak, progress, solvedProblems, quizAttempts, assessmentResult, updateProfile } = useApp()

  const [sharingBadge, setSharingBadge] = useState(null)
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

  const { aptitudeTopics } = useContent()
  const aptitudePassed = aptitudeTopics.filter(t => {
    const best = (quizAttempts[t.id] || []).reduce((b, a) => a.score > (b?.score ?? -1) ? a : b, null)
    return best && best.score >= 60
  }).length
  const phaseStats = ROADMAP_PHASES.map(phase => ({
    pct: Math.round((phase.topics.filter(t => progress.completedTopics?.includes(t.id)).length / phase.topics.length) * 100),
  }))

  const xpPerLevel = 50
  const xpInLvl    = points % xpPerLevel
  const xpPct      = Math.round((xpInLvl / xpPerLevel) * 100)

  const assessLevel = assessmentResult?.level || null
  const levelStyle  = LEVEL_STYLES[assessLevel] || LEVEL_STYLES['Rookie']
  const nextLevel   = assessLevel ? LEVEL_ORDER[LEVEL_ORDER.indexOf(assessLevel) + 1] || null : null

  const ALL_ACHIEVEMENTS = [
    { icon: '💻', title: 'First Blood',    desc: 'Solve your first problem', rarity: 'common',    unlocked: solvedProblems.length >= 1  },
    { icon: '🔥', title: 'Problem Slayer', desc: 'Solve 5 problems',         rarity: 'common',    unlocked: solvedProblems.length >= 5  },
    { icon: '⚔️', title: 'Code Warrior',  desc: 'Solve 10 problems',        rarity: 'rare',      unlocked: solvedProblems.length >= 10 },
    { icon: '🏆', title: 'Code Champ',     desc: 'Solve 25 problems',        rarity: 'epic',      unlocked: solvedProblems.length >= 25 },
    { icon: '🥇', title: 'Half Century',   desc: 'Solve 50 problems',        rarity: 'legendary', unlocked: solvedProblems.length >= 50 },
    { icon: '⚡', title: 'On a Roll',      desc: '3-day streak',             rarity: 'common',    unlocked: streak.count >= 3  },
    { icon: '🌟', title: 'Streak Master',  desc: '7-day streak',             rarity: 'rare',      unlocked: streak.count >= 7  },
    { icon: '👑', title: 'Unstoppable',    desc: '30-day streak',            rarity: 'legendary', unlocked: streak.count >= 30 },
    { icon: '🎯', title: 'XP Starter',     desc: 'Earn 50 XP',               rarity: 'common',    unlocked: points >= 50   },
    { icon: '💎', title: 'Century Club',   desc: 'Earn 100 XP',              rarity: 'rare',      unlocked: points >= 100  },
    { icon: '🚀', title: 'XP Hunter',      desc: 'Earn 500 XP',              rarity: 'epic',      unlocked: points >= 500  },
    { icon: '⭐', title: 'Elite Player',   desc: 'Earn 1000 XP',             rarity: 'legendary', unlocked: points >= 1000 },
    { icon: '🧮', title: 'Quiz Taker',     desc: 'Attempt a quiz',           rarity: 'common',    unlocked: Object.values(quizAttempts).some(a => a?.length > 0) },
    { icon: '🎓', title: 'Quiz Master',    desc: 'Pass 5 aptitude topics',   rarity: 'epic',      unlocked: aptitudePassed >= 5 },
    { icon: '✅', title: 'Profile Pro',    desc: 'Complete your profile',    rarity: 'rare',      unlocked: isComplete },
    { icon: '📖', title: 'Phase Master',   desc: 'Complete a roadmap phase', rarity: 'rare',      unlocked: phaseStats.some(p => p.pct === 100) },
    { icon: '🗺️', title: 'Pathfinder',    desc: '50% roadmap done',         rarity: 'epic',      unlocked: progress.roadmap >= 50  },
    { icon: '🌍', title: 'Road Master',    desc: '100% roadmap done',        rarity: 'legendary', unlocked: progress.roadmap >= 100 },
  ]
  const unlockedCount = ALL_ACHIEVEMENTS.filter(a => a.unlocked).length

  const save = async (data) => {
    setSaving(true)
    try {
      await updateProfile({ ...data, photoURL: user?.photoURL || '' })
      setEditSection(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
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
      {sharingBadge && (
        <BadgeModal
          badge={sharingBadge}
          rarityColor={RARITY[sharingBadge.rarity].color}
          onClose={() => setSharingBadge(null)}
        />
      )}

      {/* ── COMPACT HERO ─────────────────────────────────────────────────── */}
      <div className="gpf-hero" style={{ '--rc': levelStyle.color, '--rg': levelStyle.glow }}>
        {/* Avatar */}
        <div className="gpf-av-wrap">
          {user?.photoURL
            ? <img src={user.photoURL} alt="av" className="gpf-av-img" referrerPolicy="no-referrer" />
            : <div className="gpf-av-fb">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
          }
          {isComplete && <div className="gpf-av-check">✓</div>}
        </div>

        {/* Identity */}
        <div className="gpf-hero-mid">
          <div className="gpf-hero-top-row">
            <span className="gpf-h-name">{user?.name || 'Your Name'}</span>
            {assessLevel
              ? <span className="gpf-rank-tag" style={{ color: levelStyle.color, background: levelStyle.bg, borderColor: levelStyle.color }}>
                  {levelStyle.icon} {assessLevel}
                </span>
              : <span className="gpf-rank-tag" style={{ color: '#64748b', background: 'rgba(100,116,139,.15)', borderColor: '#64748b' }}>
                  🎮 Take Assessment
                </span>
            }
          </div>
          <div className="gpf-h-sub">
            {[user?.college, user?.branch, user?.yearOfStudy].filter(Boolean).join(' · ') || 'Complete your profile'}
            {user?.careerGoal && <span className="gpf-h-goal"> · 🎯 {user.careerGoal}</span>}
          </div>
          {/* XP bar */}
          <div className="gpf-xp-row">
            <div className="gpf-xp-track">
              <div className="gpf-xp-fill" style={{ width: `${xpPct}%`, background: levelStyle.color }} />
            </div>
            <span className="gpf-xp-txt">{xpInLvl}/50 XP</span>
            {nextLevel && <span className="gpf-xp-next">→ {LEVEL_STYLES[nextLevel].icon} {nextLevel}</span>}
          </div>
        </div>

        {/* Stat strip */}
        <div className="gpf-hero-stats">
          {[
            { v: points,                lbl: 'XP',      c: levelStyle.color },
            { v: `${streak.count}🔥`,   lbl: 'Streak',  c: '#f59e0b'        },
            { v: solvedProblems.length, lbl: 'Solved',  c: '#10b981'        },
            { v: `${progress.roadmap||0}%`, lbl: 'Roadmap', c: '#8b5cf6'    },
            { v: `${unlockedCount}/${ALL_ACHIEVEMENTS.length}`, lbl: 'Badges', c: '#a78bfa' },
          ].map(s => (
            <div key={s.lbl} className="gpf-hstat">
              <div className="gpf-hstat-v" style={{ color: s.c }}>{s.v}</div>
              <div className="gpf-hstat-l">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {saved && <div className="gpf-toast">✅ Saved!</div>}

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <div className="gpf-grid">

        {/* LEFT */}
        <div className="gpf-col">

          {/* About / Character Info */}
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
                      <option value="">Select</option>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="gpf-form-row">
                  <div className="gpf-fg"><label>Year *</label>
                    <select value={aboutForm.yearOfStudy} onChange={e => setAboutForm(f => ({ ...f, yearOfStudy: e.target.value }))} required>
                      <option value="">Select</option>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="gpf-fg"><label>Bio</label><input value={aboutForm.bio} onChange={e => setAboutForm(f => ({ ...f, bio: e.target.value }))} placeholder="One-liner about you" /></div>
                </div>
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="gpf-info-2col">
                {[
                  { l: 'Name',    v: user?.name    }, { l: 'Email',  v: user?.email  },
                  { l: 'College', v: user?.college }, { l: 'Branch', v: user?.branch },
                  { l: 'Year',    v: user?.yearOfStudy }, { l: 'Phone', v: user?.phone },
                ].map(f => (
                  <div key={f.l} className="gpf-info-cell">
                    <div className="gpf-info-lbl">{f.l}</div>
                    <div className={`gpf-info-val${!f.v ? ' gpf-empty' : ''}`}>{f.v || '—'}</div>
                  </div>
                ))}
                {user?.bio && <div className="gpf-bio-strip gpf-span2">"{user.bio}"</div>}
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
                    placeholder="Type skill + Enter" className="gpf-skill-input" />
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

          {/* Quest Log / Projects */}
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
                    <div className="gpf-fg"><label>Link</label>
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
                      <span className="gpf-project-title">{p.title}</span>
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

        {/* RIGHT */}
        <div className="gpf-col">

          {/* Achievements */}
          <Card title={`Achievements — ${unlockedCount}/${ALL_ACHIEVEMENTS.length} unlocked`} icon="🏆">
            <div className="gpf-badges-grid">
              {ALL_ACHIEVEMENTS.map((a, i) => {
                const rc = RARITY[a.rarity]
                return (
                  <div key={i} className={`gpf-badge${a.unlocked ? ' gpf-badge--on' : ' gpf-badge--off'}`}
                    style={a.unlocked ? { background: rc.bg, borderColor: rc.border } : {}}>
                    <div className="gpf-badge-icon">{a.unlocked ? a.icon : '🔒'}</div>
                    <div className="gpf-badge-name" style={a.unlocked ? { color: rc.color } : {}}>{a.title}</div>
                    <div className="gpf-badge-hint">{a.desc}</div>
                    {a.unlocked && <div className="gpf-badge-dot" style={{ background: rc.color }} />}
                    {a.unlocked && (
                      <button className="gpf-badge-linkedin" onClick={() => setSharingBadge(a)} title="Share on LinkedIn">
                        in Add to LinkedIn
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Player Stats */}
          <Card title="Player Stats" icon="📊">
            <div className="gpf-stats-strip">
              {[
                { icon: '⚡', val: points,                lbl: 'Total XP',   color: '#818cf8' },
                { icon: '🔥', val: streak.count,          lbl: 'Streak',     color: '#f59e0b' },
                { icon: '💻', val: solvedProblems.length, lbl: 'Solved',     color: '#10b981' },
                { icon: '🗺️', val: `${progress.roadmap||0}%`, lbl: 'Roadmap', color: '#8b5cf6' },
                { icon: '🧮', val: Object.values(quizAttempts).filter(a => a?.some(x => x.score >= 60)).length, lbl: 'Quizzes', color: '#06b6d4' },
                { icon: '🏅', val: unlockedCount,         lbl: 'Badges',     color: '#f59e0b' },
              ].map(s => (
                <div key={s.lbl} className="gpf-sstat">
                  <div className="gpf-sstat-icon">{s.icon}</div>
                  <div className="gpf-sstat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="gpf-sstat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Mission Objective */}
          <Card title="Mission Objective" icon="🎯" action={editSection !== 'career' && <EditBtn onClick={() => setEditSection('career')} />}>
            {editSection === 'career' ? (
              <form onSubmit={e => { e.preventDefault(); save({ ...user, ...careerForm }) }} className="gpf-form">
                <div className="gpf-fg"><label>Career Goal *</label>
                  <select value={careerForm.careerGoal} onChange={e => setCareerForm(f => ({ ...f, careerGoal: e.target.value }))} required>
                    <option value="">Select goal</option>
                    {GOALS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="gpf-fg"><label>Dream Company</label>
                  <input value={careerForm.dreamCompany} onChange={e => setCareerForm(f => ({ ...f, dreamCompany: e.target.value }))} placeholder="Google, Microsoft…" />
                </div>
                <div className="gpf-fg gpf-checkbox-row">
                  <input type="checkbox" id="intern" checked={careerForm.openToInternship} onChange={e => setCareerForm(f => ({ ...f, openToInternship: e.target.checked }))} />
                  <label htmlFor="intern">Open to Internship</label>
                </div>
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="gpf-career-rows">
                <div className="gpf-cr"><span className="gpf-cl">Goal</span><span className={`gpf-cv${!user?.careerGoal ? ' gpf-empty' : ''}`}>{user?.careerGoal || '—'}</span></div>
                {user?.dreamCompany && <div className="gpf-cr"><span className="gpf-cl">Dream Co.</span><span className="gpf-cv">⭐ {user.dreamCompany}</span></div>}
                <div className="gpf-cr">
                  <span className="gpf-cl">Internship</span>
                  <span className="gpf-cv">{user?.openToInternship !== false
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
                <div className="gpf-form-row">
                  {[
                    { k: 'linkedin', label: 'LinkedIn',  placeholder: 'linkedin.com/in/...' },
                    { k: 'github',   label: 'GitHub',    placeholder: 'github.com/...'      },
                  ].map(f => (
                    <div key={f.k} className="gpf-fg">
                      <label>{f.label}</label>
                      <input value={socialForm[f.k]} onChange={e => setSocialForm(s => ({ ...s, [f.k]: e.target.value }))} placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
                <div className="gpf-form-row">
                  {[
                    { k: 'twitter', label: 'Twitter',   placeholder: 'twitter.com/...' },
                    { k: 'website', label: 'Portfolio', placeholder: 'yoursite.com'   },
                  ].map(f => (
                    <div key={f.k} className="gpf-fg">
                      <label>{f.label}</label>
                      <input value={socialForm[f.k]} onChange={e => setSocialForm(s => ({ ...s, [f.k]: e.target.value }))} placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
                <div className="gpf-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="gpf-social-grid">
                {[
                  { k: 'linkedin', icon: '💼', label: 'LinkedIn' },
                  { k: 'github',   icon: '🐙', label: 'GitHub'   },
                  { k: 'twitter',  icon: '🐦', label: 'Twitter'  },
                  { k: 'website',  icon: '🌐', label: 'Website'  },
                ].map(s => (
                  <div key={s.k} className="gpf-social-item">
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
