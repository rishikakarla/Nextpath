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
const BLANK_PROB = { title: '', category: 'Arrays', difficulty: 'Easy', description: '', example: '', hint: '' }

function CodingProblemsTab({ problems = [], onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_PROB)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.title.trim() || !form.description.trim()) return
    if (editing === 'new') {
      onUpdate([...problems, { ...form, id: Date.now() }])
    } else {
      onUpdate(problems.map(p => p.id === editing ? { ...form, id: editing } : p))
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
        <h2 style={{ margin: 0, fontSize: 20 }}>Coding Problems <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>({problems.length})</span></h2>
        <Btn onClick={() => { setForm(BLANK_PROB); setEditing('new') }}>+ Add Problem</Btn>
      </div>

      {editing === 'new' && (
        <ActiveCard>
          <h3 style={{ margin: '0 0 16px' }}>New Problem</h3>
          <ProblemForm form={form} set={set} onSave={save} onCancel={() => setEditing(null)} />
        </ActiveCard>
      )}

      {problems.map(p => (
        <div key={p.id}>
          {editing === p.id ? (
            <ActiveCard>
              <h3 style={{ margin: '0 0 16px' }}>Edit Problem</h3>
              <ProblemForm form={form} set={set} onSave={save} onCancel={() => setEditing(null)} />
            </ActiveCard>
          ) : (
            <div style={{ ...s.card, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.category}</span>
                <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                <Btn sm variant="ghost" onClick={() => { setForm({ ...p }); setEditing(p.id) }}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => remove(p.id)}>Delete</Btn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ProblemForm({ form, set, onSave, onCancel }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
      <Field label="Description">
        <textarea style={{ ...s.inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
      </Field>
      <Field label="Example">
        <textarea style={{ ...s.inp, height: 60, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} value={form.example} onChange={e => set('example', e.target.value)} />
      </Field>
      <Field label="Hint">
        <input style={s.inp} value={form.hint} onChange={e => set('hint', e.target.value)} />
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={onSave} variant="success">Save Problem</Btn>
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
const BLANK_CODING_TASK = { day: 1, format: 'coding', title: '', difficulty: 'Easy', category: 'Arrays', description: '', example: '', hint: '' }
const BLANK_QUIZ_TASK   = { day: 1, format: 'quiz', questions: [{ question: '', options: ['', '', '', ''], answer: 0 }] }
const getBlankTask = (t) => t === 'aptitude' ? { ...BLANK_QUIZ_TASK } : { ...BLANK_CODING_TASK }

function DailyTaskForm({ taskType, form, setForm, onSave, onCancel }) {
  const setQ   = (qi, k, v) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, [k]: v } : q) }))
  const setOpt = (qi, oi, v) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? v : o) } : q) }))
  const addQ   = () => setForm(f => ({ ...f, questions: [...(f.questions || []), { question: '', options: ['', '', '', ''], answer: 0 }] }))
  const removeQ = (qi) => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))
  const switchFormat = (fmt) => fmt === 'coding'
    ? setForm(f => ({ ...BLANK_CODING_TASK, day: f.day }))
    : setForm(f => ({ ...BLANK_QUIZ_TASK, day: f.day }))

  return (
    <ActiveCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Format toggle — only for revision */}
          {taskType === 'revision' && [
            { key: 'coding', label: '💻 Coding Challenge' },
            { key: 'quiz',   label: '🧮 Quiz' },
          ].map(f => (
            <button key={f.key} type="button" onClick={() => switchFormat(f.key)} style={{
              padding: '5px 12px', borderRadius: 8, border: `2px solid ${form.format === f.key ? 'var(--primary)' : 'var(--border)'}`,
              background: form.format === f.key ? 'var(--primary-light)' : 'transparent',
              color: form.format === f.key ? 'var(--primary)' : 'var(--text)',
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
            }}>{f.label}</button>
          ))}
          {taskType === 'coding'   && <span style={{ fontWeight: 700, color: '#6366f1' }}>💻 Coding Challenge</span>}
          {taskType === 'aptitude' && <span style={{ fontWeight: 700, color: '#f59e0b' }}>🧮 Aptitude Quiz</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={s.lbl}>Day</span>
          <input type="number" min="1" style={{ ...s.inp, width: 70 }} value={form.day}
            onChange={e => setForm(f => ({ ...f, day: Math.max(1, Number(e.target.value)) }))} />
        </div>
      </div>

      {/* ── Coding fields ──────────────────────────────────────── */}
      {form.format === 'coding' && (<>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 140px', gap: 12 }}>
          <Field label="Title">
            <input style={s.inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Two Sum" />
          </Field>
          <Field label="Difficulty">
            <select style={s.inp} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              {DIFFS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <input style={s.inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Arrays" />
          </Field>
        </div>
        <Field label="Description">
          <textarea style={{ ...s.inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Problem description..." />
        </Field>
        <Field label="Example">
          <textarea style={{ ...s.inp, height: 55, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} value={form.example} onChange={e => setForm(f => ({ ...f, example: e.target.value }))} placeholder={'Input: ...\nOutput: ...'} />
        </Field>
        <Field label="Hint">
          <input style={s.inp} value={form.hint || ''} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))} placeholder="Hint for the student..." />
        </Field>
      </>)}

      {/* ── Quiz fields ────────────────────────────────────────── */}
      {form.format === 'quiz' && (
        <div>
          {(form.questions || []).map((q, qi) => (
            <div key={qi} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Question {qi + 1}</span>
                <Btn sm variant="danger" onClick={() => removeQ(qi)}>Remove</Btn>
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
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Btn onClick={onSave} variant="success">Save Task</Btn>
        <Btn onClick={onCancel} variant="ghost">Cancel</Btn>
      </div>
    </ActiveCard>
  )
}

function DailyTasksTab({ tasks = { coding: [], aptitude: [], revision: [] }, onUpdate }) {
  const [type, setType]     = useState('coding')
  const [editing, setEditing] = useState(null)
  const [form, setForm]     = useState(BLANK_CODING_TASK)

  const raw     = tasks[type] || []
  const current = [...raw].sort((a, b) => (a.day || 1) - (b.day || 1))

  const startNew = () => { setForm(getBlankTask(type)); setEditing('new') }

  const save = () => {
    if (form.format === 'coding' && !form.title.trim()) return
    if (form.format === 'quiz'   && !form.questions?.[0]?.question.trim()) return
    const updated = editing === 'new'
      ? { ...tasks, [type]: [...raw, { ...form }] }
      : { ...tasks, [type]: raw.map((t, i) => i === editing ? { ...form } : t) }
    onUpdate(updated)
    setEditing(null)
  }

  const remove = (i) => {
    if (!window.confirm('Delete this task?')) return
    onUpdate({ ...tasks, [type]: raw.filter((_, idx) => idx !== i) })
  }

  const byDay = current.reduce((acc, task) => {
    const day = task.day || 1
    const rawIdx = raw.indexOf(task)
    if (!acc[day]) acc[day] = []
    acc[day].push({ ...task, _rawIdx: rawIdx })
    return acc
  }, {})

  const TYPE_META = {
    coding:   { label: '💻 Coding',   color: '#6366f1' },
    aptitude: { label: '🧮 Aptitude', color: '#f59e0b' },
    revision: { label: '📖 Revision', color: '#10b981' },
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>Daily Tasks</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Day 1 = student's registration date. Coding = challenge, Aptitude = quiz, Revision = either.
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
        <Btn onClick={startNew}>+ Add Task</Btn>
      </div>

      {editing === 'new' && (
        <DailyTaskForm taskType={type} form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} />
      )}

      {Object.keys(byDay).length === 0 && editing !== 'new' ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontSize: 14, fontStyle: 'italic' }}>
          No {type} tasks yet. Add one above.
        </div>
      ) : (
        Object.entries(byDay).map(([day, dayTasks]) => (
          <div key={day} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
              Day {day}
            </div>
            {dayTasks.map(task => (
              <div key={task._rawIdx}>
                {editing === task._rawIdx ? (
                  <DailyTaskForm taskType={type} form={form} setForm={setForm} onSave={save} onCancel={() => setEditing(null)} />
                ) : (
                  <div style={{ ...s.card, padding: '12px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        {task.format === 'coding' ? (<>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <span className={`badge badge-${task.difficulty?.toLowerCase()}`}>{task.difficulty}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{task.category}</span>
                          </div>
                        </>) : (<>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>Quiz — {task.questions?.length} question{task.questions?.length !== 1 ? 's' : ''}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {task.questions?.slice(0, 2).map((q, i) => `Q${i + 1}: ${q.question.slice(0, 35)}${q.question.length > 35 ? '…' : ''}`).join(' · ')}
                          </div>
                        </>)}
                      </div>
                      <Btn sm variant="ghost" onClick={() => { setForm({ ...task }); setEditing(task._rawIdx) }}>Edit</Btn>
                      <Btn sm variant="danger" onClick={() => remove(task._rawIdx)}>Delete</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
