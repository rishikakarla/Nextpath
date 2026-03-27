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
  description: '', inputFormat: '', outputFormat: '', constraints: '', hint: '',
  examples:  [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', expectedOutput: '', hidden: false }],
  starterCode: { 71: '', 63: '', 54: '' },
}


function CodingProblemsTab({ problems = [], onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_PROB)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const deepClone = (p) => ({
    ...p,
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>
          Coding Problems <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>({problems.length})</span>
        </h2>
        <Btn onClick={() => { setForm(BLANK_PROB); setEditing('new') }}>+ Add Problem</Btn>
      </div>

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
        <Field label="Hint (optional)">
          <textarea style={{ ...s.inp, height: 60, resize: 'vertical' }} value={form.hint}
            onChange={e => set('hint', e.target.value)} placeholder="Tip to nudge students..." />
        </Field>
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
const BLANK_TOPIC = { name: '', description: '', resources: [], quiz: [] }

const ROADMAP_LEVELS = [
  { key: 'beginner',     label: 'Beginner',      color: '#10b981' },
  { key: 'beginnerPlus', label: 'Beginner+',     color: '#6366f1' },
  { key: 'intermediate', label: 'Intermediate',  color: '#f59e0b' },
  { key: 'advanced',     label: 'Advanced',      color: '#ef4444' },
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
                    <Btn sm onClick={() => { setTopicForm(BLANK_TOPIC); setEditingTopic({ phaseId: phase.id, topicId: 'new' }) }}>+ Add Topic</Btn>
                  </div>

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
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 10, border: '1px solid var(--primary)' }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>{isNew ? 'New Topic' : 'Edit Topic'}</div>
      <Field label="Topic Name">
        <input style={s.inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Binary Trees & Traversals" />
      </Field>
      <Field label="Description">
        <textarea style={{ ...s.inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Explain this topic briefly..." />
      </Field>
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
  description: '', inputFormat: '', outputFormat: '', constraints: '', hint: '',
  examples:    [{ input: '', output: '', explanation: '' }],
  testCases:   [{ input: '', expectedOutput: '', hidden: false }],
  starterCode: { 71: '', 63: '', 54: '' },
}
const BLANK_DAILY_QUIZ = {
  format: 'quiz',
  questions: [{ question: '', options: ['', '', '', ''], answer: 0 }],
}
const getBlankTask = (type) => type === 'aptitude'
  ? { ...BLANK_DAILY_QUIZ, questions: [{ question: '', options: ['', '', '', ''], answer: 0 }] }
  : { ...BLANK_DAILY_CODING, examples: [{ input: '', output: '', explanation: '' }], testCases: [{ input: '', expectedOutput: '', hidden: false }], starterCode: { 71: '', 63: '', 54: '' } }

function DailyQuizForm({ form, setForm }) {
  const setQ   = (qi, k, v) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, [k]: v } : q) }))
  const setOpt = (qi, oi, v) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? v : o) } : q) }))
  const addQ   = () => setForm(f => ({ ...f, questions: [...(f.questions || []), { question: '', options: ['', '', '', ''], answer: 0 }] }))
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
        </div>
      ))}
      <Btn sm variant="ghost" onClick={addQ}>+ Add Question</Btn>
    </div>
  )
}

function DailyTasksTab({ tasks = { coding: [], aptitude: [], revision: [] }, onUpdate }) {
  const [type, setType]       = useState('coding')
  const [editing, setEditing] = useState(null)   // null | 'new' | index
  const [form, setForm]       = useState(() => getBlankTask('coding'))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
        {editing === null && <Btn onClick={startNew}>+ Add Task</Btn>}
      </div>

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

// ── Main Admin Layout ─────────────────────────────────────────────────────────
const TABS = [
  { key: 'coding',     label: '💻 Coding Problems' },
  { key: 'assessment', label: '📝 Assessment' },
  { key: 'roadmap',    label: '🗺️ Roadmap' },
  { key: 'daily',      label: '📅 Daily Tasks' },
]

export default function Admin() {
  const { user, logout } = useApp()
  const { codingProblems, assessmentQuestions, roadmapPhases, dailyTasks, updateContent } = useContent()
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
        </main>
      </div>
    </div>
  )
}
