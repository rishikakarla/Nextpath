import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import CodeEditor from '../components/CodeEditor'

export default function CodingPractice() {
  const { solvedProblems, solveProblem } = useApp()
  const { codingProblems } = useContent()
  const [cat, setCat] = useState('All')
  const [modal, setModal] = useState(null)

  const categories = ['All', ...new Set(codingProblems.map(p => p.category))]
  const filtered = cat === 'All' ? codingProblems : codingProblems.filter(p => p.category === cat)

  const solve = (id) => {
    solveProblem(id)
    setModal(p => p ? { ...p, justSolved: true } : null)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Coding Practice</h1>
        <p className="page-subtitle">
          {solvedProblems.length}/{codingProblems.length} problems solved · Each solved problem = +10 pts
        </p>
      </div>

      <div className="category-tabs">
        {categories.map(c => (
          <button
            key={c}
            className={`category-tab${cat === c ? ' active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c}
            {c !== 'All' && (
              <span style={{ marginLeft: 4, opacity: .7 }}>
                ({codingProblems.filter(p => p.category === c && solvedProblems.includes(p.id)).length}/
                {codingProblems.filter(p => p.category === c).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="problems-list">
        {filtered.map((p, i) => {
          const solved = solvedProblems.includes(p.id)
          return (
            <div
              key={p.id}
              className={`problem-row${solved ? ' solved' : ''}`}
              onClick={() => setModal(p)}
            >
              <span className="problem-num">{i + 1}</span>
              {solved
                ? <span className="problem-solved-icon">✅</span>
                : <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>⬜</span>
              }
              <span className="problem-title">{p.title}</span>
              <span className="problem-category">{p.category}</span>
              <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
              {solved && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Solved</span>}
            </div>
          )
        })}
      </div>

      {modal && (
        <div className="problem-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="problem-modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">{modal.title}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <span className={`badge badge-${modal.difficulty.toLowerCase()}`}>{modal.difficulty}</span>
                  <span className="badge badge-primary">{modal.category}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>
              Problem Description
            </div>
            <div className="problem-description">{modal.description}</div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>
              Example
            </div>
            <div className="code-block">{modal.example}</div>

            <div style={{ background: 'var(--warning-light)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, borderLeft: '3px solid var(--warning)' }}>
              <strong>💡 Hint:</strong> {modal.hint}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>
              Code Editor
            </div>
            <CodeEditor onSuccess={() => !solvedProblems.includes(modal.id) && solve(modal.id)} />

            {solvedProblems.includes(modal.id) ? (
              <div className="alert alert-success" style={{ marginTop: 16 }}>
                ✅ You've already solved this problem! +10 pts earned.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="btn btn-success" onClick={() => solve(modal.id)}>
                  ✓ Mark as Solved (+10 pts)
                </button>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
