import { useState } from 'react'
import { useApp } from '../context/AppContext'

const YEARS    = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = ['Computer Science', 'Information Technology', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS    = ['Product Company (FAANG/Unicorn)', 'Service Company (TCS/Infosys/Wipro)', 'Startup', 'Higher Studies']
const SKILL_SUGGESTIONS = ['Python', 'Java', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL', 'DSA', 'Machine Learning', 'Git', 'HTML/CSS', 'TypeScript', 'MongoDB', 'AWS', 'Docker']

function SectionCard({ title, icon, children, action }) {
  return (
    <div className="pf2-card">
      <div className="pf2-card-hdr">
        <div className="pf2-card-hdr-left">
          <span className="pf2-card-icon">{icon}</span>
          <span className="pf2-card-title">{title}</span>
        </div>
        {action}
      </div>
      <div className="pf2-card-body">{children}</div>
    </div>
  )
}

function EditBtn({ onClick }) {
  return <button className="pf2-edit-btn" onClick={onClick}>✏️ Edit</button>
}

export default function Profile() {
  const { user, points, streak, progress, solvedProblems, quizAttempts, updateProfile } = useApp()

  const [editSection, setEditSection] = useState(null) // 'about'|'skills'|'projects'|'career'|'social'
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // ── Form state ─────────────────────────────────────────────────────────────
  const [aboutForm, setAboutForm]     = useState({ name: user?.name || '', college: user?.college || '', branch: user?.branch || '', yearOfStudy: user?.yearOfStudy || '', bio: user?.bio || '', phone: user?.phone || '' })
  const [skillInput, setSkillInput]   = useState('')
  const [skillsForm, setSkillsForm]   = useState(user?.skills || [])
  const [projectsForm, setProjectsForm] = useState(user?.projects || [])
  const [careerForm, setCareerForm]   = useState({ careerGoal: user?.careerGoal || '', dreamCompany: user?.dreamCompany || '', openToInternship: user?.openToInternship ?? true })
  const [socialForm, setSocialForm]   = useState({ linkedin: user?.linkedin || '', github: user?.github || '', twitter: user?.twitter || '', website: user?.website || '' })

  const isComplete = !!(user?.name && user?.college && user?.branch && user?.yearOfStudy && user?.careerGoal)

  // ── Save helper ────────────────────────────────────────────────────────────
  const save = async (data) => {
    setSaving(true)
    try {
      await updateProfile({ ...data, photoURL: user?.photoURL || '' })
      setEditSection(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  const addSkill = (s) => {
    const t = s.trim()
    if (t && !skillsForm.includes(t)) setSkillsForm(prev => [...prev, t])
    setSkillInput('')
  }
  const removeSkill = (s) => setSkillsForm(prev => prev.filter(x => x !== s))

  // ── Projects ───────────────────────────────────────────────────────────────
  const blankProject = () => ({ id: Date.now(), title: '', desc: '', tech: '', link: '' })
  const addProject   = () => setProjectsForm(prev => [...prev, blankProject()])
  const setProject   = (id, k, v) => setProjectsForm(prev => prev.map(p => p.id === id ? { ...p, [k]: v } : p))
  const removeProject= (id) => setProjectsForm(prev => prev.filter(p => p.id !== id))

  // ── Achievements (auto) ───────────────────────────────────────────────────
  const achievements = [
    solvedProblems.length >= 1  && { icon: '💻', title: 'First Code', desc: 'Solved your first coding problem' },
    solvedProblems.length >= 5  && { icon: '🔥', title: 'Problem Solver', desc: 'Solved 5 coding problems' },
    solvedProblems.length >= 10 && { icon: '🏆', title: 'Code Champion', desc: 'Solved 10 coding problems' },
    streak.count >= 3           && { icon: '⚡', title: 'On a Roll', desc: '3-day practice streak' },
    streak.count >= 7           && { icon: '🌟', title: 'Streak Master', desc: '7-day practice streak' },
    points >= 50                && { icon: '🎯', title: 'Point Starter', desc: 'Earned 50 points' },
    points >= 100               && { icon: '💎', title: 'Century Club', desc: 'Earned 100 points' },
    points >= 500               && { icon: '👑', title: 'Elite Student', desc: 'Earned 500 points' },
    Object.values(quizAttempts).some(a => a?.length > 0) && { icon: '🧮', title: 'Quiz Taker', desc: 'Attempted an aptitude quiz' },
    isComplete                  && { icon: '✅', title: 'Profile Pro', desc: 'Completed your profile (+50 pts)' },
  ].filter(Boolean)

  return (
    <div className="pf2-page">

      {/* ══ PROFILE HEADER ══════════════════════════════════════════════════ */}
      <div className="pf2-hero">
        {/* Left: avatar + identity */}
        <div className="pf2-hero-identity">
          <div className="pf2-avatar-wrap">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="pf2-avatar-img" referrerPolicy="no-referrer" />
              : <div className="pf2-avatar-fallback">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
            }
            {isComplete && <div className="pf2-avatar-verified">✓</div>}
          </div>
          <div>
            <div className="pf2-hero-name">{user?.name || 'Your Name'}</div>
            <div className="pf2-hero-sub">
              {[user?.college, user?.branch, user?.yearOfStudy].filter(Boolean).join(' · ') || 'Add your details below'}
            </div>
            {user?.bio && <div className="pf2-hero-bio">"{user.bio}"</div>}
            <div className="pf2-hero-chips">
              {user?.careerGoal && <span className="pf2-chip pf2-chip--goal">🎯 {user.careerGoal}</span>}
              {user?.openToInternship && <span className="pf2-chip pf2-chip--open">✅ Open to Internship</span>}
              <span className="pf2-chip pf2-chip--email">📧 {user?.email}</span>
            </div>
          </div>
        </div>

        {/* Right: stat chips */}
        <div className="pf2-hero-stats">
          {[
            { val: points,             lbl: 'Points',   color: '#6366f1' },
            { val: `🔥 ${streak.count}`, lbl: 'Streak', color: '#f59e0b' },
            { val: solvedProblems.length, lbl: 'Solved', color: '#10b981' },
            { val: achievements.length,  lbl: 'Badges',  color: '#ef4444' },
          ].map(s => (
            <div key={s.lbl} className="pf2-stat">
              <div className="pf2-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="pf2-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Success toast */}
      {saved && <div className="pf2-toast">✅ Saved successfully!</div>}

      {/* ══ GRID LAYOUT ═════════════════════════════════════════════════════ */}
      <div className="pf2-grid">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="pf2-col">

          {/* About Me */}
          <SectionCard title="About Me" icon="👤" action={editSection !== 'about' && <EditBtn onClick={() => setEditSection('about')} />}>
            {editSection === 'about' ? (
              <form onSubmit={e => { e.preventDefault(); save({ ...user, ...aboutForm, skills: skillsForm, projects: projectsForm, careerGoal: careerForm.careerGoal, dreamCompany: careerForm.dreamCompany, openToInternship: careerForm.openToInternship, ...socialForm }) }} className="pf2-form">
                <div className="pf2-form-row">
                  <div className="pf2-fg">
                    <label>Full Name *</label>
                    <input value={aboutForm.name} onChange={e => setAboutForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Sharma" required />
                  </div>
                  <div className="pf2-fg">
                    <label>Phone</label>
                    <input value={aboutForm.phone} onChange={e => setAboutForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="pf2-form-row">
                  <div className="pf2-fg">
                    <label>College / University *</label>
                    <input value={aboutForm.college} onChange={e => setAboutForm(f => ({ ...f, college: e.target.value }))} placeholder="VIT Vellore" required />
                  </div>
                  <div className="pf2-fg">
                    <label>Branch *</label>
                    <select value={aboutForm.branch} onChange={e => setAboutForm(f => ({ ...f, branch: e.target.value }))} required>
                      <option value="">Select branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pf2-fg">
                  <label>Year of Study *</label>
                  <select value={aboutForm.yearOfStudy} onChange={e => setAboutForm(f => ({ ...f, yearOfStudy: e.target.value }))} required>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="pf2-fg">
                  <label>Bio <span className="pf2-opt">(optional)</span></label>
                  <textarea value={aboutForm.bio} onChange={e => setAboutForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself in 1-2 lines..." rows={3} />
                </div>
                <div className="pf2-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="pf2-info-grid">
                {[
                  { l: 'Name',        v: user?.name },
                  { l: 'Email',       v: user?.email },
                  { l: 'Phone',       v: user?.phone },
                  { l: 'College',     v: user?.college },
                  { l: 'Branch',      v: user?.branch },
                  { l: 'Year',        v: user?.yearOfStudy },
                ].map(f => (
                  <div key={f.l} className="pf2-info-row">
                    <span className="pf2-info-label">{f.l}</span>
                    <span className={`pf2-info-val${!f.v ? ' pf2-empty' : ''}`}>{f.v || '—'}</span>
                  </div>
                ))}
                {user?.bio && <div className="pf2-bio-text">"{user.bio}"</div>}
              </div>
            )}
          </SectionCard>

          {/* Skills */}
          <SectionCard title="Skills" icon="⚡" action={editSection !== 'skills' && <EditBtn onClick={() => setEditSection('skills')} />}>
            {editSection === 'skills' ? (
              <div className="pf2-form">
                <div className="pf2-skill-input-row">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                    placeholder="Type a skill and press Enter"
                    className="pf2-skill-input"
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addSkill(skillInput)}>Add</button>
                </div>
                <div className="pf2-skill-suggestions">
                  {SKILL_SUGGESTIONS.filter(s => !skillsForm.includes(s)).map(s => (
                    <button key={s} type="button" className="pf2-suggest-chip" onClick={() => addSkill(s)}>+ {s}</button>
                  ))}
                </div>
                <div className="pf2-skills-list">
                  {skillsForm.map(s => (
                    <span key={s} className="pf2-skill-tag pf2-skill-tag--edit">
                      {s} <button onClick={() => removeSkill(s)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="pf2-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => save({ ...user, skills: skillsForm })}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pf2-skills-list">
                {(user?.skills || []).length > 0
                  ? (user.skills.map(s => <span key={s} className="pf2-skill-tag">{s}</span>))
                  : <span className="pf2-empty">No skills added yet</span>
                }
              </div>
            )}
          </SectionCard>

          {/* Projects */}
          <SectionCard title="Projects" icon="🚀" action={editSection !== 'projects' && <EditBtn onClick={() => setEditSection('projects')} />}>
            {editSection === 'projects' ? (
              <div className="pf2-form">
                {projectsForm.map((p, i) => (
                  <div key={p.id} className="pf2-project-edit-card">
                    <div className="pf2-project-edit-hdr">
                      <span className="pf2-project-num">Project {i + 1}</span>
                      <button type="button" className="pf2-remove-btn" onClick={() => removeProject(p.id)}>Remove</button>
                    </div>
                    <div className="pf2-form-row">
                      <div className="pf2-fg">
                        <label>Project Title</label>
                        <input value={p.title} onChange={e => setProject(p.id, 'title', e.target.value)} placeholder="My Awesome Project" />
                      </div>
                      <div className="pf2-fg">
                        <label>Tech Stack</label>
                        <input value={p.tech} onChange={e => setProject(p.id, 'tech', e.target.value)} placeholder="React, Node.js, MongoDB" />
                      </div>
                    </div>
                    <div className="pf2-fg">
                      <label>Description</label>
                      <textarea value={p.desc} onChange={e => setProject(p.id, 'desc', e.target.value)} placeholder="Brief description of what the project does..." rows={2} />
                    </div>
                    <div className="pf2-fg">
                      <label>Link (GitHub / Live)</label>
                      <input value={p.link} onChange={e => setProject(p.id, 'link', e.target.value)} placeholder="https://github.com/..." />
                    </div>
                  </div>
                ))}
                <button type="button" className="pf2-add-project-btn" onClick={addProject}>+ Add Project</button>
                <div className="pf2-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => save({ ...user, projects: projectsForm })}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pf2-projects-list">
                {(user?.projects || []).length > 0 ? user.projects.map(p => (
                  <div key={p.id} className="pf2-project-card">
                    <div className="pf2-project-top">
                      <div className="pf2-project-title">{p.title}</div>
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="pf2-project-link">↗ View</a>}
                    </div>
                    {p.desc && <div className="pf2-project-desc">{p.desc}</div>}
                    {p.tech && <div className="pf2-project-tech">{p.tech.split(',').map(t => <span key={t} className="pf2-tech-chip">{t.trim()}</span>)}</div>}
                  </div>
                )) : <span className="pf2-empty">No projects added yet</span>}
              </div>
            )}
          </SectionCard>

        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
        <div className="pf2-col">

          {/* Achievements */}
          <SectionCard title="Achievements" icon="🏆">
            <div className="pf2-badges-grid">
              {achievements.length > 0 ? achievements.map((a, i) => (
                <div key={i} className="pf2-badge">
                  <div className="pf2-badge-icon">{a.icon}</div>
                  <div className="pf2-badge-title">{a.title}</div>
                  <div className="pf2-badge-desc">{a.desc}</div>
                </div>
              )) : <span className="pf2-empty">Start learning to earn badges!</span>}
            </div>
          </SectionCard>

          {/* Activity Summary */}
          <SectionCard title="Activity Summary" icon="📊">
            <div className="pf2-activity-grid">
              {[
                { label: 'Total Points',     val: points,                    color: '#6366f1', icon: '⚡' },
                { label: 'Day Streak',       val: streak.count,              color: '#f59e0b', icon: '🔥' },
                { label: 'Problems Solved',  val: solvedProblems.length,     color: '#10b981', icon: '💻' },
                { label: 'Roadmap Progress', val: `${progress.roadmap || 0}%`, color: '#8b5cf6', icon: '🗺️' },
                { label: 'Aptitude Passed',  val: Object.values(quizAttempts).filter(a => a?.some(x => x.score >= 60)).length, color: '#06b6d4', icon: '🧮' },
                { label: 'Badges Earned',    val: achievements.length,       color: '#ef4444', icon: '🏅' },
              ].map(s => (
                <div key={s.label} className="pf2-activity-stat">
                  <div className="pf2-activity-icon">{s.icon}</div>
                  <div className="pf2-activity-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="pf2-activity-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Career Direction */}
          <SectionCard title="Career Direction" icon="🎯" action={editSection !== 'career' && <EditBtn onClick={() => setEditSection('career')} />}>
            {editSection === 'career' ? (
              <form onSubmit={e => { e.preventDefault(); save({ ...user, ...careerForm }) }} className="pf2-form">
                <div className="pf2-fg">
                  <label>Career Goal *</label>
                  <select value={careerForm.careerGoal} onChange={e => setCareerForm(f => ({ ...f, careerGoal: e.target.value }))} required>
                    <option value="">Select goal</option>
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="pf2-fg">
                  <label>Dream Company <span className="pf2-opt">(optional)</span></label>
                  <input value={careerForm.dreamCompany} onChange={e => setCareerForm(f => ({ ...f, dreamCompany: e.target.value }))} placeholder="Google, Microsoft, Zepto…" />
                </div>
                <div className="pf2-fg pf2-checkbox-row">
                  <input type="checkbox" id="internship" checked={careerForm.openToInternship} onChange={e => setCareerForm(f => ({ ...f, openToInternship: e.target.checked }))} />
                  <label htmlFor="internship">Open to Internship Opportunities</label>
                </div>
                <div className="pf2-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="pf2-career-view">
                <div className="pf2-career-row">
                  <span className="pf2-career-label">Goal</span>
                  <span className={`pf2-career-val${!user?.careerGoal ? ' pf2-empty' : ''}`}>{user?.careerGoal || '—'}</span>
                </div>
                {user?.dreamCompany && (
                  <div className="pf2-career-row">
                    <span className="pf2-career-label">Dream Company</span>
                    <span className="pf2-career-val">⭐ {user.dreamCompany}</span>
                  </div>
                )}
                <div className="pf2-career-row">
                  <span className="pf2-career-label">Internship</span>
                  <span className="pf2-career-val">
                    {user?.openToInternship !== false
                      ? <span className="pf2-open-chip">✅ Open</span>
                      : <span className="pf2-closed-chip">Not looking</span>
                    }
                  </span>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Social Links */}
          <SectionCard title="Social Links" icon="🔗" action={editSection !== 'social' && <EditBtn onClick={() => setEditSection('social')} />}>
            {editSection === 'social' ? (
              <form onSubmit={e => { e.preventDefault(); save({ ...user, ...socialForm }) }} className="pf2-form">
                {[
                  { k: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
                  { k: 'github',   label: 'GitHub',   placeholder: 'github.com/yourname' },
                  { k: 'twitter',  label: 'Twitter',  placeholder: 'twitter.com/yourname' },
                  { k: 'website',  label: 'Portfolio / Website', placeholder: 'yoursite.com' },
                ].map(f => (
                  <div key={f.k} className="pf2-fg">
                    <label>{f.label}</label>
                    <input value={socialForm[f.k]} onChange={e => setSocialForm(s => ({ ...s, [f.k]: e.target.value }))} placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="pf2-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <div className="pf2-social-list">
                {[
                  { k: 'linkedin', icon: '💼', label: 'LinkedIn' },
                  { k: 'github',   icon: '🐙', label: 'GitHub' },
                  { k: 'twitter',  icon: '🐦', label: 'Twitter' },
                  { k: 'website',  icon: '🌐', label: 'Website' },
                ].map(s => (
                  <div key={s.k} className="pf2-social-row">
                    <span className="pf2-social-icon">{s.icon}</span>
                    {user?.[s.k]
                      ? <a href={user[s.k].startsWith('http') ? user[s.k] : `https://${user[s.k]}`} target="_blank" rel="noreferrer" className="pf2-social-link">{user[s.k]}</a>
                      : <span className="pf2-empty">{s.label} not added</span>
                    }
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    </div>
  )
}
