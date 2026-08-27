import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useCollege } from '../context/CollegeContext'
import { db } from '../firebase'
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore'
import { s, Btn, Field, ActiveCard, ProblemForm, BLANK_PROB } from './Admin'

const PORTAL_TABS = [
  { key: 'settings', label: '⚙️ College Settings' },
  { key: 'students', label: '👥 Students' },
  { key: 'groups',   label: '🧩 Groups' },
  { key: 'modules',  label: '📝 Assessment Modules' },
  { key: 'results',  label: '📊 Results' },
]

const BLANK_MCQ = { q: '', opts: ['', '', '', ''], ans: 0, exp: '' }

const QUIZ_JSON_TEMPLATE = `[
  {
    "q": "What is the time complexity of binary search?",
    "opts": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    "ans": 1,
    "exp": "Binary search halves the search space each step, giving O(log n)."
  },
  {
    "q": "Which data structure uses LIFO order?",
    "opts": ["Queue", "Stack", "Array", "Linked List"],
    "ans": 1,
    "exp": "Stack follows Last-In-First-Out order."
  }
]`

const CODING_JSON_TEMPLATE = `[
  {
    "title": "Two Sum",
    "category": "Arrays",
    "difficulty": "Easy",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "inputFormat": "First line: array elements separated by spaces\\nSecond line: target integer",
    "outputFormat": "Two space-separated indices",
    "constraints": "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9",
    "points": 10,
    "examples": [
      { "input": "2 7 11 15\\n9", "output": "0 1", "explanation": "nums[0] + nums[1] = 9" }
    ],
    "testCases": [
      { "input": "2 7 11 15\\n9", "expectedOutput": "0 1", "hidden": false },
      { "input": "3 2 4\\n6",     "expectedOutput": "1 2", "hidden": true }
    ],
    "starterCode": {
      "71": "# Python\\ndef solution():\\n    pass",
      "63": "// JavaScript\\nfunction solution() {}",
      "54": "// C++\\n#include<bits/stdc++.h>\\nusing namespace std;"
    }
  }
]`

const BLANK_MODULE = {
  title: '', description: '',
  quiz: null, coding: null,
  targetDepartments: [], targetYears: [], targetEmails: [],
  opensAt: '', dueAt: '', timerMinutes: '',
  status: 'draft',
}

// datetime-local inputs work in local wall-clock time with no timezone info, but we store
// an absolute UTC ISO string — these convert between the two without shifting the clock.
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const toIso = (local) => local ? new Date(local).toISOString() : ''

