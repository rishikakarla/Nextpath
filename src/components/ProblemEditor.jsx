import { useState, useRef } from 'react'
import { LANGUAGES, submitCode, getResult } from '../services/judge0'

// ── helpers ───────────────────────────────────────────────────────────────────
function normalize(s) {
  return (s || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}
function passed(actual, expected) {
  return normalize(actual) === normalize(expected)
}

const STATUS_BG = {
  'Accepted':            '#10b981',
  'Wrong Answer':        '#ef4444',
  'Time Limit Exceeded': '#f59e0b',
  'Runtime Error':       '#ef4444',
  'Compilation Error':   '#ef4444',
}

const SUPPORTED_LANGS = LANGUAGES.filter(l => [71, 63, 54].includes(l.id))

// Run one test case through Judge0 and return { passed, stdout, stderr, status, time }
async function runTestCase(code, langId, input) {
  const token = await submitCode(code, langId, input)
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const res = await getResult(token)
    if (res.status?.id !== 1 && res.status?.id !== 2) return res
  }
  throw new Error('Timed out waiting for result')
}

// ── Verdict chip ──────────────────────────────────────────────────────────────
function VerdictChip({ verdict }) {
  if (!verdict) return <span className="pe-chip pe-chip-pending">Pending</span>
  if (verdict === 'running') return <span className="pe-chip pe-chip-running"><span className="ce-spinner" style={{ width: 10, height: 10, borderWidth: 2 }} /> Running</span>
  if (verdict === 'pass') return <span className="pe-chip pe-chip-pass">✓ Passed</span>
  return <span className="pe-chip pe-chip-fail">✗ Failed</span>
}

