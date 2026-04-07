import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'

const ADMIN_EMAIL = 'kakarlarishi5124@gmail.com'
const PROB_CATS = ['Arrays', 'Strings', 'Recursion', 'Linked Lists', 'Stacks', 'Queues']
const DIFFS = ['Easy', 'Medium', 'Hard']
const Q_CATS = ['Programming', 'Logical Reasoning', 'Data Structures']

// ── Shared UI helpers ─────────────────────────────────────────────────────────
const s = {
  card: { background: 'var(--card)', borderRadius: 12, padding: 20, marginBottom: 14, border: '1px solid var(--border)' },
  inp: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' },
  lbl: { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 },
}

function Btn({ onClick, children, variant = 'primary', sm, type = 'button' }) {
  const styles = {
    primary: { background: 'var(--primary)', color: '#fff', border: 'none' },
    danger:  { background: '#ef4444', color: '#fff', border: 'none' },
    success: { background: '#10b981', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  }
  return (
    <button type={type} onClick={onClick} style={{
      ...styles[variant],
      borderRadius: 6, padding: sm ? '4px 10px' : '7px 14px',
      fontSize: sm ? 12 : 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  )
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}><label style={s.lbl}>{label}</label>{children}</div>
}

function ActiveCard({ children }) {
  return <div style={{ ...s.card, border: '2px solid var(--primary)', marginBottom: 14 }}>{children}</div>
}

// ── Coding Problems ───────────────────────────────────────────────────────────
const BLANK_PROB = {
  title: '', category: 'Arrays', difficulty: 'Easy',
  description: '', inputFormat: '', outputFormat: '', constraints: '',
  points: 10,
  hints: { idea: '', approach: '', pseudocode: '', code: '' },
  hintPenalties: { idea: 1, approach: 1, pseudocode: 1, code: 2 },
  examples:  [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', expectedOutput: '', hidden: false }],
  starterCode: { 71: '', 63: '', 54: '' },
}


const JSON_TEMPLATE = `{
  "title": "Two Sum",
  "category": "Arrays",
  "difficulty": "Easy",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "inputFormat": "First line: array elements separated by spaces\\nSecond line: target integer",
  "outputFormat": "Two space-separated indices",
  "constraints": "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9",
  "points": 10,
  "hintPenalties": { "idea": 1, "approach": 1, "pseudocode": 1, "code": 2 },
  "hints": {
    "idea": "Think about how you can avoid the nested loop using a data structure.",
    "approach": "Use a hash map to store each number and its index as you iterate.",
    "pseudocode": "for each num at index i:\\n  complement = target - num\\n  if complement in map: return [map[complement], i]\\n  map[num] = i",
    "code": "def twoSum(nums, target):\\n    seen = {}\\n    for i, n in enumerate(nums):\\n        if target - n in seen:\\n            return [seen[target-n], i]\\n        seen[n] = i"
  },
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
}`

function CodingProblemsTab({ problems = [], onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_PROB)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [jsonSuccess, setJsonSuccess] = useState('')

  const deepClone = (p) => ({
    ...p,
    hints:       { ...(p.hints || {}) },
    examples:   (p.examples  || []).map(e => ({ ...e })),
    testCases:  (p.testCases || []).map(t => ({ ...t })),
    starterCode: { ...(p.starterCode || {}) },
  })

  const save = () => {
    if (!form.title.trim() || !form.description.trim()) return
    if (editing === 'new') {
      onUpdate([...problems, { ...deepClone(form), id: Date.now() }])
    } else {
      onUpdate(problems.map(p => p.id === editing ? { ...deepClone(form), id: editing } : p))
    }
    setEditing(null)
  }

  const remove = (id) => {
    if (!window.confirm('Delete this problem?')) return
    onUpdate(problems.filter(p => p.id !== id))
  }

  const handleJsonUpload = () => {
    setJsonError('')
    setJsonSuccess('')
    let parsed
    try {
      parsed = JSON.parse(jsonText.trim())
    } catch (e) {
      setJsonError('Invalid JSON: ' + e.message)
      return
    }
    // Support single object or array of objects
    const items = Array.isArray(parsed) ? parsed : [parsed]
    const errors = []
    items.forEach((item, idx) => {
      if (!item.title?.trim()) errors.push(`Item ${idx + 1}: missing "title"`)
      if (!item.description?.trim()) errors.push(`Item ${idx + 1}: missing "description"`)
    })
    if (errors.length) { setJsonError(errors.join('\n')); return }

    const newProblems = items.map(item => ({
      ...BLANK_PROB,
      ...item,
      examples:    (item.examples  || [{ input: '', output: '', explanation: '' }]),
      testCases:   (item.testCases || [{ input: '', expectedOutput: '', hidden: false }]),
      starterCode: { 71: '', 63: '', 54: '', ...(item.starterCode || {}) },
      id: Date.now() + Math.random(),
    }))
    onUpdate([...problems, ...newProblems])
    setJsonSuccess(`✅ ${newProblems.length} problem${newProblems.length > 1 ? 's' : ''} added successfully!`)
    setJsonText('')
    setTimeout(() => { setJsonMode(false); setJsonSuccess('') }, 1800)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>
          Coding Problems <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>({problems.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={() => { setJsonMode(m => !m); setJsonError(''); setJsonSuccess('') }}>
            {jsonMode ? '✕ Close JSON' : '📋 Paste JSON'}
          </Btn>
          <Btn onClick={() => { setForm(BLANK_PROB); setEditing('new'); setJsonMode(false) }}>+ Add Problem</Btn>
        </div>
      </div>

      {/* JSON paste panel */}
      {jsonMode && (
        <div style={{ ...s.card, border: '2px solid var(--primary)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📋 Paste JSON to Upload Problem(s)</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paste a single object <code>{'{...}'}</code> or an array <code>{'[{...},{...}]'}</code> to add multiple at once.</div>
            </div>
            <Btn sm variant="ghost" onClick={() => setJsonText(JSON_TEMPLATE)}>Load Template</Btn>
          </div>

          <textarea
            value={jsonText}
            onChange={e => { setJsonText(e.target.value); setJsonError(''); setJsonSuccess('') }}
            placeholder={'Paste your JSON here…\n\nClick "Load Template" to see the expected format.'}
            style={{ ...s.inp, minHeight: 260, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
          />

          {jsonError && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#b91c1c', whiteSpace: 'pre-line' }}>
              {jsonError}
            </div>
          )}
          {jsonSuccess && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
              {jsonSuccess}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn onClick={handleJsonUpload} variant="success">⬆ Upload Problem(s)</Btn>
            <Btn variant="ghost" onClick={() => { setJsonMode(false); setJsonText(''); setJsonError(''); setJsonSuccess('') }}>Cancel</Btn>
          </div>
        </div>
      )}

      {editing === 'new' && (
        <ActiveCard>
          <h3 style={{ margin: '0 0 16px' }}>New Problem</h3>
          <ProblemForm form={form} set={set} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} />
        </ActiveCard>
      )}

      {problems.map(p => (
        <div key={p.id}>
          {editing === p.id ? (
            <ActiveCard>
              <h3 style={{ margin: '0 0 16px' }}>Edit: {p.title}</h3>
              <ProblemForm form={form} set={set} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} />
            </ActiveCard>
          ) : (
            <div style={{ ...s.card, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, minWidth: 160 }}>{p.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.category}</span>
                <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {(p.examples?.length || 0)} example{(p.examples?.length || 0) !== 1 ? 's' : ''} ·{' '}
                  {(p.testCases?.length || 0)} test case{(p.testCases?.length || 0) !== 1 ? 's' : ''}
                  {(p.testCases?.filter(t => t.hidden)?.length || 0) > 0
                    ? ` (${p.testCases.filter(t => t.hidden).length} hidden)` : ''}
                </span>
                <Btn sm variant="ghost" onClick={() => { setForm(deepClone(p)); setEditing(p.id) }}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => remove(p.id)}>Delete</Btn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ProblemForm({ form, set, setForm, onSave, onCancel }) {

  // ── examples helpers
  const addExample   = () => setForm(f => ({ ...f, examples: [...f.examples, { input: '', output: '', explanation: '' }] }))
  const removeExample = (i) => setForm(f => ({ ...f, examples: f.examples.filter((_, idx) => idx !== i) }))
  const setExample   = (i, k, v) => setForm(f => ({ ...f, examples: f.examples.map((e, idx) => idx === i ? { ...e, [k]: v } : e) }))

  // ── test case helpers
  const addTestCase    = (hidden = false) => setForm(f => ({ ...f, testCases: [...f.testCases, { input: '', expectedOutput: '', hidden }] }))
  const removeTestCase = (i) => setForm(f => ({ ...f, testCases: f.testCases.filter((_, idx) => idx !== i) }))
  const setTestCase    = (i, k, v) => setForm(f => ({ ...f, testCases: f.testCases.map((t, idx) => idx === i ? { ...t, [k]: v } : t) }))

  const monoInp = { ...s.inp, fontFamily: 'monospace', fontSize: 12 }
  const sep = { borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16 }

  return (
    <>
      {/* ── Basic info ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
        <Field label="Title">
          <input style={s.inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Two Sum" />
        </Field>
        <Field label="Category">
          <select style={s.inp} value={form.category} onChange={e => set('category', e.target.value)}>
            {PROB_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Difficulty">
          <select style={s.inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
            {DIFFS.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Problem Description">
        <textarea style={{ ...s.inp, height: 90, resize: 'vertical' }} value={form.description}
          onChange={e => set('description', e.target.value)} placeholder="Describe the problem clearly..." />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Input Format">
          <textarea style={{ ...s.inp, height: 70, resize: 'vertical' }} value={form.inputFormat}
            onChange={e => set('inputFormat', e.target.value)} placeholder="First line: N&#10;Second line: N space-separated integers" />
        </Field>
        <Field label="Output Format">
          <textarea style={{ ...s.inp, height: 70, resize: 'vertical' }} value={form.outputFormat}
            onChange={e => set('outputFormat', e.target.value)} placeholder="A single integer — the answer" />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Constraints">
          <textarea style={{ ...s.inp, height: 60, resize: 'vertical' }} value={form.constraints}
            onChange={e => set('constraints', e.target.value)} placeholder="1 ≤ N ≤ 10⁵&#10;-10⁹ ≤ nums[i] ≤ 10⁹" />
        </Field>
        <Field label="Points (awarded on solve)">
          <input type="number" min="1" style={s.inp} value={form.points ?? 10}
            onChange={e => set('points', Number(e.target.value) || 1)} placeholder="10" />
        </Field>
      </div>

      {/* ── Staged Hints + Penalties ── */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
          💡 Staged Hints &amp; Penalties
        </div>
        {[
          { key: 'idea',       label: 'Hint 1 — Idea',        placeholder: 'Give students the key insight...', mono: false },
          { key: 'approach',   label: 'Hint 2 — Approach',    placeholder: 'Describe the algorithm approach...', mono: false },
          { key: 'pseudocode', label: 'Hint 3 — Pseudocode',  placeholder: 'Outline the steps in pseudocode...', mono: true },
          { key: 'code',       label: 'Final — Solution Code', placeholder: 'Provide the full solution code...', mono: true },
        ].map(h => (
          <div key={h.key} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10, marginBottom: 10, alignItems: 'start' }}>
            <Field label={h.label}>
              <textarea
                style={{ ...s.inp, height: 70, resize: 'vertical', fontFamily: h.mono ? 'monospace' : 'inherit', fontSize: h.mono ? 12 : 'inherit' }}
                value={form.hints?.[h.key] || ''}
                onChange={e => set('hints', { ...(form.hints || {}), [h.key]: e.target.value })}
                placeholder={h.placeholder}
              />
            </Field>
            <Field label="Penalty (pts)">
              <input type="number" min="0" style={s.inp}
                value={form.hintPenalties?.[h.key] ?? (h.key === 'code' ? 2 : 1)}
                onChange={e => set('hintPenalties', { ...(form.hintPenalties || {}), [h.key]: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
        ))}
      </div>

      {/* ── Sample Examples ── */}
      <div style={sep}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>📋 Sample Examples <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>(visible to students)</span></span>
          <Btn sm onClick={addExample}>+ Add Example</Btn>
        </div>
        {form.examples.map((ex, i) => (
          <div key={i} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Example {i + 1}</span>
              {form.examples.length > 1 && <Btn sm variant="danger" onClick={() => removeExample(i)}>Remove</Btn>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              <Field label="Input">
                <textarea style={{ ...monoInp, height: 60, resize: 'vertical' }} value={ex.input}
                  onChange={e => setExample(i, 'input', e.target.value)} placeholder="4 9&#10;2 7 11 15" />
              </Field>
              <Field label="Expected Output">
                <textarea style={{ ...monoInp, height: 60, resize: 'vertical' }} value={ex.output}
                  onChange={e => setExample(i, 'output', e.target.value)} placeholder="0 1" />
              </Field>
            </div>
            <Field label="Explanation (optional)">
              <input style={s.inp} value={ex.explanation} onChange={e => setExample(i, 'explanation', e.target.value)}
                placeholder="nums[0] + nums[1] = 9" />
            </Field>
          </div>
        ))}
      </div>

      {/* ── Test Cases ── */}
      <div style={sep}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>
            🧪 Test Cases
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12, marginLeft: 6 }}>
              ({form.testCases.filter(t => !t.hidden).length} visible · {form.testCases.filter(t => t.hidden).length} hidden)
            </span>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn sm onClick={() => addTestCase(false)}>+ Visible</Btn>
            <Btn sm variant="ghost" onClick={() => addTestCase(true)}>+ Hidden</Btn>
          </div>
        </div>

        {form.testCases.map((tc, i) => (
          <div key={i} style={{
            background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 8,
            border: `1px solid ${tc.hidden ? '#f59e0b44' : 'var(--border)'}`,
            borderLeft: `3px solid ${tc.hidden ? '#f59e0b' : 'var(--success)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Test {i + 1}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: tc.hidden ? '#f59e0b' : 'var(--success)' }}>
                  <input type="checkbox" checked={tc.hidden} onChange={e => setTestCase(i, 'hidden', e.target.checked)} />
                  {tc.hidden ? '🔒 Hidden' : '👁 Visible'}
                </label>
              </div>
              {form.testCases.length > 1 && <Btn sm variant="danger" onClick={() => removeTestCase(i)}>Remove</Btn>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Input (stdin)">
                <textarea style={{ ...monoInp, height: 60, resize: 'vertical' }} value={tc.input}
                  onChange={e => setTestCase(i, 'input', e.target.value)} placeholder="4 9&#10;2 7 11 15" />
              </Field>
              <Field label="Expected Output (stdout)">
                <textarea style={{ ...monoInp, height: 60, resize: 'vertical' }} value={tc.expectedOutput}
                  onChange={e => setTestCase(i, 'expectedOutput', e.target.value)} placeholder="0 1" />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <Btn onClick={onSave} variant="success">✓ Save Problem</Btn>
        <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
      </div>
    </>
  )
}

// ── Assessment Questions ──────────────────────────────────────────────────────
const BLANK_Q = { question: '', category: 'Programming', options: ['', '', '', ''], answer: 0 }

function AssessmentTab({ questions = [], onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_Q)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setOpt = (i, v) => setForm(f => ({ ...f, options: f.options.map((o, idx) => idx === i ? v : o) }))

  const save = () => {
    if (!form.question.trim() || form.options.some(o => !o.trim())) return
    if (editing === 'new') {
      onUpdate([...questions, { ...form, options: [...form.options], id: Date.now() }])
    } else {
      onUpdate(questions.map(q => q.id === editing ? { ...form, options: [...form.options], id: editing } : q))
    }
    setEditing(null)
  }

  const remove = (id) => {
    if (!window.confirm('Delete this question?')) return
    onUpdate(questions.filter(q => q.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Assessment Questions <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>({questions.length})</span></h2>
        <Btn onClick={() => { setForm(BLANK_Q); setEditing('new') }}>+ Add Question</Btn>
      </div>

      {editing === 'new' && (
        <ActiveCard>
          <h3 style={{ margin: '0 0 16px' }}>New Question</h3>
          <QuestionForm form={form} set={set} setOpt={setOpt} onSave={save} onCancel={() => setEditing(null)} />
        </ActiveCard>
      )}

      {questions.map((q, i) => (
        <div key={q.id}>
          {editing === q.id ? (
            <ActiveCard>
              <h3 style={{ margin: '0 0 16px' }}>Edit Question</h3>
              <QuestionForm form={form} set={set} setOpt={setOpt} onSave={save} onCancel={() => setEditing(null)} />
            </ActiveCard>
          ) : (
            <div style={{ ...s.card, padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, minWidth: 28 }}>Q{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{q.question}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {q.category} · Answer: <strong style={{ color: '#10b981' }}>{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</strong>
                  </div>
                </div>
                <Btn sm variant="ghost" onClick={() => { setForm({ ...q, options: [...q.options] }); setEditing(q.id) }}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => remove(q.id)}>Delete</Btn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function QuestionForm({ form, set, setOpt, onSave, onCancel }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12 }}>
        <Field label="Question">
          <textarea style={{ ...s.inp, height: 70, resize: 'vertical' }} value={form.question} onChange={e => set('question', e.target.value)} />
        </Field>
        <Field label="Category">
          <select style={s.inp} value={form.category} onChange={e => set('category', e.target.value)}>
            {Q_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        {form.options.map((opt, i) => (
          <Field key={i} label={`Option ${String.fromCharCode(65 + i)}`}>
            <input style={s.inp} value={opt} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
          </Field>
        ))}
      </div>
      <Field label="Correct Answer">
        <select style={{ ...s.inp, width: 'auto' }} value={form.answer} onChange={e => set('answer', Number(e.target.value))}>
          {form.options.map((opt, i) => (
            <option key={i} value={i}>{String.fromCharCode(65 + i)}. {opt || `Option ${String.fromCharCode(65 + i)}`}</option>
          ))}
        </select>
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={onSave} variant="success">Save Question</Btn>
        <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
      </div>
    </>
  )
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
const BLANK_PHASE = { title: '', duration: '2 weeks' }
const BLANK_TOPIC = {
  name: '', description: '', resources: [], quiz: [],
  concepts: [],           // [{heading, body, code}]
  keyPoints: [],          // [string]
  complexity: { time: '', space: '' },
}

const ROADMAP_LEVELS = [
  { key: 'beginner',     label: 'Rookie',    color: '#10b981' },
  { key: 'beginnerPlus', label: 'Explorer',  color: '#6366f1' },
  { key: 'intermediate', label: 'Coder',     color: '#f59e0b' },
  { key: 'advanced',     label: 'Master',    color: '#ef4444' },
]

function RoadmapTab({ roadmapByLevel = {}, onUpdate }) {
  const [level, setLevel] = useState('beginner')
  const phases = roadmapByLevel[level] || []

  const updateLevel = (updatedPhases) => onUpdate({ ...roadmapByLevel, [level]: updatedPhases })

  const [expandedPhase, setExpandedPhase] = useState(null)
  const [editingPhase, setEditingPhase] = useState(null)
  const [phaseForm, setPhaseForm] = useState(BLANK_PHASE)
  const [editingTopic, setEditingTopic] = useState(null)
  const [topicForm, setTopicForm] = useState(BLANK_TOPIC)
  const [jsonPhaseId, setJsonPhaseId] = useState(null)   // which phase's JSON panel is open
  const [jsonText, setJsonText]       = useState('')
  const [jsonError, setJsonError]     = useState('')
  const [jsonSuccess, setJsonSuccess] = useState('')

  const TOPIC_TEMPLATE = `[
  {
    "name": "Arrays & Hashing",
    "description": "Introduction to arrays and hash maps for efficient lookups.",
    "concepts": [
      {
        "heading": "What is an Array?",
        "body": "An array is a collection of elements stored at contiguous memory locations.",
        "code": "# Python\\narr = [1, 2, 3, 4, 5]\\nprint(arr[0])  # 1"
      }
    ],
    "keyPoints": [
      "Array indexing starts from 0",
      "Access time is O(1), search is O(n)"
    ],
    "complexity": { "time": "O(1) access, O(n) search", "space": "O(n)" },
    "resources": [
      { "title": "Arrays – YouTube", "url": "https://youtube.com" }
    ],
    "quiz": [
      {
        "question": "What is the time complexity of accessing an element by index?",
        "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        "answer": 0,
        "explanation": "Array index access is O(1) as it directly uses memory address."
      }
    ]
  }
]`

  const handleTopicJson = (phaseId) => {
    setJsonError(''); setJsonSuccess('')
    let parsed
    try { parsed = JSON.parse(jsonText.trim()) } catch (e) { setJsonError('Invalid JSON: ' + e.message); return }
    const items = Array.isArray(parsed) ? parsed : [parsed]
    const errors = []
    items.forEach((t, i) => { if (!t.name?.trim()) errors.push(`Item ${i+1}: missing "name"`) })
    if (errors.length) { setJsonError(errors.join('\n')); return }
    const newTopics = items.map(t => ({
      ...BLANK_TOPIC, ...t,
      id: `t${Date.now()}_${Math.random().toString(36).slice(2)}`,
      resources:   t.resources   || [],
      quiz:        t.quiz        || [],
      concepts:    t.concepts    || [],
      keyPoints:   t.keyPoints   || [],
      complexity:  t.complexity  || { time: '', space: '' },
    }))
    const updated = phases.map(p => p.id === phaseId ? { ...p, topics: [...p.topics, ...newTopics] } : p)
    updateLevel(updated)
    setJsonSuccess(`✅ ${newTopics.length} topic${newTopics.length > 1 ? 's' : ''} added!`)
    setJsonText('')
    setTimeout(() => { setJsonPhaseId(null); setJsonSuccess('') }, 1800)
  }

  // Reset UI when switching levels
  const switchLevel = (key) => {
    setLevel(key)
    setExpandedPhase(null)
    setEditingPhase(null)
    setEditingTopic(null)
  }

  const savePhase = () => {
    if (!phaseForm.title.trim()) return
    if (editingPhase === 'new') {
      updateLevel([...phases, { ...phaseForm, id: Date.now(), topics: [] }])
    } else {
      updateLevel(phases.map(p => p.id === editingPhase ? { ...p, title: phaseForm.title, duration: phaseForm.duration } : p))
    }
    setEditingPhase(null)
  }

  const removePhase = (id) => {
    if (!window.confirm('Delete this phase and all its topics?')) return
    updateLevel(phases.filter(p => p.id !== id))
  }

  const saveTopic = () => {
    if (!topicForm.name.trim()) return
    const updated = phases.map(phase => {
      if (phase.id !== editingTopic.phaseId) return phase
      const topics = editingTopic.topicId === 'new'
        ? [...phase.topics, { ...topicForm, id: `t${Date.now()}` }]
        : phase.topics.map(t => t.id === editingTopic.topicId ? { ...topicForm, id: t.id } : t)
      return { ...phase, topics }
    })
    updateLevel(updated)
    setEditingTopic(null)
  }

  const removeTopic = (phaseId, topicId) => {
    if (!window.confirm('Delete this topic?')) return
    updateLevel(phases.map(p => p.id === phaseId ? { ...p, topics: p.topics.filter(t => t.id !== topicId) } : p))
  }

  const addResource = () => setTopicForm(f => ({ ...f, resources: [...f.resources, { title: '', url: '' }] }))
  const removeResource = (i) => setTopicForm(f => ({ ...f, resources: f.resources.filter((_, idx) => idx !== i) }))
  const setResource = (i, k, v) => setTopicForm(f => ({
    ...f, resources: f.resources.map((r, idx) => idx === i ? { ...r, [k]: v } : r)
  }))

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 20 }}>Learning Roadmap</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ROADMAP_LEVELS.map(l => (
            <button key={l.key} onClick={() => switchLevel(l.key)} style={{
              padding: '7px 18px', borderRadius: 20, border: '2px solid',
              borderColor: level === l.key ? l.color : 'var(--border)',
              background: level === l.key ? l.color : 'transparent',
              color: level === l.key ? '#fff' : 'var(--text)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>
              {l.label}
              <span style={{ marginLeft: 6, opacity: 0.8, fontSize: 11 }}>
                ({(roadmapByLevel[l.key] || []).length} phases)
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Managing phases for <strong style={{ color: ROADMAP_LEVELS.find(l => l.key === level)?.color }}>
            {ROADMAP_LEVELS.find(l => l.key === level)?.label}
          </strong> level · {phases.length} phase{phases.length !== 1 ? 's' : ''}
        </div>
        <Btn onClick={() => { setPhaseForm(BLANK_PHASE); setEditingPhase('new') }}>+ Add Phase</Btn>
      </div>

      {editingPhase === 'new' && (
        <ActiveCard>
          <h3 style={{ margin: '0 0 14px' }}>New Phase</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <Field label="Title"><input style={s.inp} value={phaseForm.title} onChange={e => setPhaseForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Trees and Graphs" /></Field>
            <Field label="Duration"><input style={s.inp} value={phaseForm.duration} onChange={e => setPhaseForm(f => ({ ...f, duration: e.target.value }))} placeholder="2 weeks" /></Field>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={savePhase} variant="success">Save Phase</Btn>
            <Btn onClick={() => setEditingPhase(null)} variant="ghost">Cancel</Btn>
          </div>
        </ActiveCard>
      )}

      {phases.map((phase, idx) => (
        <div key={phase.id} style={s.card}>
          {editingPhase === phase.id ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
                <Field label="Title"><input style={s.inp} value={phaseForm.title} onChange={e => setPhaseForm(f => ({ ...f, title: e.target.value }))} /></Field>
                <Field label="Duration"><input style={s.inp} value={phaseForm.duration} onChange={e => setPhaseForm(f => ({ ...f, duration: e.target.value }))} /></Field>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn onClick={savePhase} variant="success">Save</Btn>
                <Btn onClick={() => setEditingPhase(null)} variant="ghost">Cancel</Btn>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{phase.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{phase.duration} · {phase.topics.length} topics</div>
                </div>
                <Btn sm variant="ghost" onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}>
                  {expandedPhase === phase.id ? 'Collapse' : 'Manage Topics'}
                </Btn>
                <Btn sm variant="ghost" onClick={() => { setPhaseForm({ title: phase.title, duration: phase.duration }); setEditingPhase(phase.id) }}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => removePhase(phase.id)}>Delete</Btn>
              </div>

              {expandedPhase === phase.id && (
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Topics</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn sm variant="ghost" onClick={() => {
                        setJsonPhaseId(jsonPhaseId === phase.id ? null : phase.id)
                        setJsonText(''); setJsonError(''); setJsonSuccess('')
                        setEditingTopic(null)
                      }}>
                        {jsonPhaseId === phase.id ? '✕ Close JSON' : '📋 Paste JSON'}
                      </Btn>
                      <Btn sm onClick={() => { setTopicForm(BLANK_TOPIC); setEditingTopic({ phaseId: phase.id, topicId: 'new' }); setJsonPhaseId(null) }}>+ Add Topic</Btn>
                    </div>
                  </div>

                  {/* JSON paste panel */}
                  {jsonPhaseId === phase.id && (
                    <div style={{ background: 'var(--card)', border: '2px solid var(--primary)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>📋 Paste JSON to add topics</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Single object <code>{'{...}'}</code> or array <code>{'[{...}]'}</code> for multiple topics at once.</div>
                        </div>
                        <Btn sm variant="ghost" onClick={() => setJsonText(TOPIC_TEMPLATE)}>Load Template</Btn>
                      </div>
                      <textarea
                        value={jsonText}
                        onChange={e => { setJsonText(e.target.value); setJsonError(''); setJsonSuccess('') }}
                        placeholder={'Paste your topic JSON here…\n\nClick "Load Template" to see all supported fields.'}
                        style={{ ...s.inp, minHeight: 200, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
                      />
                      {jsonError && <div style={{ marginTop: 6, padding: '7px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, color: '#b91c1c', whiteSpace: 'pre-line' }}>{jsonError}</div>}
                      {jsonSuccess && <div style={{ marginTop: 6, padding: '7px 12px', background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 12, color: '#065f46', fontWeight: 700 }}>{jsonSuccess}</div>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <Btn variant="success" onClick={() => handleTopicJson(phase.id)}>⬆ Upload Topics</Btn>
                        <Btn variant="ghost" onClick={() => { setJsonPhaseId(null); setJsonText(''); setJsonError(''); setJsonSuccess('') }}>Cancel</Btn>
                      </div>
                    </div>
                  )}

                  {editingTopic?.phaseId === phase.id && editingTopic?.topicId === 'new' && (
                    <TopicForm form={topicForm} setForm={setTopicForm} onSave={saveTopic} onCancel={() => setEditingTopic(null)}
                      addResource={addResource} removeResource={removeResource} setResource={setResource} isNew />
                  )}

                  {phase.topics.map(topic => (
                    <div key={topic.id}>
                      {editingTopic?.phaseId === phase.id && editingTopic?.topicId === topic.id ? (
                        <TopicForm form={topicForm} setForm={setTopicForm} onSave={saveTopic} onCancel={() => setEditingTopic(null)}
                          addResource={addResource} removeResource={removeResource} setResource={setResource} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 13, flex: 1 }}>{topic.name}</span>
                          {topic.description && <span style={{ fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 4, padding: '2px 6px' }}>Description</span>}
                          {topic.resources?.length > 0 && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '2px 6px' }}>{topic.resources.length} resource{topic.resources.length > 1 ? 's' : ''}</span>}
                          {topic.quiz?.length > 0 && <span style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', borderRadius: 4, padding: '2px 6px' }}>{topic.quiz.length} quiz Q</span>}
                          <Btn sm variant="ghost" onClick={() => { setTopicForm({ name: topic.name, description: topic.description || '', resources: [...(topic.resources || [])], quiz: [...(topic.quiz || [])] }); setEditingTopic({ phaseId: phase.id, topicId: topic.id }) }}>Edit</Btn>
                          <Btn sm variant="danger" onClick={() => removeTopic(phase.id, topic.id)}>Delete</Btn>
                        </div>
                      )}
                    </div>
                  ))}

                  {phase.topics.length === 0 && !editingTopic && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>No topics yet. Add one above.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function TopicForm({ form, setForm, onSave, onCancel, addResource, removeResource, setResource, isNew }) {
  const addConcept    = () => setForm(f => ({ ...f, concepts: [...(f.concepts||[]), { heading: '', body: '', code: '' }] }))
  const removeConcept = i  => setForm(f => ({ ...f, concepts: f.concepts.filter((_,idx)=>idx!==i) }))
  const setConcept    = (i,k,v) => setForm(f => ({ ...f, concepts: f.concepts.map((c,idx)=>idx===i?{...c,[k]:v}:c) }))
  const addKP         = () => setForm(f => ({ ...f, keyPoints: [...(f.keyPoints||[]), ''] }))
  const removeKP      = i  => setForm(f => ({ ...f, keyPoints: f.keyPoints.filter((_,idx)=>idx!==i) }))
  const setKP         = (i,v) => setForm(f => ({ ...f, keyPoints: f.keyPoints.map((k,idx)=>idx===i?v:k) }))

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 10, border: '1px solid var(--primary)' }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>{isNew ? 'New Topic' : 'Edit Topic'}</div>
      <Field label="Topic Name">
        <input style={s.inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Binary Trees & Traversals" />
      </Field>
      <Field label="Introduction / Overview">
        <textarea style={{ ...s.inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief introduction shown at the top of the article..." />
      </Field>

      {/* Concept Sections */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={s.lbl}>Concept Sections (GeeksforGeeks style)</label>
          <Btn sm variant="ghost" onClick={addConcept}>+ Add Section</Btn>
        </div>
        {(form.concepts||[]).map((c,i) => (
          <div key={i} style={{ background: 'var(--card)', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Section {i+1}</span>
              <Btn sm variant="danger" onClick={() => removeConcept(i)}>Remove</Btn>
            </div>
            <Field label="Heading"><input style={s.inp} value={c.heading} onChange={e=>setConcept(i,'heading',e.target.value)} placeholder="e.g. What is a Binary Tree?" /></Field>
            <Field label="Explanation"><textarea style={{ ...s.inp, minHeight: 80, resize: 'vertical' }} value={c.body} onChange={e=>setConcept(i,'body',e.target.value)} placeholder="Explain this concept in detail..." /></Field>
            <Field label="Code Example (optional)"><textarea style={{ ...s.inp, minHeight: 100, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} value={c.code||''} onChange={e=>setConcept(i,'code',e.target.value)} placeholder={"# Python\ndef example():\n    pass"} /></Field>
          </div>
        ))}
        {(!form.concepts||form.concepts.length===0) && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No sections yet. Add sections to explain key concepts.</div>}
      </div>

      {/* Key Points */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={s.lbl}>Key Points / Must Know</label>
          <Btn sm variant="ghost" onClick={addKP}>+ Add Point</Btn>
        </div>
        {(form.keyPoints||[]).map((kp,i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input style={s.inp} value={kp} onChange={e=>setKP(i,e.target.value)} placeholder="e.g. Time complexity is O(n)" />
            <Btn sm variant="danger" onClick={()=>removeKP(i)}>✕</Btn>
          </div>
        ))}
        {(!form.keyPoints||form.keyPoints.length===0) && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No key points added.</div>}
      </div>

      {/* Complexity */}
      <div style={{ marginBottom: 14 }}>
        <label style={s.lbl}>Algorithm Complexity</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ ...s.lbl, marginBottom: 3 }}>Time Complexity</label>
            <input style={s.inp} value={form.complexity?.time||''} onChange={e=>setForm(f=>({...f,complexity:{...(f.complexity||{}),time:e.target.value}}))} placeholder="e.g. O(n log n)" />
          </div>
          <div>
            <label style={{ ...s.lbl, marginBottom: 3 }}>Space Complexity</label>
            <input style={s.inp} value={form.complexity?.space||''} onChange={e=>setForm(f=>({...f,complexity:{...(f.complexity||{}),space:e.target.value}}))} placeholder="e.g. O(n)" />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={s.lbl}>Learning Resources</label>
          <Btn sm variant="ghost" onClick={addResource}>+ Add Resource</Btn>
        </div>
        {form.resources.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 8 }}>
            <input style={s.inp} placeholder="Title (e.g. YouTube – Trees)" value={r.title} onChange={e => setResource(i, 'title', e.target.value)} />
            <input style={s.inp} placeholder="https://..." value={r.url} onChange={e => setResource(i, 'url', e.target.value)} />
            <Btn sm variant="danger" onClick={() => removeResource(i)}>✕</Btn>
          </div>
        ))}
        {form.resources.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No resources added yet.</div>}
      </div>

      {/* Quiz Questions */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={s.lbl}>Quiz Questions (student must score ≥80% to complete)</label>
          <Btn sm variant="ghost" onClick={() => setForm(f => ({ ...f, quiz: [...(f.quiz || []), { question: '', options: ['', '', '', ''], answer: 0 }] }))}>+ Add Question</Btn>
        </div>
        {(form.quiz || []).map((q, qi) => (
          <div key={qi} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Question {qi + 1}</span>
              <Btn sm variant="danger" onClick={() => setForm(f => ({ ...f, quiz: f.quiz.filter((_, i) => i !== qi) }))}>Remove</Btn>
            </div>
            <Field label="Question">
              <input style={s.inp} value={q.question} onChange={e => setForm(f => ({ ...f, quiz: f.quiz.map((qq, i) => i === qi ? { ...qq, question: e.target.value } : qq) }))} placeholder="Enter question..." />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {q.options.map((opt, oi) => (
                <div key={oi}>
                  <label style={{ ...s.lbl, marginBottom: 3 }}>Option {String.fromCharCode(65 + oi)}</label>
                  <input style={s.inp} value={opt} onChange={e => setForm(f => ({ ...f, quiz: f.quiz.map((qq, i) => i === qi ? { ...qq, options: qq.options.map((o, j) => j === oi ? e.target.value : o) } : qq) }))} />
                </div>
              ))}
            </div>
            <Field label="Correct Answer">
              <select style={{ ...s.inp, width: 'auto' }} value={q.answer} onChange={e => setForm(f => ({ ...f, quiz: f.quiz.map((qq, i) => i === qi ? { ...qq, answer: Number(e.target.value) } : qq) }))}>
                {q.options.map((opt, oi) => <option key={oi} value={oi}>{String.fromCharCode(65 + oi)}. {opt || `Option ${String.fromCharCode(65 + oi)}`}</option>)}
              </select>
            </Field>
          </div>
        ))}
        {(!form.quiz || form.quiz.length === 0) && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No quiz added. Student will just click "Mark as Complete" after watching.</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={onSave} variant="success">Save Topic</Btn>
        <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
      </div>
    </div>
  )
}

// ── Daily Tasks ───────────────────────────────────────────────────────────────
const BLANK_DAILY_CODING = {
  format: 'coding',
  title: '', category: 'Arrays', difficulty: 'Easy',
  description: '', inputFormat: '', outputFormat: '', constraints: '',
  points: 10,
  hints: { idea: '', approach: '', pseudocode: '', code: '' },
  hintPenalties: { idea: 1, approach: 1, pseudocode: 1, code: 2 },
  examples:    [{ input: '', output: '', explanation: '' }],
  testCases:   [{ input: '', expectedOutput: '', hidden: false }],
  starterCode: { 71: '', 63: '', 54: '' },
}
const BLANK_DAILY_QUIZ = {
  format: 'quiz',
  questions: [{ question: '', options: ['', '', '', ''], answer: 0 }],
}
const getBlankTask = (type) => type === 'aptitude'
  ? { ...BLANK_DAILY_QUIZ, questions: [{ question: '', options: ['', '', '', ''], answer: 0, explanation: '' }] }
  : { ...BLANK_DAILY_CODING, examples: [{ input: '', output: '', explanation: '' }], testCases: [{ input: '', expectedOutput: '', hidden: false }], starterCode: { 71: '', 63: '', 54: '' } }

function DailyQuizForm({ form, setForm }) {
  const setQ   = (qi, k, v) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, [k]: v } : q) }))
  const setOpt = (qi, oi, v) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? v : o) } : q) }))
  const addQ   = () => setForm(f => ({ ...f, questions: [...(f.questions || []), { question: '', options: ['', '', '', ''], answer: 0, explanation: '' }] }))
  const removeQ = (qi) => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))

  return (
    <div>
      {(form.questions || []).map((q, qi) => (
        <div key={qi} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Question {qi + 1}</span>
            {(form.questions || []).length > 1 && <Btn sm variant="danger" onClick={() => removeQ(qi)}>Remove</Btn>}
          </div>
          <Field label="Question">
            <input style={s.inp} value={q.question} onChange={e => setQ(qi, 'question', e.target.value)} placeholder="Enter question..." />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {q.options.map((opt, oi) => (
              <div key={oi}>
                <label style={{ ...s.lbl, marginBottom: 3 }}>Option {String.fromCharCode(65 + oi)}</label>
                <input style={s.inp} value={opt} onChange={e => setOpt(qi, oi, e.target.value)} />
              </div>
            ))}
          </div>
          <Field label="Correct Answer">
            <select style={{ ...s.inp, width: 'auto' }} value={q.answer} onChange={e => setQ(qi, 'answer', Number(e.target.value))}>
              {q.options.map((opt, oi) => <option key={oi} value={oi}>{String.fromCharCode(65 + oi)}. {opt || `Option ${oi + 1}`}</option>)}
            </select>
          </Field>
          <Field label="Explanation (shown after submit)">
            <textarea style={{ ...s.inp, resize: 'vertical', minHeight: 56 }} value={q.explanation || ''} onChange={e => setQ(qi, 'explanation', e.target.value)} placeholder="Explain why the correct answer is right…" />
          </Field>
        </div>
      ))}
      <Btn sm variant="ghost" onClick={addQ}>+ Add Question</Btn>
    </div>
  )
}

const DAILY_CODING_TEMPLATE = `{
  "format": "coding",
  "title": "Reverse Array",
  "category": "Arrays",
  "difficulty": "Easy",
  "description": "Given an array, return it reversed.",
  "inputFormat": "Space-separated integers",
  "outputFormat": "Space-separated integers in reverse",
  "constraints": "1 <= n <= 100",
  "points": 10,
  "hintPenalties": { "idea": 1, "approach": 1, "pseudocode": 1, "code": 2 },
  "hints": {
    "idea": "Think about swapping elements from both ends.",
    "approach": "Use two pointers — one at start, one at end — moving toward center.",
    "pseudocode": "left = 0, right = n-1\\nwhile left < right:\\n  swap(arr[left], arr[right])\\n  left++, right--",
    "code": "n = list(map(int, input().split()))\\nprint(*n[::-1])"
  },
  "examples": [
    { "input": "1 2 3 4 5", "output": "5 4 3 2 1", "explanation": "Reversed order" }
  ],
  "testCases": [
    { "input": "1 2 3 4 5", "expectedOutput": "5 4 3 2 1", "hidden": false },
    { "input": "10 20",     "expectedOutput": "20 10",     "hidden": true }
  ],
  "starterCode": {
    "71": "# Python\\nn = list(map(int, input().split()))\\n",
    "63": "// JavaScript\\nconst n = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ');",
    "54": "// C++\\n#include<bits/stdc++.h>\\nusing namespace std;"
  }
}`

const DAILY_QUIZ_TEMPLATE = `[
  {
    "format": "quiz",
    "questions": [
      {
        "question": "What is the time complexity of binary search?",
        "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        "answer": 1,
        "explanation": "Binary search halves the search space each step, giving O(log n)."
      },
      {
        "question": "Which data structure uses LIFO order?",
        "options": ["Queue", "Stack", "Array", "Linked List"],
        "answer": 1,
        "explanation": "Stack follows Last In First Out (LIFO) principle."
      }
    ]
  }
]`

function DailyTasksTab({ tasks = { coding: [], aptitude: [], revision: [] }, onUpdate }) {
  const [type, setType]       = useState('coding')
  const [editing, setEditing] = useState(null)   // null | 'new' | index
  const [form, setForm]       = useState(() => getBlankTask('coding'))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [jsonMode, setJsonMode]       = useState(false)
  const [jsonText, setJsonText]       = useState('')
  const [jsonError, setJsonError]     = useState('')
  const [jsonSuccess, setJsonSuccess] = useState('')

  const raw = tasks[type] || []

  const startNew = () => { setForm(getBlankTask(type)); setEditing('new') }

  const startEdit = (i) => {
    const t = raw[i]
    // deep-clone to avoid mutating store
    setForm({
      ...t,
      examples:    (t.examples   || []).map(e => ({ ...e })),
      testCases:   (t.testCases  || []).map(tc => ({ ...tc })),
      starterCode: { ...(t.starterCode || {}) },
      questions:   (t.questions  || []).map(q => ({ ...q, options: [...(q.options || [])] })),
    })
    setEditing(i)
  }

  const save = () => {
    if (form.format === 'coding' && !form.title.trim()) return
    if (form.format !== 'coding' && !form.questions?.[0]?.question.trim()) return
    const slot = editing === 'new' ? [...raw, form] : raw.map((t, i) => i === editing ? form : t)
    onUpdate({ ...tasks, [type]: slot })
    setEditing(null)
  }

  const remove = (i) => {
    if (!window.confirm('Delete this task?')) return
    onUpdate({ ...tasks, [type]: raw.filter((_, idx) => idx !== i) })
  }

  const move = (i, dir) => {
    const arr = [...raw]
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    onUpdate({ ...tasks, [type]: arr })
  }

  const switchFormat = (fmt) => setForm(fmt === 'coding' ? getBlankTask(type) : { ...BLANK_DAILY_QUIZ, questions: [{ question: '', options: ['', '', '', ''], answer: 0 }] })

  const handleJsonUpload = () => {
    setJsonError(''); setJsonSuccess('')
    let parsed
    try { parsed = JSON.parse(jsonText.trim()) } catch (e) { setJsonError('Invalid JSON: ' + e.message); return }
    const items = Array.isArray(parsed) ? parsed : [parsed]
    const isCoding = type === 'coding' || (type === 'revision' && items[0]?.format === 'coding')
    const errors = []
    items.forEach((item, idx) => {
      if (isCoding && !item.title?.trim()) errors.push(`Item ${idx + 1}: missing "title"`)
      if (!isCoding && !item.questions?.length) errors.push(`Item ${idx + 1}: missing "questions" array`)
    })
    if (errors.length) { setJsonError(errors.join('\n')); return }
    const newTasks = items.map(item => isCoding ? {
      ...BLANK_DAILY_CODING, ...item,
      format: 'coding',
      examples:    item.examples  || [{ input: '', output: '', explanation: '' }],
      testCases:   item.testCases || [{ input: '', expectedOutput: '', hidden: false }],
      starterCode: { 71: '', 63: '', 54: '', ...(item.starterCode || {}) },
    } : {
      format: 'quiz',
      questions: (item.questions || []).map(q => ({ question: '', options: ['','','',''], answer: 0, explanation: '', ...q })),
    })
    onUpdate({ ...tasks, [type]: [...raw, ...newTasks] })
    setJsonSuccess(`✅ ${newTasks.length} task${newTasks.length > 1 ? 's' : ''} added to ${TYPE_META[type].label}!`)
    setJsonText('')
    setTimeout(() => { setJsonMode(false); setJsonSuccess('') }, 1800)
  }

  const TYPE_META = {
    coding:   { label: '💻 Coding',   color: '#6366f1' },
    aptitude: { label: '🧮 Aptitude', color: '#f59e0b' },
    revision: { label: '📖 Revision', color: '#10b981' },
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Daily Tasks</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Add a task for each day (Day 1, Day 2, …). Use ↑↓ to reorder. Coding tasks use the full HackerRank editor with test cases.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(TYPE_META).map(([key, meta]) => (
            <button key={key} onClick={() => { setType(key); setEditing(null) }} style={{
              padding: '6px 18px', borderRadius: 20, border: '2px solid',
              borderColor: type === key ? meta.color : 'var(--border)',
              background: type === key ? meta.color + '20' : 'transparent',
              color: type === key ? meta.color : 'var(--text)',
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}>
              {meta.label} ({(tasks[key] || []).length})
            </button>
          ))}
        </div>
        {editing === null && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" onClick={() => { setJsonMode(m => !m); setJsonError(''); setJsonSuccess(''); setEditing(null) }}>
              {jsonMode ? '✕ Close JSON' : '📋 Paste JSON'}
            </Btn>
            <Btn onClick={startNew}>+ Add Task</Btn>
          </div>
        )}
      </div>

      {/* JSON paste panel */}
      {jsonMode && editing === null && (
        <div style={{ ...s.card, border: '2px solid var(--primary)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                📋 Paste JSON — {TYPE_META[type].label} Task(s)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Single object <code>{'{...}'}</code> or array <code>{'[{...}]'}</code> for bulk upload.
              </div>
            </div>
            <Btn sm variant="ghost" onClick={() => setJsonText(type === 'aptitude' ? DAILY_QUIZ_TEMPLATE : DAILY_CODING_TEMPLATE)}>
              Load Template
            </Btn>
          </div>

          <textarea
            value={jsonText}
            onChange={e => { setJsonText(e.target.value); setJsonError(''); setJsonSuccess('') }}
            placeholder={'Paste your JSON here…\n\nClick "Load Template" to see the expected format.'}
            style={{ ...s.inp, minHeight: 240, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
          />

          {jsonError && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#b91c1c', whiteSpace: 'pre-line' }}>
              {jsonError}
            </div>
          )}
          {jsonSuccess && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
              {jsonSuccess}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn onClick={handleJsonUpload} variant="success">⬆ Upload Task(s)</Btn>
            <Btn variant="ghost" onClick={() => { setJsonMode(false); setJsonText(''); setJsonError(''); setJsonSuccess('') }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {editing !== null && (
        <ActiveCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Format toggle for revision */}
              {type === 'revision' && [
                { key: 'coding', label: '💻 Coding' },
                { key: 'quiz',   label: '🧮 Quiz' },
              ].map(f => (
                <button key={f.key} type="button" onClick={() => switchFormat(f.key)} style={{
                  padding: '5px 14px', borderRadius: 8,
                  border: `2px solid ${form.format === f.key ? 'var(--primary)' : 'var(--border)'}`,
                  background: form.format === f.key ? 'var(--primary-light)' : 'transparent',
                  color: form.format === f.key ? 'var(--primary)' : 'var(--text)',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}>{f.label}</button>
              ))}
              {type !== 'revision' && (
                <span style={{ fontWeight: 700, color: TYPE_META[type].color }}>
                  {TYPE_META[type].label} — {editing === 'new' ? 'New Task' : `Editing Day ${editing + 1}`}
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {editing === 'new' ? `Will be Day ${raw.length + 1}` : `Day ${editing + 1} of ${raw.length}`}
            </span>
          </div>

          {form.format === 'coding'
            ? <ProblemForm form={form} set={set} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} />
            : <>
                <DailyQuizForm form={form} setForm={setForm} />
                <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <Btn onClick={save} variant="success">Save Task</Btn>
                  <Btn onClick={() => setEditing(null)} variant="ghost">Cancel</Btn>
                </div>
              </>
          }
        </ActiveCard>
      )}

      {/* Task list */}
      {raw.length === 0 && editing === null ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontSize: 14, fontStyle: 'italic' }}>
          No {type} tasks yet. Click "+ Add Task" to create one.
        </div>
      ) : (
        raw.map((task, i) => (
          editing === i ? null : (
            <div key={i} style={{ ...s.card, padding: '12px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Day badge + reorder */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginRight: 4 }}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1, fontSize: 12, padding: '1px 4px', color: 'var(--text-secondary)' }}>▲</button>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', borderRadius: 6, padding: '1px 7px' }}>Day {i + 1}</span>
                  <button onClick={() => move(i, 1)} disabled={i === raw.length - 1} style={{ background: 'none', border: 'none', cursor: i === raw.length - 1 ? 'default' : 'pointer', opacity: i === raw.length - 1 ? 0.3 : 1, fontSize: 12, padding: '1px 4px', color: 'var(--text-secondary)' }}>▼</button>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {task.format === 'coding' || type === 'coding' ? (<>
                    <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title || '(untitled)'}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {task.difficulty && <span className={`badge badge-${task.difficulty?.toLowerCase()}`}>{task.difficulty}</span>}
                      {task.category && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{task.category}</span>}
                      {task.testCases?.length > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.testCases.length} test cases ({task.testCases.filter(tc => tc.hidden).length} hidden)</span>
                      )}
                    </div>
                  </>) : (<>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Quiz — {task.questions?.length} question{task.questions?.length !== 1 ? 's' : ''}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.questions?.slice(0, 2).map((q, qi) => `Q${qi + 1}: ${q.question.slice(0, 40)}${q.question.length > 40 ? '…' : ''}`).join(' · ')}
                    </div>
                  </>)}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Btn sm variant="ghost" onClick={() => startEdit(i)}>Edit</Btn>
                  <Btn sm variant="danger" onClick={() => remove(i)}>Delete</Btn>
                </div>
              </div>

              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
                Assigned to: <strong>Day {i + 1}</strong>
              </div>
            </div>
          )
        ))
      )}
    </div>
  )
}

// ── Aptitude Training ─────────────────────────────────────────────────────────
const AT_LEVELS = ['Rookie', 'Coder', 'Master']
const BLANK_AT_TOPIC = {
  title: '', icon: '📚', level: 'Rookie', description: '',
  module: { concepts: [{ heading: '', body: '' }] },
  quiz: [{ q: '', options: ['', '', '', ''], answer: 0, explanation: '' }],
}

function AptitudeTab({ topics = [], onUpdate }) {
  const [editing, setEditing]     = useState(null)   // null | 'new' | topic.id
  const [form, setForm]           = useState(BLANK_AT_TOPIC)
  const [levelFilter, setLevel]   = useState('All')

  const deepClone = t => ({
    ...t,
    module: { concepts: (t.module?.concepts || []).map(c => ({ ...c })) },
    quiz:   (t.quiz || []).map(q => ({ ...q, options: [...q.options] })),
  })

  const save = () => {
    if (!form.title.trim()) return
    const topic = { ...deepClone(form), id: editing === 'new' ? `at-${Date.now()}` : editing }
    if (editing === 'new') onUpdate([...topics, topic])
    else onUpdate(topics.map(t => t.id === editing ? topic : t))
    setEditing(null)
  }

  const remove = id => {
    if (!window.confirm('Delete this topic?')) return
    onUpdate(topics.filter(t => t.id !== id))
  }

  // ── concept helpers
  const addConcept    = () => setForm(f => ({ ...f, module: { concepts: [...(f.module?.concepts || []), { heading: '', body: '' }] } }))
  const removeConcept = i  => setForm(f => ({ ...f, module: { concepts: f.module.concepts.filter((_, idx) => idx !== i) } }))
  const setConcept    = (i, k, v) => setForm(f => ({ ...f, module: { concepts: f.module.concepts.map((c, idx) => idx === i ? { ...c, [k]: v } : c) } }))

  // ── quiz helpers
  const addQuizQ    = () => setForm(f => ({ ...f, quiz: [...(f.quiz || []), { q: '', options: ['', '', '', ''], answer: 0, explanation: '' }] }))
  const removeQuizQ = i  => setForm(f => ({ ...f, quiz: f.quiz.filter((_, idx) => idx !== i) }))
  const setQuizQ    = (i, k, v) => setForm(f => ({ ...f, quiz: f.quiz.map((q, idx) => idx === i ? { ...q, [k]: v } : q) }))
  const setQuizOpt  = (i, oi, v) => setForm(f => ({ ...f, quiz: f.quiz.map((q, idx) => idx === i ? { ...q, options: q.options.map((o, j) => j === oi ? v : o) } : q) }))

  const sep = { borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16 }
  const shown = levelFilter === 'All' ? topics : topics.filter(t => t.level === levelFilter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Aptitude Training</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Manage topics, learning modules (concepts), and quiz questions.
          </p>
        </div>
        <Btn onClick={() => { setForm(BLANK_AT_TOPIC); setEditing('new') }}>+ Add Topic</Btn>
      </div>

      {/* Level filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {['All', ...AT_LEVELS].map(l => (
          <button key={l} onClick={() => setLevel(l)} style={{
            padding: '5px 16px', borderRadius: 20, border: '1.5px solid',
            borderColor: levelFilter === l ? 'var(--primary)' : 'var(--border)',
            background: levelFilter === l ? 'var(--primary-light)' : 'transparent',
            color: levelFilter === l ? 'var(--primary)' : 'var(--text)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            {l}
            {l !== 'All' && <span style={{ marginLeft: 5, opacity: .7, fontSize: 11 }}>({topics.filter(t => t.level === l).length})</span>}
          </button>
        ))}
      </div>

      {/* New topic form */}
      {editing === 'new' && (
        <ActiveCard>
          <h3 style={{ margin: '0 0 16px' }}>New Topic</h3>
          <AptitudeTopicForm
            form={form} setForm={setForm}
            addConcept={addConcept} removeConcept={removeConcept} setConcept={setConcept}
            addQuizQ={addQuizQ} removeQuizQ={removeQuizQ} setQuizQ={setQuizQ} setQuizOpt={setQuizOpt}
            onSave={save} onCancel={() => setEditing(null)} sep={sep}
          />
        </ActiveCard>
      )}

      {/* Topic list */}
      {shown.map(topic => (
        <div key={topic.id}>
          {editing === topic.id ? (
            <ActiveCard>
              <h3 style={{ margin: '0 0 16px' }}>Edit: {topic.title}</h3>
              <AptitudeTopicForm
                form={form} setForm={setForm}
                addConcept={addConcept} removeConcept={removeConcept} setConcept={setConcept}
                addQuizQ={addQuizQ} removeQuizQ={removeQuizQ} setQuizQ={setQuizQ} setQuizOpt={setQuizOpt}
                onSave={save} onCancel={() => setEditing(null)} sep={sep}
              />
            </ActiveCard>
          ) : (
            <div style={{ ...s.card, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20 }}>{topic.icon}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, minWidth: 140 }}>{topic.title}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: topic.level === 'Rookie' ? '#d1fae5' : topic.level === 'Coder' ? '#e0e7ff' : '#fce7f3',
                  color: topic.level === 'Rookie' ? '#065f46' : topic.level === 'Coder' ? '#3730a3' : '#9d174d',
                }}>
                  {topic.level}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {topic.module?.concepts?.length || 0} concept{(topic.module?.concepts?.length || 0) !== 1 ? 's' : ''} · {topic.quiz?.length || 0} quiz Q
                </span>
                <Btn sm variant="ghost" onClick={() => { setForm(deepClone(topic)); setEditing(topic.id) }}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => remove(topic.id)}>Delete</Btn>
              </div>
              {topic.description && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, paddingLeft: 30 }}>{topic.description}</div>
              )}
            </div>
          )}
        </div>
      ))}

      {shown.length === 0 && editing !== 'new' && (
        <div style={{ ...s.card, textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 13 }}>
          No topics yet. Click "+ Add Topic" to get started.
        </div>
      )}
    </div>
  )
}

function AptitudeTopicForm({ form, setForm, addConcept, removeConcept, setConcept, addQuizQ, removeQuizQ, setQuizQ, setQuizOpt, onSave, onCancel, sep }) {
  return (
    <>
      {/* Basic info */}
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px', gap: 12 }}>
        <Field label="Icon">
          <input style={s.inp} value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="📚" />
        </Field>
        <Field label="Title">
          <input style={s.inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Percentages" />
        </Field>
        <Field label="Level">
          <select style={s.inp} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
            {AT_LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea style={{ ...s.inp, height: 60, resize: 'vertical' }} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Short summary shown on the topic card…" />
      </Field>

      {/* Learning module — concepts */}
      <div style={sep}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>
            📖 Learning Module
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12, marginLeft: 6 }}>
              ({(form.module?.concepts || []).length} concept{(form.module?.concepts || []).length !== 1 ? 's' : ''})
            </span>
          </span>
          <Btn sm onClick={addConcept}>+ Add Concept</Btn>
        </div>
        {(form.module?.concepts || []).map((c, i) => (
          <div key={i} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Concept {i + 1}</span>
              {(form.module?.concepts || []).length > 1 && (
                <Btn sm variant="danger" onClick={() => removeConcept(i)}>Remove</Btn>
              )}
            </div>
            <Field label="Heading">
              <input style={s.inp} value={c.heading} onChange={e => setConcept(i, 'heading', e.target.value)} placeholder="e.g. Core Formula" />
            </Field>
            <Field label="Body (supports multiple lines)">
              <textarea style={{ ...s.inp, height: 100, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                value={c.body} onChange={e => setConcept(i, 'body', e.target.value)}
                placeholder="Explain this concept clearly. Use line breaks for readability." />
            </Field>
          </div>
        ))}
      </div>

      {/* Quiz questions */}
      <div style={sep}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>
            📝 Quiz Questions
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12, marginLeft: 6 }}>
              ({(form.quiz || []).length} question{(form.quiz || []).length !== 1 ? 's' : ''})
            </span>
          </span>
          <Btn sm onClick={addQuizQ}>+ Add Question</Btn>
        </div>
        {(form.quiz || []).map((q, qi) => (
          <div key={qi} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Question {qi + 1}</span>
              {(form.quiz || []).length > 1 && <Btn sm variant="danger" onClick={() => removeQuizQ(qi)}>Remove</Btn>}
            </div>
            <Field label="Question">
              <input style={s.inp} value={q.q} onChange={e => setQuizQ(qi, 'q', e.target.value)} placeholder="Enter question…" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {q.options.map((opt, oi) => (
                <div key={oi}>
                  <label style={{ ...s.lbl, marginBottom: 3 }}>Option {String.fromCharCode(65 + oi)}</label>
                  <input style={s.inp} value={opt} onChange={e => setQuizOpt(qi, oi, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Correct Answer">
                <select style={s.inp} value={q.answer} onChange={e => setQuizQ(qi, 'answer', Number(e.target.value))}>
                  {q.options.map((opt, oi) => (
                    <option key={oi} value={oi}>{String.fromCharCode(65 + oi)}. {opt || `Option ${String.fromCharCode(65 + oi)}`}</option>
                  ))}
                </select>
              </Field>
              <Field label="Explanation">
                <input style={s.inp} value={q.explanation} onChange={e => setQuizQ(qi, 'explanation', e.target.value)} placeholder="Why is this the correct answer?" />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <Btn onClick={onSave} variant="success">✓ Save Topic</Btn>
        <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
      </div>
    </>
  )
}

// ── Daily Quote Tab ───────────────────────────────────────────────────────────
function QuoteTab({ quote, onUpdate }) {
  const [text, setText]     = useState(quote.text || '')
  const [author, setAuthor] = useState(quote.author || '')
  const [saved, setSaved]   = useState(false)

  const handleSave = async () => {
    await onUpdate({ text: text.trim(), author: author.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Daily Quote</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        This quote is shown to all students on their Dashboard every day.
      </p>

      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Quote Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            placeholder="Enter the motivational quote…"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Author Name</label>
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="e.g. Jim Rohn"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}
          />
        </div>

        {/* Preview */}
        {text && (
          <div style={{ background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', borderLeft: '4px solid var(--primary)', borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, fontStyle: 'italic', color: 'var(--text)', marginBottom: 6 }}>"{text}"</p>
            {author && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>— {author}</span>}
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSave} disabled={!text.trim()}>
          {saved ? '✓ Saved!' : 'Save Quote'}
        </button>
      </div>
    </div>
  )
}

// ── Main Admin Layout ─────────────────────────────────────────────────────────
// ── Companies ────────────────────────────────────────────────────────────────
const COMPANY_TYPES = ['Product', 'Service', 'Startup']
const BLANK_COMPANY = {
  id: '', name: '', fullName: '', icon: '🏢', type: 'Service',
  difficulty: 'Easy', package: '', color: '#6366f1',
  rounds: [], tip: '',
}

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function CompaniesTab({ companies = [], onUpdate }) {
  const [editing, setEditing] = useState(null)   // null | 'new' | company.id
  const [form,    setForm]    = useState(BLANK_COMPANY)
  const [roundsText, setRoundsText] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const startNew = () => {
    setForm(BLANK_COMPANY)
    setRoundsText('')
    setEditing('new')
  }

  const startEdit = (c) => {
    setForm({ ...c })
    setRoundsText((c.rounds || []).join('\n'))
    setEditing(c.id)
  }

  const save = () => {
    if (!form.name.trim() || !form.fullName.trim()) return
    const id     = form.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const rounds = roundsText.split('\n').map(r => r.trim()).filter(Boolean)
    const glow   = hexToRgba(form.color, 0.3)
    const entry  = { ...form, id: editing === 'new' ? id : form.id, rounds, glow }
    if (editing === 'new') {
      onUpdate([...companies, entry])
    } else {
      onUpdate(companies.map(c => c.id === editing ? entry : c))
    }
    setEditing(null)
  }

  const remove = (id) => {
    if (!window.confirm('Delete this company?')) return
    onUpdate(companies.filter(c => c.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>🏢 Companies <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>({companies.length})</span></h2>
        <Btn onClick={startNew}>+ Add Company</Btn>
      </div>

      {editing !== null && (
        <ActiveCard>
          <h3 style={{ margin: '0 0 16px' }}>{editing === 'new' ? 'New Company' : `Edit: ${form.name}`}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <Field label="Short Name (e.g. TCS)">
              <input style={s.inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="TCS" />
            </Field>
            <Field label="Full Name">
              <input style={s.inp} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Tata Consultancy Services" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <Field label="Icon (emoji)">
              <input style={s.inp} value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🏢" />
            </Field>
            <Field label="Type">
              <select style={s.inp} value={form.type} onChange={e => set('type', e.target.value)}>
                {COMPANY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select style={s.inp} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                {DIFFS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Brand Color">
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                  style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }} />
                <input style={{ ...s.inp, fontFamily: 'monospace' }} value={form.color} onChange={e => set('color', e.target.value)} placeholder="#6366f1" />
              </div>
            </Field>
          </div>
          <Field label="Package (e.g. 3.5 – 7 LPA)">
            <input style={s.inp} value={form.package} onChange={e => set('package', e.target.value)} placeholder="3.5 – 7 LPA" />
          </Field>
          <Field label="Interview Rounds (one per line)">
            <textarea style={{ ...s.inp, minHeight: 90, resize: 'vertical' }} value={roundsText}
              onChange={e => setRoundsText(e.target.value)}
              placeholder={"NQT – Numerical\nNQT – Coding\nHR Interview"} />
          </Field>
          <Field label="Tip for students">
            <textarea style={{ ...s.inp, minHeight: 60, resize: 'vertical' }} value={form.tip}
              onChange={e => set('tip', e.target.value)} placeholder="Focus on..." />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Btn variant="success" onClick={save}>✓ Save Company</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          </div>
        </ActiveCard>
      )}

      {companies.length === 0
        ? <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>No companies yet. Add one above.</div>
        : companies.map(c => (
          <div key={c.id} style={{ ...s.card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: hexToRgba(c.color, 0.15), border: `2px solid ${c.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 13 }}>{c.fullName}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {c.type} · {c.difficulty} · {c.package} · {(c.rounds || []).length} rounds
              </div>
            </div>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
            <Btn sm variant="ghost" onClick={() => startEdit(c)}>Edit</Btn>
            <Btn sm variant="danger" onClick={() => remove(c.id)}>Delete</Btn>
          </div>
        ))
      }
    </div>
  )
}

// ── Company Questions ─────────────────────────────────────────────────────────
const BLANK_MCQ  = { q: '', opts: ['', '', '', ''], ans: 0, exp: '' }
const COMP_CATS  = ['coding', 'aptitude', 'english']

function CompanyQuestionsTab({ companies = [], companyProblems = {}, onUpdate }) {
  const [selCompany,   setSelCompany]   = useState(companies[0]?.id || '')
  const [subTab,       setSubTab]       = useState('coding')

  // Coding state
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState(BLANK_PROB)
  const [jsonMode,    setJsonMode]    = useState(false)
  const [jsonText,    setJsonText]    = useState('')
  const [jsonError,   setJsonError]   = useState('')
  const [jsonSuccess, setJsonSuccess] = useState('')

  // Test management state (aptitude/english)
  const [activeTestIdx, setActiveTestIdx] = useState(null)   // null = test list, number = inside test
  const [testEditing,   setTestEditing]   = useState(null)   // null | 'new' | testIndex
  const [testNameForm,  setTestNameForm]  = useState('')
  const [qEditing,      setQEditing]      = useState(null)   // null | 'new' | qIndex
  const [mcqForm,       setMcqForm]       = useState(BLANK_MCQ)
  // JSON for tests
  const [testJsonMode,    setTestJsonMode]    = useState(false)
  const [testJsonText,    setTestJsonText]    = useState('')
  const [testJsonError,   setTestJsonError]   = useState('')
  const [testJsonSuccess, setTestJsonSuccess] = useState('')
  // JSON for questions inside a test
  const [qJsonMode,    setQJsonMode]    = useState(false)
  const [qJsonText,    setQJsonText]    = useState('')
  const [qJsonError,   setQJsonError]   = useState('')
  const [qJsonSuccess, setQJsonSuccess] = useState('')

  const company  = companies.find(c => c.id === selCompany)
  const compData = companyProblems[selCompany] || { coding: [], aptitude: [], english: [] }

  const set         = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setMcqField = (k, v) => setMcqForm(f => ({ ...f, [k]: v }))
  const setOpt      = (i, v) => setMcqForm(f => { const opts = [...f.opts]; opts[i] = v; return { ...f, opts } })

  const deepCloneProb = (p) => ({
    ...p,
    hints:       { ...(p.hints || {}) },
    examples:    (p.examples  || []).map(e => ({ ...e })),
    testCases:   (p.testCases || []).map(t => ({ ...t })),
    starterCode: { ...(p.starterCode || {}) },
  })

  // ── Coding helpers ────────────────────────────────────────────────────────
  const codingQs = compData.coding || []

  const saveCoding = () => {
    if (!form.title.trim() || !form.description.trim()) return
    const qs = [...codingQs]
    if (editing === 'new') qs.push(deepCloneProb(form))
    else qs[editing] = deepCloneProb(form)
    onUpdate({ ...companyProblems, [selCompany]: { ...compData, coding: qs } })
    setEditing(null)
  }

  const removeCoding = (i) => {
    if (!window.confirm('Delete this problem?')) return
    onUpdate({ ...companyProblems, [selCompany]: { ...compData, coding: codingQs.filter((_, idx) => idx !== i) } })
  }

  const handleJsonUpload = () => {
    setJsonError(''); setJsonSuccess('')
    let parsed
    try { parsed = JSON.parse(jsonText.trim()) }
    catch (e) { setJsonError('Invalid JSON: ' + e.message); return }
    const items = Array.isArray(parsed) ? parsed : [parsed]
    const errors = []
    items.forEach((item, idx) => {
      if (!item.title?.trim())       errors.push(`Item ${idx + 1}: missing "title"`)
      if (!item.description?.trim()) errors.push(`Item ${idx + 1}: missing "description"`)
    })
    if (errors.length) { setJsonError(errors.join('\n')); return }
    const newQs = items.map(item => ({
      ...BLANK_PROB, ...item,
      examples:    item.examples  || [{ input: '', output: '', explanation: '' }],
      testCases:   item.testCases || [{ input: '', expectedOutput: '', hidden: false }],
      starterCode: { 71: '', 63: '', 54: '', ...(item.starterCode || {}) },
    }))
    onUpdate({ ...companyProblems, [selCompany]: { ...compData, coding: [...codingQs, ...newQs] } })
    setJsonSuccess(`✅ ${newQs.length} problem${newQs.length > 1 ? 's' : ''} added!`)
    setJsonText('')
    setTimeout(() => { setJsonMode(false); setJsonSuccess('') }, 1800)
  }

  // ── Test helpers (aptitude / english) ────────────────────────────────────
  const getRawTests = () => {
    const data = compData[subTab] || []
    if (data.length === 0) return []
    if (data[0]?.questions) return data
    return [{ name: `${subTab === 'aptitude' ? 'Aptitude' : 'English'} Test 1`, questions: data }]
  }

  const saveTests = (tests) =>
    onUpdate({ ...companyProblems, [selCompany]: { ...compData, [subTab]: tests } })

  const addTest = () => {
    if (!testNameForm.trim()) return
    saveTests([...getRawTests(), { name: testNameForm.trim(), questions: [] }])
    setTestEditing(null); setTestNameForm('')
  }

  const renameTest = (ti) => {
    if (!testNameForm.trim()) return
    saveTests(getRawTests().map((t, i) => i === ti ? { ...t, name: testNameForm.trim() } : t))
    setTestEditing(null)
  }

  const deleteTest = (ti) => {
    if (!window.confirm('Delete this test and all its questions?')) return
    saveTests(getRawTests().filter((_, i) => i !== ti))
    if (activeTestIdx === ti) setActiveTestIdx(null)
  }

  const saveQuestion = () => {
    if (!mcqForm.q.trim()) return
    const tests = getRawTests()
    const test  = { ...tests[activeTestIdx], questions: [...(tests[activeTestIdx]?.questions || [])] }
    const entry = { ...mcqForm, opts: mcqForm.opts.map(o => o.trim()) }
    if (qEditing === 'new') test.questions.push(entry)
    else test.questions[qEditing] = entry
    saveTests(tests.map((t, i) => i === activeTestIdx ? test : t))
    setQEditing(null)
  }

  const deleteQuestion = (qi) => {
    if (!window.confirm('Delete this question?')) return
    const tests = getRawTests()
    const test  = { ...tests[activeTestIdx], questions: tests[activeTestIdx].questions.filter((_, i) => i !== qi) }
    saveTests(tests.map((t, i) => i === activeTestIdx ? test : t))
  }

  // ── JSON: upload full tests ───────────────────────────────────────────────
  const MCQ_TEST_TEMPLATE = `[
  {
    "name": "Aptitude Test 1",
    "questions": [
      {
        "q": "If 15 workers complete a job in 8 days, how many workers finish it in 6 days?",
        "opts": ["18", "20", "22", "24"],
        "ans": 1,
        "exp": "15×8 = W×6 → W = 20"
      }
    ]
  }
]`

  const MCQ_Q_TEMPLATE = `[
  {
    "q": "Choose the correct synonym for Eloquent:",
    "opts": ["Silent", "Expressive", "Confused", "Rigid"],
    "ans": 1,
    "exp": "Eloquent means expressive or fluent."
  }
]`

  const validateMcq = (item, idx) => {
    const errs = []
    if (!item.q?.trim())              errs.push(`Q${idx + 1}: missing "q"`)
    if (!Array.isArray(item.opts) || item.opts.length < 2) errs.push(`Q${idx + 1}: "opts" must be an array of ≥2`)
    if (typeof item.ans !== 'number') errs.push(`Q${idx + 1}: "ans" must be a number (0-based index)`)
    return errs
  }

  const handleTestJsonUpload = () => {
    setTestJsonError(''); setTestJsonSuccess('')
    let parsed
    try { parsed = JSON.parse(testJsonText.trim()) }
    catch (e) { setTestJsonError('Invalid JSON: ' + e.message); return }
    const items  = Array.isArray(parsed) ? parsed : [parsed]
    const errors = []
    items.forEach((item, i) => {
      if (!item.name?.trim()) errors.push(`Item ${i + 1}: missing "name"`)
      if (!Array.isArray(item.questions)) errors.push(`Item ${i + 1}: "questions" must be an array`)
      else item.questions.forEach((q, qi) => validateMcq(q, qi).forEach(e => errors.push(`Item ${i + 1} › ${e}`)))
    })
    if (errors.length) { setTestJsonError(errors.join('\n')); return }
    const newTests = items.map(item => ({
      name: item.name.trim(),
      questions: item.questions.map(q => ({ ...BLANK_MCQ, ...q, opts: q.opts.map(o => String(o)) })),
    }))
    saveTests([...getRawTests(), ...newTests])
    setTestJsonSuccess(`✅ ${newTests.length} test${newTests.length > 1 ? 's' : ''} added!`)
    setTestJsonText('')
    setTimeout(() => { setTestJsonMode(false); setTestJsonSuccess('') }, 1800)
  }

  // ── JSON: upload questions inside a test ──────────────────────────────────
  const handleQJsonUpload = () => {
    setQJsonError(''); setQJsonSuccess('')
    let parsed
    try { parsed = JSON.parse(qJsonText.trim()) }
    catch (e) { setQJsonError('Invalid JSON: ' + e.message); return }
    const items  = Array.isArray(parsed) ? parsed : [parsed]
    const errors = items.flatMap((q, i) => validateMcq(q, i))
    if (errors.length) { setQJsonError(errors.join('\n')); return }
    const newQs  = items.map(q => ({ ...BLANK_MCQ, ...q, opts: q.opts.map(o => String(o)) }))
    const tests  = getRawTests()
    const test   = { ...tests[activeTestIdx], questions: [...(tests[activeTestIdx]?.questions || []), ...newQs] }
    saveTests(tests.map((t, i) => i === activeTestIdx ? test : t))
    setQJsonSuccess(`✅ ${newQs.length} question${newQs.length > 1 ? 's' : ''} added!`)
    setQJsonText('')
    setTimeout(() => { setQJsonMode(false); setQJsonSuccess('') }, 1800)
  }

  // ── Shared switch helpers ─────────────────────────────────────────────────
  const switchCompany = (id) => {
    setSelCompany(id); setEditing(null); setJsonMode(false)
    setActiveTestIdx(null); setTestEditing(null); setQEditing(null)
    setTestJsonMode(false); setQJsonMode(false)
  }
  const switchTab = (cat) => {
    setSubTab(cat); setEditing(null); setJsonMode(false)
    setActiveTestIdx(null); setTestEditing(null); setQEditing(null)
    setTestJsonMode(false); setQJsonMode(false)
  }

  const tests = subTab !== 'coding' ? getRawTests() : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>
          📋 Company Questions
          {activeTestIdx !== null && (
            <span style={{ fontWeight: 400, fontSize: 14, color: 'var(--text-secondary)', marginLeft: 8 }}>
              › {tests[activeTestIdx]?.name}
            </span>
          )}
        </h2>
      </div>

      {/* Company + sub-tab selector */}
      <div style={{ ...s.card, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ ...s.lbl, margin: 0 }}>Company</label>
        <select value={selCompany} onChange={e => switchCompany(e.target.value)} style={{ ...s.inp, width: 220 }}>
          {companies.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {COMP_CATS.map(cat => {
            const cnt = cat === 'coding'
              ? (compData.coding || []).length
              : getRawTests().reduce((s, t) => s + (t.questions?.length || 0), 0)
            return (
              <button key={cat} onClick={() => switchTab(cat)} style={{
                padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: subTab === cat ? 'var(--primary)' : 'var(--bg)',
                color: subTab === cat ? '#fff' : 'var(--text)',
              }}>
                {cat === 'coding' ? '💻' : cat === 'aptitude' ? '🧮' : '📖'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span style={{ marginLeft: 6, opacity: .7, fontWeight: 400 }}>({cnt})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ CODING TAB ══ */}
      {subTab === 'coding' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
            <Btn variant="ghost" onClick={() => { setJsonMode(m => !m); setJsonError(''); setJsonSuccess(''); setEditing(null) }}>
              {jsonMode ? '✕ Close JSON' : '📋 Paste JSON'}
            </Btn>
            <Btn onClick={() => { setForm(BLANK_PROB); setEditing('new'); setJsonMode(false) }}>+ Add Problem</Btn>
          </div>

          {jsonMode && (
            <div style={{ ...s.card, border: '2px solid var(--primary)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📋 Paste JSON to Upload Problem(s)</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Single object or array of objects.</div>
                </div>
                <Btn sm variant="ghost" onClick={() => setJsonText(JSON_TEMPLATE)}>Load Template</Btn>
              </div>
              <textarea value={jsonText} onChange={e => { setJsonText(e.target.value); setJsonError(''); setJsonSuccess('') }}
                placeholder="Paste JSON here…" style={{ ...s.inp, minHeight: 260, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }} />
              {jsonError   && <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#b91c1c', whiteSpace: 'pre-line' }}>{jsonError}</div>}
              {jsonSuccess && <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 13, color: '#065f46', fontWeight: 600 }}>{jsonSuccess}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn onClick={handleJsonUpload} variant="success">⬆ Upload Problem(s)</Btn>
                <Btn variant="ghost" onClick={() => { setJsonMode(false); setJsonText(''); setJsonError(''); setJsonSuccess('') }}>Cancel</Btn>
              </div>
            </div>
          )}

          {editing !== null && (
            <ActiveCard>
              <h3 style={{ margin: '0 0 16px' }}>{editing === 'new' ? 'New Problem' : 'Edit Problem'}{company && <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>— {company.name}</span>}</h3>
              <ProblemForm form={form} set={set} setForm={setForm} onSave={saveCoding} onCancel={() => setEditing(null)} />
            </ActiveCard>
          )}

          {codingQs.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>No coding problems for {company?.name} yet.</div>
            : codingQs.map((q, i) => (
              <div key={i} style={{ ...s.card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {q.difficulty} · {(q.examples?.length || 0)} example{(q.examples?.length || 0) !== 1 ? 's' : ''} · {(q.testCases?.length || 0)} test case{(q.testCases?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <Btn sm variant="ghost" onClick={() => { setForm(deepCloneProb({ ...BLANK_PROB, ...q })); setEditing(i) }}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => removeCoding(i)}>Delete</Btn>
              </div>
            ))
          }
        </>
      )}

      {/* ══ APTITUDE / ENGLISH — TEST LIST ══ */}
      {subTab !== 'coding' && activeTestIdx === null && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
            <Btn variant="ghost" onClick={() => { setTestJsonMode(m => !m); setTestJsonError(''); setTestJsonSuccess(''); setTestEditing(null) }}>
              {testJsonMode ? '✕ Close JSON' : '📋 Paste JSON'}
            </Btn>
            <Btn onClick={() => { setTestEditing('new'); setTestNameForm(''); setTestJsonMode(false) }}>+ Add Test</Btn>
          </div>

          {/* JSON — full test upload */}
          {testJsonMode && (
            <div style={{ ...s.card, border: '2px solid var(--primary)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📋 Upload Full Test(s) via JSON</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Each item: <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 3 }}>{`{ "name": "...", "questions": [...] }`}</code> — paste array for multiple tests.
                  </div>
                </div>
                <Btn sm variant="ghost" onClick={() => setTestJsonText(MCQ_TEST_TEMPLATE)}>Load Template</Btn>
              </div>
              <textarea value={testJsonText} onChange={e => { setTestJsonText(e.target.value); setTestJsonError(''); setTestJsonSuccess('') }}
                placeholder={'Paste JSON here…\nClick "Load Template" to see the expected format.'}
                style={{ ...s.inp, minHeight: 220, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }} />
              {testJsonError   && <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#b91c1c', whiteSpace: 'pre-line' }}>{testJsonError}</div>}
              {testJsonSuccess && <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 13, color: '#065f46', fontWeight: 600 }}>{testJsonSuccess}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn variant="success" onClick={handleTestJsonUpload}>⬆ Upload Test(s)</Btn>
                <Btn variant="ghost" onClick={() => { setTestJsonMode(false); setTestJsonText(''); setTestJsonError(''); setTestJsonSuccess('') }}>Cancel</Btn>
              </div>
            </div>
          )}

          {testEditing === 'new' && (
            <ActiveCard>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>New Test</div>
              <Field label="Test Name">
                <input style={s.inp} value={testNameForm} onChange={e => setTestNameForm(e.target.value)} placeholder="e.g. Aptitude Test 1" />
              </Field>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="success" onClick={addTest}>✓ Create Test</Btn>
                <Btn variant="ghost" onClick={() => setTestEditing(null)}>Cancel</Btn>
              </div>
            </ActiveCard>
          )}

          {tests.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>No tests for {company?.name} yet.</div>
            : tests.map((test, ti) => (
              <div key={ti} style={{ ...s.card, padding: '14px 16px' }}>
                {testEditing === ti
                  ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input style={{ ...s.inp, flex: 1 }} value={testNameForm} onChange={e => setTestNameForm(e.target.value)} />
                      <Btn sm variant="success" onClick={() => renameTest(ti)}>Save</Btn>
                      <Btn sm variant="ghost" onClick={() => setTestEditing(null)}>Cancel</Btn>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{test.name || `Test ${ti + 1}`}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{test.questions?.length || 0} questions</div>
                      </div>
                      <Btn sm onClick={() => { setActiveTestIdx(ti); setQEditing(null) }}>Manage Questions →</Btn>
                      <Btn sm variant="ghost" onClick={() => { setTestEditing(ti); setTestNameForm(test.name || '') }}>Rename</Btn>
                      <Btn sm variant="danger" onClick={() => deleteTest(ti)}>Delete</Btn>
                    </div>
                  )
                }
              </div>
            ))
          }
        </>
      )}

      {/* ══ APTITUDE / ENGLISH — QUESTIONS INSIDE TEST ══ */}
      {subTab !== 'coding' && activeTestIdx !== null && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Btn variant="ghost" onClick={() => { setActiveTestIdx(null); setQEditing(null); setQJsonMode(false) }}>← Back to Tests</Btn>
            <span style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={() => { setQJsonMode(m => !m); setQJsonError(''); setQJsonSuccess(''); setQEditing(null) }}>
              {qJsonMode ? '✕ Close JSON' : '📋 Paste JSON'}
            </Btn>
            <Btn onClick={() => { setMcqForm(BLANK_MCQ); setQEditing('new'); setQJsonMode(false) }}>+ Add Question</Btn>
          </div>

          {/* JSON — questions upload */}
          {qJsonMode && (
            <div style={{ ...s.card, border: '2px solid var(--primary)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📋 Upload Questions via JSON</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Each item: <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 3 }}>{`{ "q": "...", "opts": [...], "ans": 0, "exp": "..." }`}</code>
                  </div>
                </div>
                <Btn sm variant="ghost" onClick={() => setQJsonText(MCQ_Q_TEMPLATE)}>Load Template</Btn>
              </div>
              <textarea value={qJsonText} onChange={e => { setQJsonText(e.target.value); setQJsonError(''); setQJsonSuccess('') }}
                placeholder={'Paste JSON here…\nClick "Load Template" to see the expected format.'}
                style={{ ...s.inp, minHeight: 200, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }} />
              {qJsonError   && <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#b91c1c', whiteSpace: 'pre-line' }}>{qJsonError}</div>}
              {qJsonSuccess && <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #6ee7b7', borderRadius: 6, fontSize: 13, color: '#065f46', fontWeight: 600 }}>{qJsonSuccess}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn variant="success" onClick={handleQJsonUpload}>⬆ Upload Question(s)</Btn>
                <Btn variant="ghost" onClick={() => { setQJsonMode(false); setQJsonText(''); setQJsonError(''); setQJsonSuccess('') }}>Cancel</Btn>
              </div>
            </div>
          )}

          {qEditing !== null && (
            <ActiveCard>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{qEditing === 'new' ? 'New Question' : 'Edit Question'}</div>
              <Field label="Question">
                <textarea style={{ ...s.inp, minHeight: 70, resize: 'vertical' }} value={mcqForm.q} onChange={e => setMcqField('q', e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {mcqForm.opts.map((opt, i) => (
                  <div key={i}>
                    <label style={s.lbl}>Option {String.fromCharCode(65 + i)}</label>
                    <input style={s.inp} value={opt} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  </div>
                ))}
              </div>
              <Field label="Correct Answer">
                <select style={{ ...s.inp, width: 160 }} value={mcqForm.ans} onChange={e => setMcqField('ans', Number(e.target.value))}>
                  {mcqForm.opts.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>)}
                </select>
              </Field>
              <Field label="Explanation">
                <textarea style={{ ...s.inp, minHeight: 60, resize: 'vertical' }} value={mcqForm.exp} onChange={e => setMcqField('exp', e.target.value)} />
              </Field>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <Btn variant="ghost" onClick={() => setQEditing(null)}>Cancel</Btn>
                <Btn variant="success" onClick={saveQuestion}>✓ Save Question</Btn>
              </div>
            </ActiveCard>
          )}

          {(tests[activeTestIdx]?.questions || []).length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>No questions in this test yet.</div>
            : (tests[activeTestIdx]?.questions || []).map((q, qi) => (
              <div key={qi} style={{ ...s.card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Q{qi + 1}. {q.q}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Correct: {q.opts?.[q.ans]}</div>
                </div>
                <Btn sm variant="ghost" onClick={() => { setMcqForm({ ...BLANK_MCQ, ...q }); setQEditing(qi) }}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => deleteQuestion(qi)}>Delete</Btn>
              </div>
            ))
          }
        </>
      )}
    </div>
  )
}

const TABS = [
  { key: 'coding',     label: '💻 Coding Problems' },
  { key: 'assessment', label: '📝 Assessment' },
  { key: 'roadmap',    label: '🗺️ Roadmap' },
  { key: 'daily',      label: '📅 Daily Tasks' },
  { key: 'aptitude',   label: '🧮 Aptitude Training' },
  { key: 'quote',      label: '💬 Daily Quote' },
  { key: 'companies',  label: '🏢 Manage Companies' },
  { key: 'company',    label: '📋 Company Questions' },
]

export default function Admin() {
  const { user, logout } = useApp()
  const { codingProblems, assessmentQuestions, roadmapPhases, dailyTasks, aptitudeTopics, dailyQuote, companyProblems, companies, updateContent } = useContent()
  const navigate = useNavigate()
  const [tab, setTab] = useState('coding')

  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>NextPath Admin</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Content Management Portal</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => navigate('/dashboard')}>← Back to App</Btn>
          <Btn variant="danger" onClick={() => { logout(); navigate('/login') }}>Sign Out</Btn>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
        {/* Sidebar */}
        <aside style={{ width: 210, background: 'var(--card)', borderRight: '1px solid var(--border)', paddingTop: 16, flexShrink: 0 }}>
          {TABS.map(t => (
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

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {tab === 'coding'     && <CodingProblemsTab problems={codingProblems}         onUpdate={d => updateContent('codingProblems', d)} />}
          {tab === 'assessment' && <AssessmentTab     questions={assessmentQuestions}   onUpdate={d => updateContent('assessmentQuestions', d)} />}
          {tab === 'roadmap'    && <RoadmapTab        roadmapByLevel={roadmapPhases}    onUpdate={d => updateContent('roadmapPhases', d)} />}
          {tab === 'daily'      && <DailyTasksTab     tasks={dailyTasks}                onUpdate={d => updateContent('dailyTasks', d)} />}
          {tab === 'aptitude'   && <AptitudeTab       topics={aptitudeTopics}           onUpdate={d => updateContent('aptitudeTopics', d)} />}
          {tab === 'quote'      && <QuoteTab          quote={dailyQuote}                onUpdate={d => updateContent('dailyQuote', d)} />}
          {tab === 'companies'  && <CompaniesTab        companies={companies}             onUpdate={d => updateContent('companies', { items: d })} />}
          {tab === 'company'    && <CompanyQuestionsTab companies={companies} companyProblems={companyProblems} onUpdate={d => updateContent('companyProblems', d)} />}
        </main>
      </div>
    </div>
  )
}