// ── College Settings ─────────────────────────────────────────────────────────
function ChipEditor({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (!v || items.includes(v)) return
    onChange([...items, v])
    setDraft('')
  }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {items.map(it => (
          <span key={it} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
            {it}
            <button onClick={() => onChange(items.filter(x => x !== it))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>✕</button>
          </span>
        ))}
        {items.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None added yet.</span>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={s.inp} value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        <Btn sm onClick={add}>+ Add</Btn>
      </div>
    </div>
  )
}

function CollegeSettingsTab({ college, onSaved }) {
  const [departments,   setDepartments]   = useState(college.departments || [])
  const [academicYears, setAcademicYears] = useState(college.academicYears || [])
  const [cohorts,       setCohorts]       = useState(college.cohorts || [])
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState('')

  const save = async () => {
    setSaving(true); setSaved('')
    await setDoc(doc(db, 'colleges', college.id), {
      departments, academicYears, cohorts, updatedAt: new Date().toISOString(),
    }, { merge: true })
    setSaved('✓ Saved')
    setSaving(false)
    onSaved?.()
    setTimeout(() => setSaved(''), 2000)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>{college.name}</h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
        Manage the departments, academic years and cohorts/batches students at your college can select. These also drive who Assessment Modules can be targeted at.
      </p>
      <div style={s.card}>
        <Field label="Departments">
          <ChipEditor items={departments} onChange={setDepartments} placeholder="e.g. Computer Science" />
        </Field>
        <Field label="Academic Years">
          <ChipEditor items={academicYears} onChange={setAcademicYears} placeholder="e.g. 1st Year" />
        </Field>
        <Field label="Cohorts / Batches">
          <ChipEditor items={cohorts} onChange={setCohorts} placeholder="e.g. 2024 Batch, CSE-A" />
        </Field>
        {saved && <p style={{ color: '#10b981', fontSize: 13, margin: '0 0 10px' }}>{saved}</p>}
        <Btn variant="success" onClick={save}>{saving ? 'Saving…' : 'Save Changes'}</Btn>
      </div>
    </div>
  )
}

// ── Students ─────────────────────────────────────────────────────────────────
const BLANK_STUDENT = { name: '', email: '', regNo: '', academicYear: '' }

const STUDENT_JSON_TEMPLATE = `[
  { "name": "Asha Rao", "email": "asha.rao@example.com", "regNo": "21CS001", "department": "Computer Science" },
  { "name": "Vikram Singh", "email": "vikram.singh@example.com", "regNo": "21CS002", "department": "Computer Science" }
]`

function StudentsTab({ collegeId, college }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(college.academicYears?.[0] || '')
  const [department, setDepartment] = useState('')
  const [cohort, setCohort] = useState('')
  const [form, setForm] = useState(BLANK_STUDENT)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  const load = () => {
    setLoading(true)
    getDocs(query(collection(db, 'collegeStudents'), where('collegeId', '==', collegeId))).then(snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(load, [collegeId])

  const addStudent = async () => {
    setErr('')
    if (!form.name.trim() || !form.email.trim() || !year) { setErr('Name, email and academic year are required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr('Enter a valid email address.'); return }
    setSaving(true)
    const id = doc(collection(db, 'collegeStudents')).id
    const data = { collegeId, name: form.name.trim(), email: form.email.trim().toLowerCase(), regNo: form.regNo.trim(), academicYear: year, department, cohort, addedAt: new Date().toISOString() }
    await setDoc(doc(db, 'collegeStudents', id), data)
    setStudents(prev => [...prev, { id, ...data }])
    setForm(BLANK_STUDENT)
    setSaving(false)
  }

  const removeStudent = async (id) => {
    if (!window.confirm('Remove this student from the roster?')) return
    await deleteDoc(doc(db, 'collegeStudents', id))
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  const uploadJson = async () => {
    setJsonError('')
    if (!year) { setJsonError('Select an academic year first.'); return }
    let items
    try {
      const parsed = JSON.parse(jsonText.trim())
      items = Array.isArray(parsed) ? parsed : [parsed]
    } catch (e) { setJsonError('Invalid JSON: ' + e.message); return }
    const errors = []
    items.forEach((it, idx) => {
      if (!it.name?.trim()) errors.push(`Item ${idx + 1}: missing "name"`)
      if (!it.email?.trim()) errors.push(`Item ${idx + 1}: missing "email"`)
    })
    if (errors.length) { setJsonError(errors.join('\n')); return }
    const now = new Date().toISOString()
    const added = items.map(it => ({
      id: doc(collection(db, 'collegeStudents')).id,
      collegeId, name: it.name.trim(), email: it.email.trim().toLowerCase(), regNo: (it.regNo || '').trim(), academicYear: year,
      department: it.department?.trim() || department, cohort: it.cohort?.trim() || cohort, addedAt: now,
    }))
    await Promise.all(added.map(({ id, ...data }) => setDoc(doc(db, 'collegeStudents', id), data)))
    setStudents(prev => [...prev, ...added])
    setJsonMode(false); setJsonText('')
  }

  const byYear = students.reduce((acc, s) => { (acc[s.academicYear] ||= []).push(s); return acc }, {})

  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>Students ({students.length})</h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
        Add your students by academic year, department and cohort/batch using their name, email and reg. no. This roster lets you pick specific students, or build a reusable Group, when assigning an Assessment Module.
      </p>

      <div style={{ ...s.card, border: '2px solid var(--primary)', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Add Students</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Academic Year">
            <select style={s.inp} value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Select academic year</option>
              {(college.academicYears || []).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Department (optional)">
            <select style={s.inp} value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="">No department</option>
              {(college.departments || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Cohort / Batch (optional)">
            <select style={s.inp} value={cohort} onChange={e => setCohort(e.target.value)}>
              <option value="">No cohort</option>
              {(college.cohorts || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <Field label="Name"><input style={s.inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Asha Rao" /></Field>
          <Field label="Email"><input style={s.inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="student@example.com" /></Field>
          <Field label="Reg No"><input style={s.inp} value={form.regNo} onChange={e => setForm(f => ({ ...f, regNo: e.target.value }))} placeholder="e.g. 21CS001" /></Field>
        </div>
        {err && <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 10px' }}>{err}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="success" onClick={addStudent}>{saving ? 'Saving…' : '+ Add Student'}</Btn>
          <Btn variant="ghost" onClick={() => setJsonMode(m => !m)}>{jsonMode ? '✕ Close JSON' : '📋 Paste JSON'}</Btn>
        </div>
        {jsonMode && (
          <div style={{ ...s.card, background: 'var(--bg)', marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Paste an array of {'{ name, email, regNo, department, cohort }'} objects — they'll be added to the academic year selected above (department/cohort fall back to the selections above if omitted per item).</p>
              <Btn sm variant="ghost" onClick={() => setJsonText(STUDENT_JSON_TEMPLATE)}>Load Template</Btn>
            </div>
            <textarea style={{ ...s.inp, minHeight: 120, fontFamily: 'monospace', fontSize: 12 }} value={jsonText} onChange={e => setJsonText(e.target.value)} />
            {jsonError && <p style={{ color: '#ef4444', fontSize: 12, whiteSpace: 'pre-line' }}>{jsonError}</p>}
            <Btn sm variant="success" onClick={uploadJson}>Upload</Btn>
          </div>
        )}
      </div>

      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading…</p> : students.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No students added yet.</p>
      ) : (
        Object.entries(byYear).map(([yr, list]) => (
          <div key={yr} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>{yr} ({list.length})</h3>
            {list.map(st => (
              <div key={st.id} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {st.name} {st.regNo && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {st.regNo}</span>}
                    {st.department && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px' }}>{st.department}</span>}
                    {st.cohort && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', borderRadius: 20, padding: '2px 8px' }}>{st.cohort}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{st.email}</div>
                </div>
                <Btn sm variant="danger" onClick={() => removeStudent(st.id)}>Remove</Btn>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

// ── Groups ───────────────────────────────────────────────────────────────────
function GroupEditor({ collegeId, college, initial, onDone, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [memberEmails, setMemberEmails] = useState(initial?.memberEmails || [])
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [cohortFilter, setCohortFilter] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  useEffect(() => {
    getDocs(query(collection(db, 'collegeStudents'), where('collegeId', '==', collegeId))).then(snap => {
      setRoster(snap.docs.map(d => d.data()))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [collegeId])

  const visibleRoster = roster.filter(st =>
    (!yearFilter || st.academicYear === yearFilter) &&
    (!departmentFilter || st.department === departmentFilter) &&
    (!cohortFilter || st.cohort === cohortFilter)
  )
  const toggle = (email) => setMemberEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])
  const addAllVisible = () => setMemberEmails(prev => [...new Set([...prev, ...visibleRoster.map(st => st.email)])])

  const uploadJson = () => {
    setJsonError('')
    let parsed
    try { parsed = JSON.parse(jsonText.trim()) } catch (e) { setJsonError('Invalid JSON: ' + e.message); return }
    const arr = Array.isArray(parsed) ? parsed : [parsed]
    const emails = arr.map(it => (typeof it === 'string' ? it : it.email)).filter(Boolean).map(e => e.trim().toLowerCase())
    if (emails.length === 0) { setJsonError('No valid emails found. Paste an array of email strings, or objects with an "email" field.'); return }
    setMemberEmails(prev => [...new Set([...prev, ...emails])])
    setJsonMode(false); setJsonText('')
  }

  const save = async () => {
    setErr('')
    if (!name.trim()) { setErr('Group name is required.'); return }
    if (memberEmails.length === 0) { setErr('Add at least one student to the group.'); return }
    setSaving(true)
    const now = new Date().toISOString()
    const id = initial?.id || doc(collection(db, 'studentGroups')).id
    const data = { collegeId, name: name.trim(), memberEmails, createdAt: initial?.createdAt || now, updatedAt: now }
    try {
      await setDoc(doc(db, 'studentGroups', id), data)
    } catch (e) {
      setErr('Failed to save: ' + e.message)
      setSaving(false)
      return
    }
    setSaving(false)
    onDone({ id, ...data })
  }

  return (
    <div style={s.card}>
      <h3 style={{ margin: '0 0 16px' }}>{initial ? 'Edit Group' : 'New Group'}</h3>
      <Field label="Group Name"><input style={s.inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CSE-A 2024 Batch" /></Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
        <Field label="Filter roster by Academic Year">
          <select style={s.inp} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="">All years</option>
            {(college.academicYears || []).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Filter roster by Department">
          <select style={s.inp} value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="">All departments</option>
            {(college.departments || []).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Filter roster by Cohort / Batch">
          <select style={s.inp} value={cohortFilter} onChange={e => setCohortFilter(e.target.value)}>
            <option value="">All cohorts</option>
            {(college.cohorts || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {loading ? <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading roster…</p> : visibleRoster.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No students match this filter — add students in the Students tab first.</p>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}><Btn sm variant="ghost" onClick={addAllVisible}>+ Add all {visibleRoster.length} shown</Btn></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto', marginBottom: 14 }}>
            {visibleRoster.map(st => (
              <label key={st.email} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 8px', borderRadius: 6, background: memberEmails.includes(st.email) ? 'var(--primary-light)' : 'transparent' }}>
                <input type="checkbox" checked={memberEmails.includes(st.email)} onChange={() => toggle(st.email)} />
                {st.name} {st.regNo && <span style={{ color: 'var(--text-muted)' }}>· {st.regNo}</span>} {st.department && <span style={{ color: 'var(--text-muted)' }}>· {st.department}</span>} <span style={{ color: 'var(--text-muted)' }}>· {st.email}</span>
              </label>
            ))}
          </div>
        </>
      )}

      <Field label={`Members (${memberEmails.length})`}>
        <ChipEditor items={memberEmails} onChange={setMemberEmails} placeholder="Add by email — student@example.com" />
        <div style={{ marginTop: 8 }}>
          <Btn sm variant="ghost" onClick={() => setJsonMode(m => !m)}>{jsonMode ? '✕ Close JSON' : '📋 Paste JSON to add many at once'}</Btn>
        </div>
        {jsonMode && (
          <div style={{ ...s.card, background: 'var(--bg)', marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Paste an array of emails — either plain strings, or objects with an "email" field.</p>
              <Btn sm variant="ghost" onClick={() => setJsonText('[\n  "asha.rao@example.com",\n  "vikram.singh@example.com"\n]')}>Load Template</Btn>
            </div>
            <textarea style={{ ...s.inp, minHeight: 120, fontFamily: 'monospace', fontSize: 12 }} value={jsonText} onChange={e => setJsonText(e.target.value)} />
            {jsonError && <p style={{ color: '#ef4444', fontSize: 12 }}>{jsonError}</p>}
            <Btn sm variant="success" onClick={uploadJson}>Upload</Btn>
          </div>
        )}
      </Field>

      {err && <p style={{ color: '#ef4444', fontSize: 13 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Btn variant="success" onClick={save}>{saving ? 'Saving…' : 'Save Group'}</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  )
}

function GroupsTab({ collegeId, college }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | 'new' | group object

  const load = () => {
    setLoading(true)
    getDocs(query(collection(db, 'studentGroups'), where('collegeId', '==', collegeId))).then(snap => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(load, [collegeId])

  const remove = async (id) => {
    if (!window.confirm('Delete this group? Assessment Modules already assigned to it will keep their targeting.')) return
    await deleteDoc(doc(db, 'studentGroups', id))
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  if (editing) {
    return (
      <GroupEditor
        collegeId={collegeId}
        college={college}
        initial={editing === 'new' ? null : editing}
        onDone={() => { setEditing(null); load() }}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Groups ({groups.length})</h2>
        <Btn onClick={() => setEditing('new')}>+ New Group</Btn>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
        Build a reusable group of students (e.g. from a cohort/batch) once, then pick it while creating an Assessment Module instead of selecting students one by one each time.
      </p>
      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading…</p> : groups.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No groups yet.</p>
      ) : (
        groups.map(g => (
          <div key={g.id} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{g.memberEmails?.length || 0} students</div>
            </div>
            <Btn sm variant="ghost" onClick={() => setEditing(g)}>Edit</Btn>
            <Btn sm variant="danger" onClick={() => remove(g.id)}>Delete</Btn>
          </div>
        ))
      )}
    </div>
  )
}

// ── Assessment Modules ────────────────────────────────────────────────────────
function CheckboxGroup({ options, selected, onChange }) {
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt])
  if (options.length === 0) return <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>None configured — add some in College Settings first.</p>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const on = selected.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)} style={{
            fontSize: 13, fontWeight: on ? 700 : 400, cursor: 'pointer', borderRadius: 20, padding: '6px 14px',
            background: on ? 'var(--primary)' : 'transparent', color: on ? '#fff' : 'var(--text)',
            border: `1px solid ${on ? 'var(--primary)' : 'var(--border)'}`,
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ ...s.card, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: subtitle ? 2 : 12 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{subtitle}</div>}
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />
}

function MCQForm({ form, set, onSave, onCancel }) {
  return (
    <div>
      <Field label="Question"><input style={s.inp} value={form.q} onChange={e => set('q', e.target.value)} placeholder="What is...?" /></Field>
      {form.opts.map((opt, i) => (
        <Field key={i} label={`Option ${i + 1}${form.ans === i ? ' (correct)' : ''}`}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="radio" checked={form.ans === i} onChange={() => set('ans', i)} />
            <input style={s.inp} value={opt} onChange={e => set('opts', form.opts.map((o, idx) => idx === i ? e.target.value : o))} />
          </div>
        </Field>
      ))}
      <Field label="Explanation (optional)"><textarea style={{ ...s.inp, minHeight: 60 }} value={form.exp} onChange={e => set('exp', e.target.value)} /></Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={onSave}>Save Question</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  )
}

function QuizEditor({ items, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_MCQ)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  const save = () => {
    if (!form.q.trim() || form.opts.some(o => !o.trim())) return
    if (editing === 'new') onChange([...items, { ...form }])
    else onChange(items.map((it, i) => i === editing ? { ...form } : it))
    setEditing(null)
  }

  const uploadJson = () => {
    setJsonError('')
    try {
      const parsed = JSON.parse(jsonText.trim())
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      const clean = arr.map(it => ({ ...BLANK_MCQ, ...it, opts: (it.opts || BLANK_MCQ.opts).map(String) }))
      onChange([...items, ...clean])
      setJsonMode(false); setJsonText('')
    } catch (e) { setJsonError('Invalid JSON: ' + e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>❓ Quiz Questions ({items.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn sm variant="ghost" onClick={() => setJsonMode(m => !m)}>{jsonMode ? '✕ Close JSON' : '📋 Paste JSON'}</Btn>
          <Btn sm onClick={() => { setForm(BLANK_MCQ); setEditing('new') }}>+ Add Question</Btn>
        </div>
      </div>
      {items.length === 0 && editing === null && !jsonMode && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>No questions yet — add one manually or paste a batch as JSON.</p>
      )}
      {jsonMode && (
        <div style={{ ...s.card, border: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Paste an array of {'{ q, opts:[4], ans, exp }'} objects.</p>
            <Btn sm variant="ghost" onClick={() => setJsonText(QUIZ_JSON_TEMPLATE)}>Load Template</Btn>
          </div>
          <textarea style={{ ...s.inp, minHeight: 140, fontFamily: 'monospace', fontSize: 12 }} value={jsonText} onChange={e => setJsonText(e.target.value)} />
          {jsonError && <p style={{ color: '#ef4444', fontSize: 12 }}>{jsonError}</p>}
          <Btn sm variant="success" onClick={uploadJson}>Upload</Btn>
        </div>
      )}
      {editing === 'new' && <ActiveCard><MCQForm form={form} set={set} onSave={save} onCancel={() => setEditing(null)} /></ActiveCard>}
      {items.map((it, i) => (
        editing === i ? (
          <ActiveCard key={i}><MCQForm form={form} set={set} onSave={save} onCancel={() => setEditing(null)} /></ActiveCard>
        ) : (
          <div key={i} style={{ ...s.card, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontSize: 13 }}>{it.q}</span>
            <Btn sm variant="ghost" onClick={() => { setForm({ ...BLANK_MCQ, ...it }); setEditing(i) }}>Edit</Btn>
            <Btn sm variant="danger" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>Delete</Btn>
          </div>
        )
      ))}
    </div>
  )
}

function CodingEditor({ items, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_PROB)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')

  const save = () => {
    if (!form.title.trim() || !form.description.trim()) return
    if (editing === 'new') onChange([...items, { ...form, id: Date.now() }])
    else onChange(items.map((it, i) => i === editing ? { ...form, id: it.id } : it))
    setEditing(null)
  }

  const uploadJson = () => {
    setJsonError('')
    try {
      const parsed = JSON.parse(jsonText.trim())
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      const clean = arr.map(it => ({
        ...BLANK_PROB, ...it,
        examples: it.examples || BLANK_PROB.examples,
        testCases: it.testCases || BLANK_PROB.testCases,
        starterCode: { ...BLANK_PROB.starterCode, ...(it.starterCode || {}) },
        id: Date.now() + Math.random(),
      }))
      onChange([...items, ...clean])
      setJsonMode(false); setJsonText('')
    } catch (e) { setJsonError('Invalid JSON: ' + e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>💻 Coding Challenges ({items.length})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn sm variant="ghost" onClick={() => setJsonMode(m => !m)}>{jsonMode ? '✕ Close JSON' : '📋 Paste JSON'}</Btn>
          <Btn sm onClick={() => { setForm(BLANK_PROB); setEditing('new') }}>+ Add Problem</Btn>
        </div>
      </div>
      {items.length === 0 && editing === null && !jsonMode && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>No coding challenges yet — add one manually or paste a batch as JSON.</p>
      )}
      {jsonMode && (
        <div style={{ ...s.card, border: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Paste an array of coding-problem objects (same shape as Coding Practice problems).</p>
            <Btn sm variant="ghost" onClick={() => setJsonText(CODING_JSON_TEMPLATE)}>Load Template</Btn>
          </div>
          <textarea style={{ ...s.inp, minHeight: 140, fontFamily: 'monospace', fontSize: 12 }} value={jsonText} onChange={e => setJsonText(e.target.value)} />
          {jsonError && <p style={{ color: '#ef4444', fontSize: 12 }}>{jsonError}</p>}
          <Btn sm variant="success" onClick={uploadJson}>Upload</Btn>
        </div>
      )}
      {editing === 'new' && <ActiveCard><ProblemForm form={form} set={set} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} /></ActiveCard>}
      {items.map((it, i) => (
        editing === i ? (
          <ActiveCard key={it.id}><ProblemForm form={form} set={set} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} /></ActiveCard>
        ) : (
          <div key={it.id} style={{ ...s.card, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{it.title}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{it.category} · {it.difficulty}</span>
            <Btn sm variant="ghost" onClick={() => { setForm(it); setEditing(i) }}>Edit</Btn>
            <Btn sm variant="danger" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>Delete</Btn>
          </div>
        )
      ))}
    </div>
  )
}

function StudentTargetPicker({ collegeId, targetDepartments, targetYears, targetEmails, onChange }) {
  const [roster, setRoster] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'collegeStudents'), where('collegeId', '==', collegeId))),
      getDocs(query(collection(db, 'studentGroups'), where('collegeId', '==', collegeId))),
    ]).then(([sSnap, gSnap]) => {
      setRoster(sSnap.docs.map(d => d.data()))
      setGroups(gSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [collegeId])

  const visibleRoster = roster.filter(s =>
    (!targetYears.length || targetYears.includes(s.academicYear)) &&
    (!targetDepartments.length || targetDepartments.includes(s.department))
  )
  const toggle = (email) => onChange(targetEmails.includes(email) ? targetEmails.filter(e => e !== email) : [...targetEmails, email])
  const addGroup = (g) => onChange([...new Set([...targetEmails, ...(g.memberEmails || [])])])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: targetEmails.length ? 'var(--primary)' : 'var(--text-muted)' }}>
          {targetEmails.length} student{targetEmails.length === 1 ? '' : 's'} selected
        </div>
        {targetEmails.length > 0 && <button onClick={() => onChange([])} style={{ fontSize: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>}
      </div>

      {!loading && groups.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {groups.map(g => (
            <button key={g.id} onClick={() => addGroup(g)} style={{ fontSize: 12, fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', color: 'var(--text)' }}>
              🧩 {g.name} · {g.memberEmails?.length || 0}
            </button>
          ))}
        </div>
      )}

      {loading ? <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading roster…</p> : visibleRoster.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>No students on your roster{(targetYears.length || targetDepartments.length) ? ' match the selected department(s)/year(s)' : ''} — add them in the Students tab, or add by email below.</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
          {visibleRoster.map((st, i) => (
            <label key={st.email} style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '7px 10px', cursor: 'pointer',
              background: targetEmails.includes(st.email) ? 'var(--primary-light)' : 'transparent',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
            }}>
              <input type="checkbox" checked={targetEmails.includes(st.email)} onChange={() => toggle(st.email)} />
              <span style={{ fontWeight: 600 }}>{st.name}</span>
              {st.regNo && <span style={{ color: 'var(--text-muted)' }}>{st.regNo}</span>}
              {st.department && <span style={{ color: 'var(--text-muted)' }}>· {st.department}</span>}
              <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{st.email}</span>
            </label>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Or add by email</div>
      <ChipEditor items={targetEmails} onChange={onChange} placeholder="student@example.com" />
    </div>
  )
}

function ModuleEditor({ collegeId, college, initial, onDone, onCancel }) {
  const { user, collegeAdminProfile } = useApp()
  const [form, setForm] = useState(() => ({
    ...BLANK_MODULE,
    ...initial,
    quiz: initial?.quiz || { items: [] },
    coding: initial?.coding || { items: [] },
    targetEmails: initial?.targetEmails || [],
  }))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (publish) => {
    setErr('')
    if (!form.title.trim()) { setErr('Title is required.'); return }
    const hasQuiz = (form.quiz?.items || []).length > 0
    const hasCoding = (form.coding?.items || []).length > 0
    if (!hasQuiz && !hasCoding) { setErr('Add at least one quiz question or coding challenge.'); return }
    setSaving(true)
    const now = new Date().toISOString()
    const id = initial?.id || doc(collection(db, 'assessmentModules')).id
    const data = {
      collegeId,
      title: form.title.trim(),
      description: form.description.trim(),
      quiz: hasQuiz ? form.quiz : null,
      coding: hasCoding ? form.coding : null,
      targetDepartments: form.targetDepartments,
      targetYears: form.targetYears,
      targetEmails: form.targetEmails,
      opensAt: form.opensAt, dueAt: form.dueAt,
      timerMinutes: form.timerMinutes ? Number(form.timerMinutes) : null,
      status: publish ? 'published' : 'draft',
      createdBy: initial?.createdBy || collegeAdminProfile?.email || user?.email || '',
      createdAt: initial?.createdAt || now,
      updatedAt: now,
    }
    await setDoc(doc(db, 'assessmentModules', id), data)
    setSaving(false)
    onDone({ id, ...data })
  }

  const contentCount = form.quiz.items.length + form.coding.items.length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{initial ? 'Edit Module' : 'New Assessment Module'}</h2>
        <Btn variant="ghost" onClick={onCancel}>✕ Cancel</Btn>
      </div>

      <Section title="Basic Details">
        <Field label="Title"><input style={s.inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Semester 1 Coding Assessment" /></Field>
        <Field label="Description (optional)"><textarea style={{ ...s.inp, minHeight: 60 }} value={form.description} onChange={e => set('description', e.target.value)} /></Field>
      </Section>

      <Section title="Schedule" subtitle="Leave blank for an always-open, practice-style module.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Opens At"><input type="datetime-local" style={{ ...s.inp, padding: '9px 12px' }} value={toLocalInput(form.opensAt)} onChange={e => set('opensAt', toIso(e.target.value))} /></Field>
          <Field label="Due At"><input type="datetime-local" style={{ ...s.inp, padding: '9px 12px' }} value={toLocalInput(form.dueAt)} onChange={e => set('dueAt', toIso(e.target.value))} /></Field>
        </div>
        <Field label="Timer (minutes, optional)">
          <input type="number" min="1" style={{ ...s.inp, maxWidth: 180 }} value={form.timerMinutes} onChange={e => set('timerMinutes', e.target.value)} placeholder="e.g. 60" />
        </Field>
      </Section>

      <Section title="Audience" subtitle="Choose who this module is assigned to.">
        <Field label="Departments (none = entire college)">
          <CheckboxGroup options={college.departments || []} selected={form.targetDepartments} onChange={v => set('targetDepartments', v)} />
        </Field>
        <Field label="Academic Years (none = entire college)">
          <CheckboxGroup options={college.academicYears || []} selected={form.targetYears} onChange={v => set('targetYears', v)} />
        </Field>
        <Divider />
        <Field label="Specific Students (optional — overrides department/year selection above)">
          <StudentTargetPicker collegeId={collegeId} targetDepartments={form.targetDepartments} targetYears={form.targetYears} targetEmails={form.targetEmails} onChange={v => set('targetEmails', v)} />
        </Field>
      </Section>

      <div style={{ ...s.card, marginBottom: 16 }}>
        <QuizEditor items={form.quiz.items} onChange={items => set('quiz', { items })} />
      </div>
      <div style={{ ...s.card, marginBottom: 16 }}>
        <CodingEditor items={form.coding.items} onChange={items => set('coding', { items })} />
      </div>

      {err && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>{err}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
        <Btn variant="success" onClick={() => save(true)}>{saving ? 'Saving…' : 'Publish'}</Btn>
        <Btn variant="ghost" onClick={() => save(false)}>Save as Draft</Btn>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{contentCount} item{contentCount === 1 ? '' : 's'} total</span>
      </div>
    </div>
  )
}

function AssessmentModulesTab({ collegeId, college }) {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | 'new' | module object

  const load = () => {
    setLoading(true)
    getDocs(query(collection(db, 'assessmentModules'), where('collegeId', '==', collegeId))).then(snap => {
      setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(load, [collegeId])

  const remove = async (id) => {
    if (!window.confirm('Delete this assessment module? This cannot be undone.')) return
    await deleteDoc(doc(db, 'assessmentModules', id))
    setModules(prev => prev.filter(m => m.id !== id))
  }

  if (editing) {
    return (
      <ModuleEditor
        collegeId={collegeId}
        college={college}
        initial={editing === 'new' ? null : editing}
        onDone={(saved) => { setEditing(null); load() }}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Assessment Modules ({modules.length})</h2>
        <Btn onClick={() => setEditing('new')}>+ New Module</Btn>
      </div>
      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading…</p> : modules.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No assessment modules yet.</p>
      ) : (
        modules.map(m => (
          <div key={m.id} style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {m.status === 'published' ? '🟢 Published' : '⚪ Draft'}
                {' · '}
                {m.targetEmails?.length ? `${m.targetEmails.length} specific student${m.targetEmails.length > 1 ? 's' : ''}` : (m.targetDepartments?.length || m.targetYears?.length) ? 'Targeted' : 'Entire college'}
                {m.dueAt ? ` · Due ${new Date(m.dueAt).toLocaleString()}` : ''}
              </div>
            </div>
            <Btn sm variant="ghost" onClick={() => setEditing(m)}>Edit</Btn>
            <Btn sm variant="danger" onClick={() => remove(m.id)}>Delete</Btn>
          </div>
        ))
      )}
    </div>
  )
}

// ── Results ───────────────────────────────────────────────────────────────────
function ResultsTab({ collegeId }) {
  const [students, setStudents] = useState([])
  const [modules, setModules]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loadingSub, setLoadingSub]   = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getDocs(query(collection(db, 'users'), where('profile.collegeId', '==', collegeId))),
      getDocs(query(collection(db, 'assessmentModules'), where('collegeId', '==', collegeId))),
    ]).then(([uSnap, mSnap]) => {
      setStudents(uSnap.docs.map(d => ({ uid: d.id, ...d.data().profile })))
      setModules(mSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [collegeId])

  const openStudent = async (stu) => {
    setSelected(stu); setLoadingSub(true); setSubmissions([])
    const snap = await getDocs(query(collection(db, 'moduleSubmissions'), where('uid', '==', stu.uid)))
    setSubmissions(snap.docs.map(d => d.data()))
    setLoadingSub(false)
  }

  const moduleTitle = (id) => modules.find(m => m.id === id)?.title || '(deleted module)'

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 260, flexShrink: 0 }}>
        <h3 style={{ fontSize: 15, margin: '0 0 12px' }}>Students ({students.length})</h3>
        {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading…</p> : students.map(stu => (
          <div key={stu.uid} onClick={() => openStudent(stu)} style={{
            ...s.card, padding: '10px 12px', cursor: 'pointer',
            border: selected?.uid === stu.uid ? '2px solid var(--primary)' : s.card.border,
          }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{stu.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stu.branch} · {stu.yearOfStudy}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        {!selected ? (
          <p style={{ color: 'var(--text-secondary)' }}>Select a student to view their assessment results.</p>
        ) : loadingSub ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : submissions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>{selected.name} hasn't attempted any assessment modules yet.</p>
        ) : (
          submissions.map(sub => (
            <div key={sub.moduleId} style={s.card}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{moduleTitle(sub.moduleId)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>
                {sub.status === 'submitted' ? `Submitted ${new Date(sub.submittedAt).toLocaleString()}` : 'In progress'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Total Score: {sub.totalScore ?? 0}</div>
              {sub.quizResult && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Quiz: {sub.quizResult.correct}/{sub.quizResult.total} correct</div>}
              {sub.codingResults?.length > 0 && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Coding: {sub.codingResults.filter(r => r.passed === r.total).length}/{sub.codingResults.length} fully passed</div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Portal shell ─────────────────────────────────────────────────────────────
export default function CollegeAdminPortal() {
  const { user, isCollegeAdmin, collegeAdminProfile, logout } = useApp()
  const { colleges, collegesLoading } = useCollege()
  const navigate = useNavigate()
  const [tab, setTab] = useState('settings')

  if (!isCollegeAdmin) return <Navigate to="/dashboard" replace />
  if (collegesLoading) return null

  const college = colleges.find(c => c.id === collegeAdminProfile?.collegeId)
  if (!college) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2>College not found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your college record could not be loaded. Contact the platform admin.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{college.name} — College Admin Portal</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Welcome, {collegeAdminProfile?.name || user?.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => navigate('/dashboard')}>← Back to App</Btn>
          <Btn variant="danger" onClick={() => { logout(); navigate('/login') }}>Sign Out</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
        <aside style={{ width: 210, background: 'var(--card)', borderRight: '1px solid var(--border)', paddingTop: 16, flexShrink: 0 }}>
          {PORTAL_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: '100%', textAlign: 'left', padding: '11px 20px', border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'var(--primary-light)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text)',
              fontWeight: tab === t.key ? 700 : 400, fontSize: 14,
              borderLeft: `3px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
            }}>
              {t.label}
            </button>
          ))}
        </aside>
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {tab === 'settings' && <CollegeSettingsTab college={college} />}
          {tab === 'students' && <StudentsTab collegeId={college.id} college={college} />}
          {tab === 'groups'   && <GroupsTab collegeId={college.id} college={college} />}
          {tab === 'modules'  && <AssessmentModulesTab collegeId={college.id} college={college} />}
          {tab === 'results'  && <ResultsTab collegeId={college.id} />}
        </main>
      </div>
    </div>
  )
}
