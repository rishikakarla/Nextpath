import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import ProblemEditor from '../components/ProblemEditor'

const DIFF_META = {
  Easy:   { color: '#10b981', bg: 'rgba(16,185,129,.15)', label: 'Easy' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,.15)', label: 'Medium' },
  Hard:   { color: '#ef4444', bg: 'rgba(239,68,68,.15)',  label: 'Hard' },
}

export default function CodingPractice() {
  const { solvedProblems, solveProblem, codingSubmissions, saveSubmission } = useApp()
  const { codingProblems } = useContent()
  const [cat, setCat]     = useState('All')
  const [diff, setDiff]   = useState('All')
  const [modal, setModal] = useState(null)

  const categories = ['All', ...new Set(codingProblems.map(p => p.category))]
  const difficulties = ['All', 'Easy', 'Medium', 'Hard']

  const filtered = codingProblems.filter(p => {
    const catOk  = cat  === 'All' || p.category  === cat
    const diffOk = diff === 'All' || p.difficulty === diff
    return catOk && diffOk
  })

  const solvedCount = solvedProblems.length
  const total       = codingProblems.length
  const pct         = total ? Math.round((solvedCount / total) * 100) : 0
  const easyCount   = codingProblems.filter(p => p.difficulty === 'Easy').length
  const medCount    = codingProblems.filter(p => p.difficulty === 'Medium').length
  const hardCount   = codingProblems.filter(p => p.difficulty === 'Hard').length
  const easySolved  = codingProblems.filter(p => p.difficulty === 'Easy'   && solvedProblems.includes(p.id)).length
  const medSolved   = codingProblems.filter(p => p.difficulty === 'Medium' && solvedProblems.includes(p.id)).length
  const hardSolved  = codingProblems.filter(p => p.difficulty === 'Hard'   && solvedProblems.includes(p.id)).length

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div className="cp-hero">
        {/* Code decoration */}
        <div className="cp-hero-code" aria-hidden="true">
          <span className="cp-code-line"><span className="cp-kw">function</span> <span className="cp-fn">solve</span>(<span className="cp-param">problem</span>) {'{'}</span>
          <span className="cp-code-line cp-indent"><span className="cp-kw">const</span> answer = <span className="cp-fn">think</span>(deeper);</span>
          <span className="cp-code-line cp-indent"><span className="cp-kw">return</span> answer;</span>
          <span className="cp-code-line">{'}'}</span>
        </div>

        <div className="cp-hero-left">
          <div className="cp-hero-eyebrow">💻 Competitive Programming</div>
          <div className="cp-hero-title">Coding Practice</div>
          <div className="cp-hero-sub">Solve problems · earn points · level up</div>

          {/* Overall progress bar */}
          <div className="cp-hero-progress">
            <div className="cp-hero-progress-label">
              <span>Overall Progress</span>
              <span className="cp-hero-progress-pct">{solvedCount}/{total} solved · {pct}%</span>
            </div>
            <div className="cp-hero-progress-track">
              <div className="cp-hero-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="cp-hero-stats">
          {[
            { val: solvedCount, lbl: 'Solved',  sub: `of ${total}`,    color: '#6366f1' },
            { val: `${easySolved}/${easyCount}`,  lbl: 'Easy',   sub: '+10 pts each', color: '#10b981' },
            { val: `${medSolved}/${medCount}`,    lbl: 'Medium', sub: '+10 pts each', color: '#f59e0b' },
            { val: `${hardSolved}/${hardCount}`,  lbl: 'Hard',   sub: '+10 pts each', color: '#ef4444' },
          ].map(s => (
            <div key={s.lbl} className="cp-hero-stat">
              <div className="cp-hero-stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="cp-hero-stat-lbl">{s.lbl}</div>
              <div className="cp-hero-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="cp-filters">
        {/* Category tabs */}
        <div className="cp-filter-group">
          <span className="cp-filter-label">Category</span>
          <div className="cp-filter-pills">
            {categories.map(c => {
              const cSolved = c === 'All' ? solvedCount : codingProblems.filter(p => p.category === c && solvedProblems.includes(p.id)).length
              const cTotal  = c === 'All' ? total : codingProblems.filter(p => p.category === c).length
              return (
                <button
                  key={c}
                  className={`cp-pill${cat === c ? ' active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                  <span className="cp-pill-count">{cSolved}/{cTotal}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Difficulty filter */}
        <div className="cp-filter-group">
          <span className="cp-filter-label">Difficulty</span>
          <div className="cp-filter-pills">
            {difficulties.map(d => (
              <button
                key={d}
                className={`cp-pill cp-pill-diff${diff === d ? ' active' : ''}`}
                style={diff === d && d !== 'All' ? {
                  background: DIFF_META[d]?.bg,
                  borderColor: DIFF_META[d]?.color,
                  color: DIFF_META[d]?.color,
                } : {}}
                onClick={() => setDiff(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Problems Table ── */}
      <div className="cp-table-wrap">
        {/* Table header */}
        <div className="cp-table-head">
          <span className="cp-th cp-th-status">Status</span>
          <span className="cp-th cp-th-num">#</span>
          <span className="cp-th cp-th-title">Problem</span>
          <span className="cp-th cp-th-cat">Category</span>
          <span className="cp-th cp-th-diff">Difficulty</span>
          <span className="cp-th cp-th-tc">Test Cases</span>
          <span className="cp-th cp-th-pts">Points</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty-icon">🔍</div>
            <div className="cp-empty-text">No problems match the current filters.</div>
          </div>
        ) : (
          filtered.map((p, i) => {
            const solved = solvedProblems.includes(p.id)
            const dm     = DIFF_META[p.difficulty] || DIFF_META.Medium
            return (
              <div
                key={p.id}
                className={`cp-row${solved ? ' cp-row-solved' : ''}`}
                onClick={() => setModal(p)}
              >
                <span className="cp-td cp-td-status">
                  {solved
                    ? <span className="cp-solved-dot" title="Solved">✓</span>
                    : <span className="cp-unsolved-dot" />
                  }
                </span>
                <span className="cp-td cp-td-num">{i + 1}</span>
                <span className="cp-td cp-td-title">
                  <span className="cp-problem-name">{p.title}</span>
                  {solved && <span className="cp-solved-tag">Solved</span>}
                </span>
                <span className="cp-td cp-td-cat">
                  <span className="cp-cat-chip">{p.category}</span>
                </span>
                <span className="cp-td cp-td-diff">
                  <span className="cp-diff-chip" style={{ color: dm.color, background: dm.bg }}>
                    {p.difficulty}
                  </span>
                </span>
                <span className="cp-td cp-td-tc">{p.testCases?.length || 0} tests</span>
                <span className="cp-td cp-td-pts">
                  <span className={`cp-pts-chip${solved ? ' earned' : ''}`}>
                    {solved ? '✓ +10' : '+10'}
                  </span>
                </span>
              </div>
            )
          })
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="cp-table-footer">
            Showing {filtered.length} problem{filtered.length !== 1 ? 's' : ''}
            {cat !== 'All' || diff !== 'All' ? ` (filtered)` : ''}
            &nbsp;·&nbsp;
            {filtered.filter(p => solvedProblems.includes(p.id)).length} solved
          </div>
        )}
      </div>

      {/* ── Full-screen Problem Modal ── */}
      {modal && (
        <div className="pe-modal-overlay">
          <div className="pe-modal-container">
            <div className="pe-modal-topbar">
              <div className="pe-modal-topbar-left">
                <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>NextPath</span>
                <span style={{ color: '#475569', margin: '0 8px' }}>/</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Coding Practice</span>
                <span style={{ color: '#475569', margin: '0 8px' }}>/</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{modal.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="cp-diff-chip" style={{
                  color: DIFF_META[modal.difficulty]?.color,
                  background: DIFF_META[modal.difficulty]?.color + '22',
                  fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                }}>
                  {modal.difficulty}
                </span>
                {solvedProblems.includes(modal.id) && (
                  <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>✓ Solved</span>
                )}
                <button className="pe-modal-close-btn" onClick={() => setModal(null)}>✕ Close</button>
              </div>
            </div>
            <ProblemEditor
              problem={modal}
              isSolved={solvedProblems.includes(modal.id)}
              onSolve={result => solveProblem(modal.id, result)}
              onSubmit={sub => saveSubmission(modal.id, sub)}
              submissions={codingSubmissions[modal.id] || []}
            />
          </div>
        </div>
      )}
    </div>
  )
}
