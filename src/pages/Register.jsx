import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const BRANCHES = ['Computer Science', 'Information Technology', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']
const GOALS = ['Product Company (FAANG/Unicorn)', 'Service Company (TCS/Infosys/Wipro)', 'Startup', 'Higher Studies']

export default function Register() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', college: '',
    branch: '', yearOfStudy: '', careerGoal: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (!form.college.trim()) e.college = 'College name required'
    if (!form.branch) e.branch = 'Select your branch'
    if (!form.yearOfStudy) e.yearOfStudy = 'Select year'
    if (!form.careerGoal) e.careerGoal = 'Select career goal'
    return e
  }

  const handle = async (e) => {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/assessment')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : 'Registration failed. Please try again.'
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <h1>NextPath</h1>
          <p>Start your career preparation journey</p>
        </div>

        <h2 className="auth-title">Create your account</h2>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handle}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>College / University</label>
            <input placeholder="VIT Vellore" value={form.college} onChange={e => set('college', e.target.value)} />
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
            <label>Career Goal</label>
            <select value={form.careerGoal} onChange={e => set('careerGoal', e.target.value)}>
              <option value="">Select your goal</option>
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.careerGoal && <div className="form-error">{errors.careerGoal}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account & Take Assessment'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
