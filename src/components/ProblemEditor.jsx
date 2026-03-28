import { useState, useRef } from 'react'
import { LANGUAGES, submitCode, getResult } from '../services/judge0'

// ── helpers ───────────────────────────────────────────────────────────────────
function normalize(s) {
  return (s || '').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}
function passed(actual, expected) {
  return normalize(actual) === normalize(expected)
}


const SUPPORTED_LANGS = LANGUAGES

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
function ProblemPanel({ problem, onHintUsed }) {
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

      {/* Sample Test Cases — all visible test cases shown on left */}
      {(() => {
        const visibleTc = (problem.testCases || []).filter(tc => !tc.hidden)
        const examples  = problem.examples || []
        // Merge: show examples (with explanation) + any visible test cases not already shown
        const items = examples.length > 0 ? examples.map((ex, i) => ({
          input: ex.input, output: ex.output, explanation: ex.explanation, label: `Sample ${i + 1}`,
        })) : visibleTc.map((tc, i) => ({
          input: tc.input, output: tc.expectedOutput, label: `Sample ${i + 1}`,
        }))
        if (items.length === 0) return null
        return (
          <>
            <div className="pe-section-label">Sample Test Cases</div>
            <div className="pe-example-tabs">
              {items.map((_, i) => (
                <button key={i} className={`pe-example-tab${activeEx === i ? ' active' : ''}`} onClick={() => setActiveEx(i)}>
                  Sample {i + 1}
                </button>
              ))}
            </div>
            {items[activeEx] && (
              <div className="pe-example-box">
                <div className="pe-io-row">
                  <div className="pe-io-col">
                    <div className="pe-io-label">Input</div>
                    <pre className="pe-io-pre">{items[activeEx].input}</pre>
                  </div>
                  <div className="pe-io-col">
                    <div className="pe-io-label">Output</div>
                    <pre className="pe-io-pre">{items[activeEx].output}</pre>
                  </div>
                </div>
                {items[activeEx].explanation && (
                  <div className="pe-explanation"><strong>Explanation:</strong> {items[activeEx].explanation}</div>
                )}
              </div>
            )}
          </>
        )
      })()}

      {/* Hint */}
      {problem.hint && (
        <details className="pe-hint" onToggle={e => { if (e.target.open && onHintUsed) onHintUsed() }}>
          <summary>💡 Hint <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginLeft: 6 }}>(-1 pt)</span></summary>
          <p>{problem.hint}</p>
        </details>
      )}
    </div>
  )
}

