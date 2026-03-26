import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import ProblemEditor from '../components/ProblemEditor'

export default function CodingPractice() {
  const { solvedProblems, solveProblem } = useApp()
  const { codingProblems } = useContent()
  const [cat, setCat] = useState('All')
  const [modal, setModal] = useState(null)

  const categories = ['All', ...new Set(codingProblems.map(p => p.category))]
  const filtered = cat === 'All' ? codingProblems : codingProblems.filter(p => p.category === cat)

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
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {p.testCases?.length || 0} test cases
              </span>
              {solved && <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Solved</span>}
            </div>
          )
        })}
      </div>

      {/* Full-screen problem modal */}
      {modal && (
        <div className="pe-modal-overlay">
          <div className="pe-modal-container">
            {/* Header */}
            <div className="pe-modal-topbar">
              <div className="pe-modal-topbar-left">
                <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>NextPath</span>
                <span style={{ color: '#475569', margin: '0 8px' }}>/</span>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>{modal.title}</span>
              </div>
              <button className="pe-modal-close-btn" onClick={() => setModal(null)}>✕ Close</button>
            </div>

            {/* ProblemEditor fills the rest */}
            <ProblemEditor
              problem={modal}
              isSolved={solvedProblems.includes(modal.id)}
              onSolve={() => solveProblem(modal.id)}
            />
          </div>
        </div>
      )}
    </div>
  )
}