import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const YEARS    = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = ['Computer Science', 'Information Technology', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS    = ['Product Company (FAANG/Unicorn)', 'Service Company (TCS/Infosys/Wipro)', 'Startup', 'Higher Studies']

export default function ProfileSetup() {
  const { user, updateProfile } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:        user?.name        || user?.displayName || '',
    college:     user?.college     || '',
    branch:      user?.branch      || '',
    yearOfStudy: user?.yearOfStudy || '',
    careerGoal:  user?.careerGoal  || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name        = 'Name is required'
    if (!form.college.trim()) e.college     = 'College name required'
    if (!form.branch)         e.branch      = 'Select your branch'
    if (!form.yearOfStudy)    e.yearOfStudy = 'Select year'
    if (!form.careerGoal)     e.careerGoal  = 'Select dream job / goal'
    return e
  }

  const handle = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await updateProfile(form)
      navigate('/assessment')
    } catch {
      setErrors({ submit: 'Failed to save details. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <h1>NextPath</h1>
        </div>

        <div className="auth-step-header">
          <div className="auth-step-icon">🎓</div>
          <h2 className="auth-title" style={{ marginBottom: 4 }}>Complete your profile</h2>
          <p className="auth-subtitle">Tell us about yourself so we can personalise your path</p>
        </div>

        {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

        <form onSubmit={handle}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              placeholder="Rahul Sharma"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>College / University</label>
            <input
              placeholder="VIT Vellore"
              value={form.college}
              onChange={e => set('college', e.target.value)}
            />
            {errors.college && <div className="form-error">{errors.college}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Branch</label>
              <select value={form.branch} onChange={e => set('branch', e.target.value)}>
                <option value="">Select branch</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.branch && <div className="form-error">{errors.branch}</div>}
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <select value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.yearOfStudy && <div className="form-error">{errors.yearOfStudy}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Dream Job / Career Goal</label>
            <select value={form.careerGoal} onChange={e => set('careerGoal', e.target.value)}>
              <option value="">Select your goal</option>
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.careerGoal && <div className="form-error">{errors.careerGoal}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 8 }}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save & Take Assessment →'}
          </button>
        </form>
      </div>
    </div>
  )
}