// ── Problem Panel ─────────────────────────────────────────────────────────────
function ProblemPanel({ problem }) {
  const [activeEx, setActiveEx] = useState(0)
  const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }[problem.difficulty] || '#6366f1'

  return (
    <div className="pe-problem-panel">
      {/* Title */}
      <div className="pe-problem-title-row">
        <span className="pe-problem-title">{problem.title}</span>
        <span className="pe-diff-badge" style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}55` }}>
          {problem.difficulty}
        </span>
        <span className="pe-cat-badge">{problem.category}</span>
      </div>

      {/* Description */}
      <div className="pe-section-label">Problem Statement</div>
      <p className="pe-description">{problem.description}</p>

      {/* Input / Output format */}
      <div className="pe-formats">
        <div className="pe-format-box">
          <div className="pe-section-label">Input Format</div>
          <pre className="pe-format-pre">{problem.inputFormat}</pre>
        </div>
        <div className="pe-format-box">
          <div className="pe-section-label">Output Format</div>
          <pre className="pe-format-pre">{problem.outputFormat}</pre>
        </div>
      </div>

      {/* Constraints */}
      <div className="pe-section-label">Constraints</div>
      <pre className="pe-constraints">{problem.constraints}</pre>

      {/* Examples */}
      <div className="pe-section-label">Sample Test Cases</div>
      <div className="pe-example-tabs">
        {problem.examples.map((_, i) => (
          <button
            key={i}
            className={`pe-example-tab${activeEx === i ? ' active' : ''}`}
            onClick={() => setActiveEx(i)}
          >
            Example {i + 1}
          </button>
        ))}
      </div>
      {problem.examples[activeEx] && (
        <div className="pe-example-box">
          <div className="pe-io-row">
            <div className="pe-io-col">
              <div className="pe-io-label">Input</div>
              <pre className="pe-io-pre">{problem.examples[activeEx].input}</pre>
            </div>
            <div className="pe-io-col">
              <div className="pe-io-label">Output</div>
              <pre className="pe-io-pre">{problem.examples[activeEx].output}</pre>
            </div>
          </div>
          {problem.examples[activeEx].explanation && (
            <div className="pe-explanation">
              <strong>Explanation:</strong> {problem.examples[activeEx].explanation}
            </div>
          )}
        </div>
      )}

      {/* Hint */}
      {problem.hint && (
        <details className="pe-hint">
          <summary>💡 Hint</summary>
          <p>{problem.hint}</p>
        </details>
      )}
    </div>
  )
}

// ── Results Panel ─────────────────────────────────────────────────────────────
function ResultsPanel({ results, problem, running }) {
  if (!results && !running) return null

  const sampleResults  = results?.filter((_, i) => !problem.testCases[i]?.hidden)
  const hiddenResults  = results?.filter((_, i) =>  problem.testCases[i]?.hidden)
  const allPassed      = results && results.every(r => r.verdict === 'pass')
  const passCount      = results?.filter(r => r.verdict === 'pass').length ?? 0
  const totalCount     = results?.length ?? 0

  return (
    <div className="pe-results">
      {/* Summary bar */}
      {results && (
        <div className={`pe-result-summary ${allPassed ? 'pass' : 'fail'}`}>
          <span className="pe-result-icon">{allPassed ? '✅' : '❌'}</span>
          <span className="pe-result-text">
            {allPassed ? 'All test cases passed!' : `${passCount} / ${totalCount} test cases passed`}
          </span>
          <span className="pe-result-score">
            {results[0]?.time && `⏱ ${results[0].time}s`}
          </span>
        </div>
      )}

      {/* Sample test cases (visible) */}
      <div className="pe-tc-section-label">Sample Test Cases</div>
      {problem.testCases
        .map((tc, i) => ({ tc, i }))
        .filter(({ tc }) => !tc.hidden)
        .map(({ tc, i }) => {
          const r = results?.[i]
          return (
            <div key={i} className={`pe-tc-row ${r ? (r.verdict === 'pass' ? 'pass' : 'fail') : ''}`}>
              <div className="pe-tc-header">
                <span className="pe-tc-label">Test Case {i + 1}</span>
                <VerdictChip verdict={running ? 'running' : r?.verdict} />
              </div>
              {r && r.verdict !== 'pass' && (
                <div className="pe-tc-detail">
                  <div className="pe-tc-io">
                    <div className="pe-io-label">Input</div>
                    <pre className="pe-io-pre">{tc.input}</pre>
                  </div>
                  <div className="pe-tc-io">
                    <div className="pe-io-label">Expected</div>
                    <pre className="pe-io-pre">{tc.expectedOutput}</pre>
                  </div>
                  <div className="pe-tc-io">
                    <div className="pe-io-label" style={{ color: '#ef4444' }}>Got</div>
                    <pre className="pe-io-pre pe-io-wrong">
                      {r.stdout || r.stderr || r.compile_output || `(${r.status?.description})`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )
        })}

      {/* Hidden test cases */}
      {results && (
        <>
          <div className="pe-tc-section-label" style={{ marginTop: 12 }}>
            Hidden Test Cases
            <span className="pe-hidden-note">Input/Output not shown</span>
          </div>
          {problem.testCases
            .map((tc, i) => ({ tc, i }))
            .filter(({ tc }) => tc.hidden)
            .map(({ i }, idx) => {
              const r = results?.[i]
              return (
                <div key={i} className={`pe-tc-row ${r ? (r.verdict === 'pass' ? 'pass' : 'fail') : ''}`}>
                  <div className="pe-tc-header">
                    <span className="pe-tc-label">Hidden Test {idx + 1}</span>
                    <VerdictChip verdict={running ? 'running' : r?.verdict} />
                  </div>
                  {r && r.verdict !== 'pass' && r.stderr && (
                    <div className="pe-tc-detail">
                      <div className="pe-io-label" style={{ color: '#ef4444' }}>Error</div>
                      <pre className="pe-io-pre pe-io-wrong">{r.stderr || r.compile_output}</pre>
                    </div>
                  )}
                </div>
              )
            })}
        </>
      )}
    </div>
  )
}

// ── Main ProblemEditor ────────────────────────────────────────────────────────
export default function ProblemEditor({ problem, onSolve, isSolved }) {
  const [langId, setLangId]         = useState(71)  // Python 3 default
  const [code, setCode]             = useState(() => problem.starterCode?.[71] || '')
  const [customInput, setCustomInput] = useState('')
  const [tcTab, setTcTab]           = useState('sample') // 'sample' | 'custom'
  const [customOutput, setCustomOutput] = useState(null)
  const [running, setRunning]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults]       = useState(null)
  const [runMode, setRunMode]       = useState(null) // 'run' | 'submit'
  const [mobileTab, setMobileTab]   = useState('problem') // 'problem' | 'editor'
  const textareaRef                 = useRef(null)

  const handleLangChange = (id) => {
    const numId = Number(id)
    setLangId(numId)
    setCode(problem.starterCode?.[numId] || LANGUAGES.find(l => l.id === numId)?.template || '')
    setResults(null)
    setCustomOutput(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = textareaRef.current
      const s = el.selectionStart, end = el.selectionEnd
      const next = code.substring(0, s) + '    ' + code.substring(end)
      setCode(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4 })
    }
  }

  // Run against custom input only
  const handleRun = async () => {
    if (!code.trim()) return
    setRunning(true)
    setRunMode('run')
    setCustomOutput({ status: 'running' })
    try {
      const res = await runTestCase(code, langId, customInput || (problem.examples[0]?.input ?? ''))
      setCustomOutput(res)
    } catch (e) {
      setCustomOutput({ error: e.message })
    } finally {
      setRunning(false)
    }
  }

  // Submit against ALL test cases
  const handleSubmit = async () => {
    if (!code.trim()) return
    setSubmitting(true)
    setRunMode('submit')
    setResults(problem.testCases.map(() => ({ verdict: 'running' })))

    const newResults = []
    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i]
      try {
        const res = await runTestCase(code, langId, tc.input)
        const stdout = normalize(res.stdout || '')
        const verdict = passed(stdout, tc.expectedOutput) ? 'pass' : 'fail'
        newResults.push({ ...res, verdict })
      } catch (e) {
        newResults.push({ verdict: 'fail', stderr: e.message })
      }
      setResults([...newResults, ...problem.testCases.slice(i + 1).map(() => ({ verdict: 'running' }))])
    }

    setResults(newResults)
    setSubmitting(false)

    if (newResults.every(r => r.verdict === 'pass') && onSolve && !isSolved) {
      onSolve()
    }
  }

  const isRunning = running || submitting

  return (
    <div className="pe-root">
      {/* ── Mobile tab bar ── */}
      <div className="pe-mobile-tabs">
        <button className={`pe-mobile-tab${mobileTab === 'problem' ? ' active' : ''}`} onClick={() => setMobileTab('problem')}>📄 Problem</button>
        <button className={`pe-mobile-tab${mobileTab === 'editor' ? ' active' : ''}`} onClick={() => setMobileTab('editor')}>💻 Editor</button>
      </div>

      {/* ── Body: Problem | Editor ── */}
      <div className="pe-body">
        {/* Left — Problem */}
        <div className={`pe-left${mobileTab === 'editor' ? ' pe-mobile-hidden' : ''}`}>
          <ProblemPanel problem={problem} />
        </div>

        {/* Right — Editor + Results */}
        <div className={`pe-right${mobileTab === 'problem' ? ' pe-mobile-hidden' : ''}`}>
          {/* Toolbar */}
          <div className="pe-editor-toolbar">
            <select
              className="pe-lang-select"
              value={langId}
              onChange={e => handleLangChange(e.target.value)}
              disabled={isRunning}
            >
              {SUPPORTED_LANGS.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                className="pe-run-btn"
                onClick={handleRun}
                disabled={isRunning}
              >
                {running ? <><span className="ce-spinner" /> Running...</> : '▶ Run'}
              </button>
              <button
                className="pe-submit-btn"
                onClick={handleSubmit}
                disabled={isRunning}
              >
                {submitting ? <><span className="ce-spinner" /> Submitting...</> : '⚡ Submit'}
              </button>
            </div>
          </div>

          {/* Code editor */}
          <textarea
            ref={textareaRef}
            className="pe-code-area"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            disabled={isRunning}
          />

          {/* Test case / Custom input tabs */}
          <div className="pe-tc-toolbar">
            <button className={`pe-tc-tab${tcTab === 'sample' ? ' active' : ''}`} onClick={() => setTcTab('sample')}>
              Sample Cases
            </button>
            <button className={`pe-tc-tab${tcTab === 'custom' ? ' active' : ''}`} onClick={() => setTcTab('custom')}>
              Custom Input
            </button>
          </div>

          {tcTab === 'custom' ? (
            <div className="pe-custom-input">
              <textarea
                className="pe-custom-area"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Enter custom input here..."
                disabled={isRunning}
              />
              {customOutput && (
                <div className="pe-custom-output">
                  <div className="pe-io-label">Output</div>
                  {customOutput.status === 'running' ? (
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>Running...</div>
                  ) : customOutput.error ? (
                    <pre className="pe-io-pre pe-io-wrong">{customOutput.error}</pre>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <span className="pe-chip"
                          style={{ background: (STATUS_BG[customOutput.status?.description] || '#64748b') + '22',
                                   color: STATUS_BG[customOutput.status?.description] || '#64748b' }}>
                          {customOutput.status?.description}
                        </span>
                        {customOutput.time && <span style={{ fontSize: 11, color: '#94a3b8' }}>⏱ {customOutput.time}s</span>}
                      </div>
                      {customOutput.stdout && <pre className="pe-io-pre">{customOutput.stdout}</pre>}
                      {(customOutput.stderr || customOutput.compile_output) && (
                        <pre className="pe-io-pre pe-io-wrong">{customOutput.stderr || customOutput.compile_output}</pre>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="pe-sample-preview">
              {problem.examples.map((ex, i) => (
                <div key={i} className="pe-sample-case">
                  <div className="pe-tc-label">Sample {i + 1}</div>
                  <div className="pe-io-row">
                    <div className="pe-io-col">
                      <div className="pe-io-label">Input</div>
                      <pre className="pe-io-pre">{ex.input}</pre>
                    </div>
                    <div className="pe-io-col">
                      <div className="pe-io-label">Expected</div>
                      <pre className="pe-io-pre">{ex.output}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results after submit */}
          {runMode === 'submit' && (
            <ResultsPanel results={results} problem={problem} running={submitting} />
          )}

          {/* Already solved banner */}
          {isSolved && (
            <div className="pe-solved-banner">✅ Problem solved! +10 pts earned.</div>
          )}
        </div>
      </div>
    </div>
  )
}