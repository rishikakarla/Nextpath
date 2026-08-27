import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useCollege } from '../context/CollegeContext'

const YEARS    = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = ['Computer Science', 'Information Technology', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS    = ['Product Company (FAANG/Unicorn)', 'Service Company (TCS/Infosys/Wipro)', 'Startup', 'Higher Studies']
const OTHER_COLLEGE = '__other__'

export default function ProfileSetup() {
  const { user, updateProfile } = useApp()
  const { colleges } = useCollege()
  const navigate = useNavigate()

  const [collegeChoice, setCollegeChoice] = useState(user?.collegeId || (user?.college ? OTHER_COLLEGE : ''))
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

  const selectedCollege = colleges.find(c => c.id === collegeChoice)
  const branchOptions = selectedCollege ? selectedCollege.departments : BRANCHES
  const yearOptions   = selectedCollege ? selectedCollege.academicYears : YEARS

  const handleCollegeChoice = (val) => {
    setCollegeChoice(val)
    const c = colleges.find(x => x.id === val)
    setForm(f => ({ ...f, college: c ? c.name : (val === OTHER_COLLEGE ? '' : f.college), branch: '', yearOfStudy: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name        = 'Name is required'
    if (!collegeChoice)       e.collegeChoice = 'Select your college'
    if (collegeChoice === OTHER_COLLEGE && !form.college.trim()) e.college = 'College name required'
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
      const payload = { ...form, collegeId: collegeChoice === OTHER_COLLEGE ? '' : collegeChoice }
      await updateProfile(payload)
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
            <select value={collegeChoice} onChange={e => handleCollegeChoice(e.target.value)}>
              <option value="">Select your college</option>
              {colleges.filter(c => c.active !== false).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value={OTHER_COLLEGE}>My college isn't listed</option>
            </select>
            {errors.collegeChoice && <div className="form-error">{errors.collegeChoice}</div>}
          </div>

          {collegeChoice === OTHER_COLLEGE && (
            <div className="form-group">
              <label>College Name</label>
              <input
                placeholder="VIT Vellore"
                value={form.college}
                onChange={e => set('college', e.target.value)}
              />
              {errors.college && <div className="form-error">{errors.college}</div>}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Branch</label>
              <select value={form.branch} onChange={e => set('branch', e.target.value)}>
                <option value="">Select branch</option>
                {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.branch && <div className="form-error">{errors.branch}</div>}
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <select value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)}>
                <option value="">Select year</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
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