// ── Results Panel ─────────────────────────────────────────────────────────────
function ResultsPanel({ results, testCases, running }) {
  if (!results && !running) return null

  testCases = testCases || []
  const isStillRunning = results?.some(r => r.verdict === 'running')
  const allPassed      = results && !isStillRunning && results.every(r => r.verdict === 'pass')
  const passCount      = results?.filter(r => r.verdict === 'pass').length ?? 0
  const totalCount     = results?.length ?? 0

  return (
    <div className="pe-results">
      {/* Summary bar */}
      {results && (
        <div className={`pe-result-summary ${isStillRunning ? '' : allPassed ? 'pass' : 'fail'}`}>
          <span className="pe-result-icon">
            {isStillRunning ? '⏳' : allPassed ? '✅' : '❌'}
          </span>
          <span className="pe-result-text">
            {isStillRunning
              ? `Running… ${passCount} / ${totalCount} done`
              : allPassed
                ? 'All test cases passed!'
                : `${passCount} / ${totalCount} test cases passed`}
          </span>
          <span className="pe-result-score">
            {!isStillRunning && results[0]?.time && `⏱ ${results[0].time}s`}
          </span>
        </div>
      )}

      {/* Sample test cases (visible) */}
      <div className="pe-tc-section-label">Sample Test Cases</div>
      {testCases
        .map((tc, i) => ({ tc, i }))
        .filter(({ tc }) => !tc.hidden)
        .map(({ tc, i }) => {
          const r = results?.[i]
          const rowVerdict = r?.verdict === 'running' ? '' : r?.verdict === 'pass' ? 'pass' : r ? 'fail' : ''
          return (
            <div key={i} className={`pe-tc-row ${rowVerdict}`}>
              <div className="pe-tc-header">
                <span className="pe-tc-label">Test Case {i + 1}</span>
                <VerdictChip verdict={r?.verdict} />
              </div>
              {r && r.verdict !== 'running' && (
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
                    <div className="pe-io-label" style={{ color: r.verdict === 'pass' ? '#10b981' : '#ef4444' }}>
                      Your Output
                    </div>
                    <pre className={`pe-io-pre${r.verdict !== 'pass' ? ' pe-io-wrong' : ''}`}>
                      {r.stdout || r.stderr || r.compile_output || '(no output)'}
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
          {testCases
            .map((tc, i) => ({ tc, i }))
            .filter(({ tc }) => tc.hidden)
            .map(({ i }, idx) => {
              const r = results?.[i]
              const rowVerdict = r?.verdict === 'running' ? '' : r?.verdict === 'pass' ? 'pass' : r ? 'fail' : ''
              return (
                <div key={i} className={`pe-tc-row ${rowVerdict}`}>
                  <div className="pe-tc-header">
                    <span className="pe-tc-label">Hidden Test {idx + 1}</span>
                    <VerdictChip verdict={r?.verdict} />
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

// ── helpers ───────────────────────────────────────────────────────────────────
function getSamples(problem) {
  const examples = (problem.examples || []).filter(e => e.input?.trim())
  if (examples.length > 0)
    return examples.map(ex => ({ input: ex.input, expectedOutput: ex.output }))
  return (problem.testCases || [])
    .filter(tc => !tc.hidden && tc.input?.trim())
    .map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
}

// Returns the canonical test case list for submission:
// uses testCases (non-empty) falling back to examples when testCases are blank
function getSubmitTcs(problem) {
  const tcs = (problem.testCases || []).filter(tc => tc.input?.trim())
  if (tcs.length > 0) return tcs
  return (problem.examples || [])
    .filter(e => e.input?.trim())
    .map(e => ({ input: e.input, expectedOutput: e.output, hidden: false }))
}

// ── Submissions Panel ─────────────────────────────────────────────────────────
function SubmissionsPanel({ submissions, onLoadCode }) {
  const [expanded, setExpanded] = useState(null)

  if (!submissions || submissions.length === 0) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#475569', fontSize: 13, fontStyle: 'italic' }}>
        No submissions yet. Click ⚡ Submit to run against all test cases.
      </div>
    )
  }
  return (
    <div className="pe-subs-list">
      {submissions.map((s, i) => {
        const isAC = s.passed === s.total
        const isPartial = s.passed > 0 && s.passed < s.total
        const color = isAC ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444'
        const label = isAC ? 'Accepted' : isPartial ? 'Partial' : 'Wrong Answer'
        const isOpen = expanded === i
        return (
          <div key={i} className="pe-sub-row-wrap">
            <div
              className="pe-sub-row"
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{ cursor: 'pointer' }}
            >
              <div className="pe-sub-verdict" style={{ color, borderLeftColor: color }}>
                {isAC ? '✓' : '✗'} {label}
              </div>
              <div className="pe-sub-meta">
                <span className="pe-sub-score">{s.passed}/{s.total} test cases</span>
                <span className="pe-sub-lang">{s.langName}</span>
                <span className="pe-sub-time">{new Date(s.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="pe-sub-chevron">{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
              <div className="pe-sub-code-panel">
                <div className="pe-sub-code-header">
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{s.langName}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="pe-sub-action-btn"
                      onClick={() => navigator.clipboard?.writeText(s.code)}
                    >
                      Copy
                    </button>
                    <button
                      className="pe-sub-action-btn"
                      style={{ color: '#6366f1', borderColor: '#6366f155' }}
                      onClick={() => onLoadCode && onLoadCode(s.code, s.langId)}
                    >
                      Load into Editor
                    </button>
                  </div>
                </div>
                <pre className="pe-sub-code-pre">{s.code}</pre>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ProblemEditor ────────────────────────────────────────────────────────
export default function ProblemEditor({ problem, onSolve, isSolved, onHintUsed, onSubmit, submissions, solvedMessage }) {
  const [langId, setLangId]             = useState(71)
  const [code, setCode]                 = useState(() => problem.starterCode?.[71] || LANGUAGES.find(l => l.id === 71)?.template || '')
  const [customInput, setCustomInput]   = useState('')
  const [sampleResults, setSampleResults] = useState(null)   // run results for sample cases
  const [customResult, setCustomResult] = useState(null)     // run result for custom input
  const [activeCase, setActiveCase]     = useState(0)        // selected tab in Console (0..n-1 = samples, -1 = custom)
  const [running, setRunning]           = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [results, setResults]           = useState(null)
  const [submittedTcs, setSubmittedTcs] = useState([])
  const [bottomTab, setBottomTab]       = useState('console')
  const textareaRef                     = useRef(null)

  const handleLangChange = (id) => {
    const numId = Number(id)
    setLangId(numId)
    setCode(problem.starterCode?.[numId] || LANGUAGES.find(l => l.id === numId)?.template || '')
    setResults(null)
    setSampleResults(null)
    setCustomResult(null)
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

  // Run against sample cases (+ custom input if filled)
  const handleRun = async () => {
    if (!code.trim()) return
    setRunning(true)
    setBottomTab('console')

    const samples = getSamples(problem)
    const hasCustom = customInput.trim() !== ''

    // initialise placeholders
    setSampleResults(samples.map(() => ({ verdict: 'running' })))
    if (hasCustom) setCustomResult({ status: 'running' })
    setActiveCase(0)

    // run sample cases sequentially
    const newSampleResults = []
    for (let i = 0; i < samples.length; i++) {
      const { input, expectedOutput } = samples[i]
      try {
        const res = await runTestCase(code, langId, input)
        const verdict = passed(normalize(res.stdout || ''), expectedOutput) ? 'pass' : 'fail'
        newSampleResults.push({ ...res, verdict, input, expectedOutput })
      } catch (e) {
        newSampleResults.push({ verdict: 'fail', stderr: e.message, input, expectedOutput })
      }
      setSampleResults([...newSampleResults, ...samples.slice(i + 1).map(() => ({ verdict: 'running' }))])
    }
    setSampleResults(newSampleResults)

    // run custom input if provided
    if (hasCustom) {
      try {
        const res = await runTestCase(code, langId, customInput)
        setCustomResult(res)
      } catch (e) {
        setCustomResult({ error: e.message })
      }
    }

    setRunning(false)
  }

  // Submit against ALL test cases (falls back to examples if testCases is empty)
  const handleSubmit = async () => {
    if (!code.trim()) return
    const tcs = getSubmitTcs(problem)
    if (tcs.length === 0) return
    setSubmittedTcs(tcs)
    setSubmitting(true)
    setBottomTab('results')
    setResults(tcs.map(() => ({ verdict: 'running' })))

    const newResults = []
    for (let i = 0; i < tcs.length; i++) {
      const tc = tcs[i]
      try {
        const res = await runTestCase(code, langId, tc.input)
        const stdout = normalize(res.stdout || '')
        const verdict = passed(stdout, tc.expectedOutput) ? 'pass' : 'fail'
        newResults.push({ ...res, verdict })
      } catch (e) {
        newResults.push({ verdict: 'fail', stderr: e.message })
      }
      setResults([...newResults, ...tcs.slice(i + 1).map(() => ({ verdict: 'running' }))])
    }

    setResults(newResults)
    setSubmitting(false)

    const passCount = newResults.filter(r => r.verdict === 'pass').length
    const langName = SUPPORTED_LANGS.find(l => l.id === langId)?.name || 'Unknown'
    if (onSubmit) {
      onSubmit({ passed: passCount, total: newResults.length, langId, langName, code, submittedAt: new Date().toISOString() })
    }
    if (onSolve && !isSolved) {
      onSolve({ passed: passCount, total: newResults.length })
    }
  }

  const isRunning = running || submitting

  return (
    <div className="pe-root">
      {/* ── Body: Problem | Editor ── always side-by-side ── */}
      <div className="pe-body">
        {/* Left — Problem */}
        <div className="pe-left">
          <ProblemPanel problem={problem} onHintUsed={onHintUsed} />
        </div>

        {/* Right — Editor + Results */}
        <div className="pe-right">
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

          {/* Bottom panel — Console / Test Results tabs */}
          {(() => {
            const samples = getSamples(problem)
            const hasCustom = customInput.trim() !== ''
            // Active case: 0..samples.length-1 = sample cases, -1 = custom input
            const safeActive = activeCase === -1 ? -1 : Math.min(activeCase, samples.length - 1)
            const sr = sampleResults?.[safeActive]
            return (
              <div className="pe-bottom-panel">
                {/* ── Outer tab bar: Console / Test Results ── */}
                <div className="pe-bottom-tabs">
                  <button className={`pe-bottom-tab${bottomTab === 'console' ? ' active' : ''}`} onClick={() => setBottomTab('console')}>
                    Console
                  </button>
                  <button className={`pe-bottom-tab${bottomTab === 'results' ? ' active' : ''}`} onClick={() => setBottomTab('results')}>
                    Test Results
                    {results && (
                      <span className={`pe-tab-badge ${results.every(r => r.verdict === 'pass') ? 'pass' : 'fail'}`}>
                        {results.filter(r => r.verdict === 'pass').length}/{results.length}
                      </span>
                    )}
                  </button>
                  <button className={`pe-bottom-tab${bottomTab === 'submissions' ? ' active' : ''}`} onClick={() => setBottomTab('submissions')}>
                    Submissions
                    {submissions?.length > 0 && (
                      <span className="pe-tab-badge" style={{ background: '#334155', color: '#94a3b8' }}>{submissions.length}</span>
                    )}
                  </button>
                  <span className="pe-bottom-hint">▶ Run checks sample cases · ⚡ Submit checks all test cases</span>
                </div>

                {/* ── Console tab ── */}
                {bottomTab === 'console' && (
                  <div className="pe-console-body">
                    {/* Case selector tabs */}
                    <div className="pe-case-tabs">
                      {samples.map((_, i) => {
                        const r = sampleResults?.[i]
                        return (
                          <button
                            key={i}
                            className={`pe-case-tab${safeActive === i ? ' active' : ''} ${r ? (r.verdict === 'pass' ? 'pass' : r.verdict === 'running' ? '' : 'fail') : ''}`}
                            onClick={() => setActiveCase(i)}
                          >
                            {r?.verdict === 'running'
                              ? <span className="ce-spinner" style={{ width: 8, height: 8, borderWidth: 1.5 }} />
                              : r?.verdict === 'pass' ? '✓' : r?.verdict === 'fail' ? '✗' : null
                            }
                            Case {i + 1}
                          </button>
                        )
                      })}
                      {(hasCustom || sampleResults) && (
                        <button
                          className={`pe-case-tab${safeActive === -1 ? ' active' : ''}`}
                          onClick={() => setActiveCase(-1)}
                        >
                          Custom
                        </button>
                      )}
                      <textarea
                        className="pe-custom-inline"
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder="Custom input (optional)"
                        disabled={isRunning}
                        rows={1}
                      />
                    </div>

                    {/* Case detail */}
                    {safeActive >= 0 && samples[safeActive] && (
                      <div className="pe-case-detail">
                        <div className="pe-case-io-grid">
                          <div className="pe-case-io-col">
                            <div className="pe-run-io-colhead">Input</div>
                            <pre className="pe-case-pre">{samples[safeActive].input}</pre>
                          </div>
                          <div className="pe-case-io-col">
                            <div className="pe-run-io-colhead">Expected Output</div>
                            <pre className="pe-case-pre">{samples[safeActive].expectedOutput}</pre>
                          </div>
                          <div className="pe-case-io-col">
                            <div className="pe-run-io-colhead" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              Your Output
                              {sr && sr.verdict !== 'running' && (
                                <VerdictChip verdict={sr.verdict} />
                              )}
                            </div>
                            <div className="pe-case-pre" style={{ color: !sr ? '#2a3a55' : sr.verdict === 'pass' ? '#86efac' : '#f87171' }}>
                              {!sr || !sampleResults ? (
                                <span style={{ fontStyle: 'italic', color: '#2a3a55' }}>click ▶ Run</span>
                              ) : sr.verdict === 'running' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                                  <span className="ce-spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Running…
                                </span>
                              ) : (
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12.5, color: 'inherit' }}>
                                  {sr.stdout || sr.stderr || sr.compile_output || '(no output)'}
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom input detail */}
                    {safeActive === -1 && (
                      <div className="pe-case-detail">
                        <div className="pe-case-io-grid">
                          <div className="pe-case-io-col" style={{ gridColumn: '1 / 2' }}>
                            <div className="pe-run-io-colhead">Custom Input</div>
                            <pre className="pe-case-pre" style={{ color: '#94a3b8' }}>{customInput || '(empty)'}</pre>
                          </div>
                          <div className="pe-case-io-col" style={{ gridColumn: '2 / 4' }}>
                            <div className="pe-run-io-colhead">Output</div>
                            <div className="pe-case-pre">
                              {!customResult ? (
                                <span style={{ fontStyle: 'italic', color: '#2a3a55' }}>click ▶ Run with custom input filled</span>
                              ) : customResult.status === 'running' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                                  <span className="ce-spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Running…
                                </span>
                              ) : customResult.error ? (
                                <pre style={{ color: '#f87171', margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{customResult.error}</pre>
                              ) : (
                                <pre style={{ color: '#86efac', margin: 0, whiteSpace: 'pre-wrap', fontSize: 12.5 }}>
                                  {customResult.stdout || customResult.stderr || customResult.compile_output || '(no output)'}
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Placeholder before first run */}
                    {!sampleResults && safeActive >= 0 && (
                      <div style={{ padding: '6px 14px 10px', color: '#2a3a55', fontSize: 12, fontStyle: 'italic' }}>
                        Press ▶ Run to test against sample cases
                      </div>
                    )}
                  </div>
                )}

                {/* ── Test Results tab ── */}
                {bottomTab === 'results' && (
                  <div className="pe-bottom-content">
                    {results || submitting
                      ? <ResultsPanel results={results} testCases={submittedTcs} running={submitting} />
                      : <div style={{ padding: '20px 16px', color: '#2a3a55', fontSize: 13, fontStyle: 'italic' }}>
                          Click ⚡ Submit to run against all test cases
                        </div>
                    }
                  </div>
                )}

                {/* ── Submissions tab ── */}
                {bottomTab === 'submissions' && (
                  <div className="pe-bottom-content">
                    <SubmissionsPanel
                      submissions={submissions}
                      onLoadCode={(loadedCode, loadedLangId) => {
                        setCode(loadedCode)
                        setLangId(loadedLangId)
                        setResults(null)
                        setSampleResults(null)
                        setCustomResult(null)
                        setBottomTab('console')
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })()}

          {/* Already solved banner */}
          {isSolved && (
            <div className="pe-solved-banner">
              {solvedMessage || '✅ Problem solved! +10 pts earned.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}