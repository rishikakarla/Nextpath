import { useState } from 'react'
import { useApp } from '../context/AppContext'

const YEARS    = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = ['Computer Science', 'Information Technology', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS    = ['Product Company (FAANG/Unicorn)', 'Service Company (TCS/Infosys/Wipro)', 'Startup', 'Higher Studies']

function isProfileComplete(u) {
  return !!(u?.name && u?.college && u?.branch && u?.yearOfStudy && u?.careerGoal)
}

export default function Profile() {
  const { user, points, streak, updateProfile } = useApp()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [form, setForm] = useState({
    name:        user?.name        || '',
    college:     user?.college     || '',
    branch:      user?.branch      || '',
    yearOfStudy: user?.yearOfStudy || '',
    careerGoal:  user?.careerGoal  || '',
    linkedin:    user?.linkedin    || '',
    phone:       user?.phone       || '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name        = 'Name is required'
    if (!form.college.trim()) e.college     = 'College is required'
    if (!form.branch)         e.branch      = 'Select branch'
    if (!form.yearOfStudy)    e.yearOfStudy = 'Select year'
    if (!form.careerGoal)     e.careerGoal  = 'Select career goal'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await updateProfile({ ...form, photoURL: user?.photoURL || '' })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setErrors({})
    } catch {
      setErrors({ submit: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const complete = isProfileComplete(user)
  const wasComplete = user?.profileComplete

  return (
    <div className="pf-page">

      {/* ── Hero ── */}
      <div className="pf-hero">
        <div className="pf-hero-left">
          {/* Avatar */}
          <div className="pf-avatar-wrap">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="pf-avatar-img" referrerPolicy="no-referrer" />
              : <div className="pf-avatar-fallback">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
            }
            {complete && <div className="pf-avatar-badge" title="Profile complete">✓</div>}
          </div>

          <div className="pf-hero-info">
            <div className="pf-hero-name">{user?.name || 'Your Name'}</div>
            <div className="pf-hero-meta">
              {user?.college && <span>{user.college}</span>}
              {user?.branch  && <span>· {user.branch}</span>}
              {user?.yearOfStudy && <span>· {user.yearOfStudy}</span>}
            </div>
            <div className="pf-hero-goal">
              {user?.careerGoal
                ? <span className="pf-goal-chip">🎯 {user.careerGoal}</span>
                : <span className="pf-goal-chip pf-goal-empty">🎯 Goal not set</span>
              }
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pf-hero-stats">
          {[
            { val: points,       lbl: 'Points',  icon: '⚡' },
            { val: `🔥 ${streak.count}`, lbl: 'Streak', icon: '' },
            { val: complete ? '✅' : '⚠️', lbl: 'Profile', icon: '' },
          ].map(s => (
            <div key={s.lbl} className="pf-stat">
              <div className="pf-stat-val">{s.val}</div>
              <div className="pf-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Profile completion banner ── */}
      {!complete && (
        <div className="pf-banner pf-banner--warn">
          <span>⚠️ Complete your profile to earn <strong>+50 points</strong> bonus!</span>
          {!editing && (
            <button className="pf-banner-btn" onClick={() => setEditing(true)}>Fill Now</button>
          )}
        </div>
      )}
      {saved && (
        <div className="pf-banner pf-banner--success">
          ✅ Profile saved!{!wasComplete && complete ? ' You earned +50 points!' : ''}
        </div>
      )}

      {/* ── Details card ── */}
      <div className="pf-card">
        <div className="pf-card-header">
          <div className="pf-card-title">👤 Profile Details</div>
          {!editing && (
            <button className="pf-edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="pf-form">
            {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

            <div className="pf-form-row">
              <div className="pf-form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Sharma" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="pf-form-group">
                <label>College / University</label>
                <input value={form.college} onChange={e => set('college', e.target.value)} placeholder="VIT Vellore" />
                {errors.college && <div className="form-error">{errors.college}</div>}
              </div>
            </div>

            <div className="pf-form-row">
              <div className="pf-form-group">
                <label>Branch</label>
                <select value={form.branch} onChange={e => set('branch', e.target.value)}>
                  <option value="">Select branch</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.branch && <div className="form-error">{errors.branch}</div>}
              </div>
              <div className="pf-form-group">
                <label>Year of Study</label>
                <select value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)}>
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.yearOfStudy && <div className="form-error">{errors.yearOfStudy}</div>}
              </div>
            </div>

            <div className="pf-form-group">
              <label>Dream Job / Career Goal</label>
              <select value={form.careerGoal} onChange={e => set('careerGoal', e.target.value)}>
                <option value="">Select your goal</option>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.careerGoal && <div className="form-error">{errors.careerGoal}</div>}
            </div>

            <div className="pf-form-row">
              <div className="pf-form-group">
                <label>LinkedIn URL <span className="pf-optional">(optional)</span></label>
                <input value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" />
              </div>
              <div className="pf-form-group">
                <label>Phone Number <span className="pf-optional">(optional)</span></label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
              </div>
            </div>

            <div className="pf-form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setEditing(false); setErrors({}) }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="pf-fields">
            {[
              { icon: '👤', label: 'Full Name',      val: user?.name },
              { icon: '🏫', label: 'College',         val: user?.college },
              { icon: '🔬', label: 'Branch',          val: user?.branch },
              { icon: '📅', label: 'Year of Study',   val: user?.yearOfStudy },
              { icon: '🎯', label: 'Career Goal',     val: user?.careerGoal },
              { icon: '💼', label: 'LinkedIn',        val: user?.linkedin },
              { icon: '📱', label: 'Phone',           val: user?.phone },
              { icon: '📧', label: 'Email',           val: user?.email, readonly: true },
            ].map(f => (
              <div key={f.label} className="pf-field">
                <span className="pf-field-icon">{f.icon}</span>
                <div className="pf-field-body">
                  <div className="pf-field-label">{f.label}</div>
                  <div className={`pf-field-val${!f.val ? ' pf-field-empty' : ''}`}>
                    {f.val || '—'}
                    {f.readonly && <span className="pf-readonly-tag">from account</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
