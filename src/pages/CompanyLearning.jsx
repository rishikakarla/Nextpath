import { useState, useMemo } from 'react'
import { COMPANIES } from '../data/companyData'

const FILTERS = ['All', 'Product', 'Service', 'Startup']
const TABS = [
  { id: 'coding',   label: 'Coding',   icon: '💻' },
  { id: 'aptitude', label: 'Aptitude', icon: '🧮' },
  { id: 'english',  label: 'English',  icon: '📖' },
]
const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }

export default function CompanyLearning() {
  const [view,     setView]     = useState('home')    // 'home' | 'practice'
  const [company,  setCompany]  = useState(null)
  const [tab,      setTab]      = useState('coding')
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('All')
  const [answers,  setAnswers]  = useState({})        // key → { chosen, correct }
  const [expanded, setExpanded] = useState(null)      // coding problem index

  const filtered = useMemo(() => COMPANIES.filter(c => {
    const matchType   = filter === 'All' || c.type === filter
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.fullName.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  }), [filter, search])

  const openCompany = (c) => {
    setCompany(c)
    setView('practice')
    setTab('coding')
    setExpanded(null)
  }

  const goHome = () => { setView('home'); setCompany(null) }

  const pickAnswer = (key, chosen, correct) => {
    if (answers[key]) return          // already answered
    setAnswers(prev => ({ ...prev, [key]: { chosen, correct } }))
  }

  const getScore = (cId, section) => {
    const qs = company?.[section] || []
    let correct = 0
    qs.forEach((_, i) => {
      const k = `${cId}_${section}_${i}`
      if (answers[k]?.correct) correct++
    })
    return { correct, total: qs.length }
  }

  /* ── HOME ── */
  if (view === 'home') return (
    <div className="cbl-page">

      {/* Hero */}
      <div className="cbl-hero">
        <div className="cbl-hero-content">
          <div className="cbl-hero-badge">🏢 Company Based Learning</div>
          <h1 className="cbl-hero-title">Prepare for Your Dream Company</h1>
          <p className="cbl-hero-sub">Practice Coding, Aptitude &amp; English — tailored for each company's interview pattern</p>
          <div className="cbl-hero-pills">
            <span className="cbl-hero-pill">💻 {COMPANIES.reduce((s, c) => s + c.coding.length, 0)} Coding Problems</span>
            <span className="cbl-hero-pill">🧮 {COMPANIES.reduce((s, c) => s + c.aptitude.length, 0)} Aptitude MCQs</span>
            <span className="cbl-hero-pill">📖 {COMPANIES.reduce((s, c) => s + c.english.length, 0)} English MCQs</span>
          </div>
        </div>
        <div className="cbl-hero-icons">
          {COMPANIES.slice(0, 6).map(c => (
            <div key={c.id} className="cbl-float-icon" style={{ '--cc': c.color }}>{c.icon}</div>
          ))}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="cbl-toolbar">
        <div className="cbl-search-wrap">
          <span className="cbl-search-icon">🔍</span>
          <input className="cbl-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company…" />
          {search && <button className="cbl-search-clear" onClick={() => setSearch('')}>×</button>}
        </div>
        <div className="cbl-filters">
          {FILTERS.map(f => {
            const count = f === 'All' ? COMPANIES.length : COMPANIES.filter(c => c.type === f).length
            return (
              <button key={f} className={`cbl-filter${filter === f ? ' cbl-filter--on' : ''}`} onClick={() => setFilter(f)}>
                {f} <span className="cbl-filter-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Company Grid */}
      {filtered.length === 0
        ? <div className="cbl-no-results">No companies found for "{search}"</div>
        : (
          <div className="cbl-grid">
            {filtered.map(c => (
              <div key={c.id} className="cbl-card" style={{ '--cc': c.color, '--cg': c.glow }} onClick={() => openCompany(c)}>
                {/* Card top stripe */}
                <div className="cbl-card-stripe" style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }}>
                  <div className="cbl-card-icon">{c.icon}</div>
                  <div>
                    <div className="cbl-card-name">{c.name}</div>
                    <div className="cbl-card-full">{c.fullName}</div>
                  </div>
                  <div className="cbl-card-badges">
                    <span className="cbl-type-badge">{c.type}</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="cbl-card-body">
                  <div className="cbl-card-meta">
                    <span className="cbl-diff-badge" style={{ color: DIFF_COLOR[c.difficulty], borderColor: DIFF_COLOR[c.difficulty], background: `${DIFF_COLOR[c.difficulty]}18` }}>
                      {c.difficulty}
                    </span>
                    <span className="cbl-pkg">💰 {c.package}</span>
                  </div>

                  <div className="cbl-card-counts">
                    <div className="cbl-count-chip cbl-count-chip--code">
                      <span>💻</span><span>{c.coding.length} Coding</span>
                    </div>
                    <div className="cbl-count-chip cbl-count-chip--apt">
                      <span>🧮</span><span>{c.aptitude.length} Aptitude</span>
                    </div>
                    <div className="cbl-count-chip cbl-count-chip--eng">
                      <span>📖</span><span>{c.english.length} English</span>
                    </div>
                  </div>

                  <div className="cbl-rounds-row">
                    {c.rounds.slice(0, 3).map((r, i) => <span key={i} className="cbl-round-chip">{r}</span>)}
                    {c.rounds.length > 3 && <span className="cbl-round-chip">+{c.rounds.length - 3}</span>}
                  </div>

                  <button className="cbl-start-btn" style={{ background: c.color }}>
                    Start Practice →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )

  /* ── PRACTICE VIEW ── */
  const questions = company[tab]
  const score = (tab !== 'coding') ? getScore(company.id, tab) : null

  return (
    <div className="cbl-page">
      {/* Company header */}
      <div className="cbl-practice-hero" style={{ '--cc': company.color, '--cg': company.glow }}>
        <button className="cbl-back-btn" onClick={goHome}>← All Companies</button>
        <div className="cbl-ph-main">
          <div className="cbl-ph-icon">{company.icon}</div>
          <div className="cbl-ph-info">
            <div className="cbl-ph-name">{company.name}</div>
            <div className="cbl-ph-sub">{company.fullName}</div>
          </div>
          <div className="cbl-ph-badges">
            <span className="cbl-diff-badge" style={{ color: DIFF_COLOR[company.difficulty], borderColor: DIFF_COLOR[company.difficulty], background: `${DIFF_COLOR[company.difficulty]}22` }}>{company.difficulty}</span>
            <span className="cbl-ph-pkg">💰 {company.package}</span>
          </div>
        </div>

        <div className="cbl-ph-meta">
          <div className="cbl-ph-rounds">
            <span className="cbl-ph-meta-label">Interview Rounds</span>
            <div className="cbl-rounds-list">
              {company.rounds.map((r, i) => (
                <span key={i} className="cbl-round-num"><span className="cbl-rn">{i + 1}</span>{r}</span>
              ))}
            </div>
          </div>
          <div className="cbl-ph-tip">
            <span className="cbl-tip-icon">💡</span>
            <span>{company.tip}</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="cbl-tab-bar">
        {TABS.map(t => {
          const s = tab !== 'coding' ? getScore(company.id, t.id) : null
          return (
            <button key={t.id} className={`cbl-tab${tab === t.id ? ' cbl-tab--on' : ''}`}
              style={tab === t.id ? { '--cc': company.color } : {}}
              onClick={() => { setTab(t.id); setExpanded(null) }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span className="cbl-tab-count">{company[t.id].length}</span>
              {t.id !== 'coding' && s && s.total > 0 && (
                <span className="cbl-tab-score">{s.correct}/{s.total}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="cbl-content">

        {/* ── CODING TAB ── */}
        {tab === 'coding' && (
          <div className="cbl-coding-list">
            {questions.map((p, i) => (
              <div key={i} className={`cbl-prob${expanded === i ? ' cbl-prob--open' : ''}`}
                onClick={() => setExpanded(expanded === i ? null : i)}>
                <div className="cbl-prob-hdr">
                  <div className="cbl-prob-left">
                    <span className="cbl-prob-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cbl-prob-title">{p.title}</span>
                  </div>
                  <div className="cbl-prob-right">
                    {p.tags.map(t => <span key={t} className="cbl-prob-tag">{t}</span>)}
                    <span className="cbl-diff-sm" style={{ color: DIFF_COLOR[p.difficulty] }}>● {p.difficulty}</span>
                    <span className="cbl-prob-chevron">{expanded === i ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expanded === i && (
                  <div className="cbl-prob-body" onClick={e => e.stopPropagation()}>
                    <p className="cbl-prob-desc">{p.desc}</p>
                    <div className="cbl-prob-example">
                      <div className="cbl-ex-label">Example</div>
                      <pre className="cbl-ex-code">{p.example}</pre>
                    </div>
                    <a href="/ide" className="cbl-solve-btn" style={{ background: company.color }}>
                      🖥️ Solve in IDE →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── APTITUDE / ENGLISH TABS ── */}
        {tab !== 'coding' && (
          <div className="cbl-mcq-wrap">
            {score.total > 0 && (
              <div className="cbl-score-bar">
                <span className="cbl-score-txt">Score: <strong>{score.correct}</strong> / {score.total}</span>
                <div className="cbl-score-track">
                  <div className="cbl-score-fill"
                    style={{ width: `${(score.correct / score.total) * 100}%`, background: company.color }} />
                </div>
                <span className="cbl-score-pct">{Math.round((score.correct / score.total) * 100)}%</span>
              </div>
            )}

            <div className="cbl-mcq-list">
              {questions.map((q, qi) => {
                const key = `${company.id}_${tab}_${qi}`
                const ans = answers[key]
                return (
                  <div key={qi} className={`cbl-mcq${ans ? ' cbl-mcq--done' : ''}`}>
                    <div className="cbl-mcq-q">
                      <span className="cbl-mcq-num">Q{qi + 1}</span>
                      <span className="cbl-mcq-text">{q.q}</span>
                    </div>
                    <div className="cbl-opts">
                      {q.opts.map((opt, oi) => {
                        let cls = 'cbl-opt'
                        if (ans) {
                          if (oi === q.ans) cls += ' cbl-opt--correct'
                          else if (oi === ans.chosen) cls += ' cbl-opt--wrong'
                          else cls += ' cbl-opt--dim'
                        }
                        return (
                          <button key={oi} className={cls} onClick={() => pickAnswer(key, oi, oi === q.ans)}>
                            <span className="cbl-opt-letter">{String.fromCharCode(65 + oi)}</span>
                            <span>{opt}</span>
                            {ans && oi === q.ans && <span className="cbl-opt-tick">✓</span>}
                            {ans && oi === ans.chosen && oi !== q.ans && <span className="cbl-opt-cross">✗</span>}
                          </button>
                        )
                      })}
                    </div>
                    {ans && (
                      <div className="cbl-explanation">
                        <span className="cbl-exp-icon">{ans.correct ? '✅' : '❌'}</span>
                        <span>{q.exp}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
