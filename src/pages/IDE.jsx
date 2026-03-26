import { useState, useRef, useEffect } from 'react'
import { LANGUAGES, runCode } from '../services/judge0'

const STORAGE_KEY = 'nextpath_ide_code'

const STATUS_COLOR = {
  'Accepted':            '#10b981',
  'Wrong Answer':        '#ef4444',
  'Time Limit Exceeded': '#f59e0b',
  'Runtime Error':       '#ef4444',
  'Compilation Error':   '#ef4444',
}

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
function save(langId, code) {
  try {
    const all = loadSaved()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [langId]: code }))
  } catch {}
}

export default function IDE() {
  const [langId, setLangId]       = useState(LANGUAGES[0].id)
  const [code, setCode]           = useState(() => loadSaved()[LANGUAGES[0].id] ?? LANGUAGES[0].template)
  const [stdin, setStdin]         = useState('')
  const [showStdin, setShowStdin] = useState(false)
  const [running, setRunning]     = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const [result, setResult]       = useState(null)
  const textareaRef               = useRef(null)

  const currentLang = LANGUAGES.find(l => l.id === langId)

  // Auto-save code per language
  useEffect(() => { save(langId, code) }, [langId, code])

  const handleLangChange = (id) => {
    const lang = LANGUAGES.find(l => l.id === Number(id))
    setLangId(lang.id)
    const saved = loadSaved()[lang.id]
    setCode(saved ?? lang.template)
    setResult(null)
    setStatusMsg(null)
  }

  const handleRun = async () => {
    if (!code.trim()) return
    setRunning(true)
    setResult(null)
    setStatusMsg('Submitting...')
    try {
      const res = await runCode(code, langId, stdin, setStatusMsg)
      setResult(res)
      setStatusMsg(null)
    } catch (err) {
      setResult(null)
      setStatusMsg('Error: ' + err.message)
    } finally {
      setRunning(false)
    }
  }

  const handleReset = () => {
    setCode(currentLang.template)
    setResult(null)
    setStatusMsg(null)
    save(langId, currentLang.template)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el    = textareaRef.current
      const start = el.selectionStart
      const end   = el.selectionEnd
      const next  = code.substring(0, start) + '    ' + code.substring(end)
      setCode(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4 })
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!running) handleRun()
    }
  }

  const statusLabel = result?.status?.description
  const statusColor = STATUS_COLOR[statusLabel] || '#64748b'
  const outputText  = result?.stdout || ''
  const errorText   = result?.stderr || result?.compile_output || ''

  return (
    <div className="ide-page">
      {/* ── Header ── */}
      <div className="ide-header">
        <div className="ide-header-left">
          <span className="ide-title">🖥️ Code IDE</span>
          <span className="ide-subtitle">Write &amp; run code in your browser</span>
        </div>
        <div className="ide-header-right">
          <select
            className="ide-lang-select"
            value={langId}
            onChange={e => handleLangChange(e.target.value)}
            disabled={running}
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <button
            className="ide-stdin-btn"
            onClick={() => setShowStdin(v => !v)}
            type="button"
          >
            {showStdin ? '▼' : '▶'} stdin
          </button>

          <button className="ide-reset-btn" onClick={handleReset} disabled={running} type="button">
            ↺ Reset
          </button>

          <button
            className="ide-run-btn"
            onClick={handleRun}
            disabled={running}
            type="button"
          >
            {running
              ? <><span className="ce-spinner" /> Running...</>
              : <>▶ Run  <kbd>Ctrl+↵</kbd></>
            }
          </button>
        </div>
      </div>

      {/* ── stdin (collapsible) ── */}
      {showStdin && (
        <div className="ide-stdin-bar">
          <span className="ide-stdin-label">Standard Input (stdin)</span>
          <textarea
            className="ide-stdin-area"
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            placeholder="Enter program input here..."
            rows={3}
            disabled={running}
          />
        </div>
      )}

      {/* ── Editor + Output split ── */}
      <div className="ide-body">
        {/* Editor panel */}
        <div className="ide-editor-panel">
          <div className="ide-panel-label">
            {currentLang?.name} &nbsp;·&nbsp; {code.split('\n').length} lines
            <span className="ide-autosave">● auto-saved</span>
          </div>
          <textarea
            ref={textareaRef}
            className="ide-editor"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            disabled={running}
            placeholder="Start coding..."
          />
        </div>

        {/* Output panel */}
        <div className="ide-output-panel">
          <div className="ide-panel-label">Output</div>
          <div className="ide-output-body">
            {/* idle state */}
            {!running && !result && !statusMsg && (
              <div className="ide-output-idle">
                <span style={{ fontSize: 32 }}>▶</span>
                <p>Click <strong>Run</strong> to execute your code</p>
                <p style={{ fontSize: 12, opacity: .6 }}>Powered by Judge0 CE</p>
              </div>
            )}

            {/* status while running */}
            {(running || (statusMsg && !result)) && (
              <div className="ide-output-idle">
                <span className="ce-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <p style={{ marginTop: 12 }}>{statusMsg || 'Running...'}</p>
              </div>
            )}

            {/* result */}
            {result && (
              <>
                <div className="ide-result-header">
                  <span
                    className="ce-status-badge"
                    style={{
                      background: statusColor + '22',
                      color: statusColor,
                      borderColor: statusColor + '55',
                    }}
                  >
                    {statusLabel}
                  </span>
                  {result.time   && <span className="ce-meta">⏱ {result.time}s</span>}
                  {result.memory && <span className="ce-meta">💾 {result.memory} KB</span>}
                </div>

                {outputText ? (
                  <div className="ide-result-section">
                    <div className="ide-result-label">stdout</div>
                    <pre className="ide-pre">{outputText}</pre>
                  </div>
                ) : !errorText ? (
                  <div className="ide-result-section">
                    <pre className="ide-pre" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      (no output)
                    </pre>
                  </div>
                ) : null}

                {errorText && (
                  <div className="ide-result-section">
                    <div className="ide-result-label" style={{ color: '#f87171' }}>
                      {result.compile_output ? 'compile error' : 'stderr'}
                    </div>
                    <pre className="ide-pre ide-pre-error">{errorText}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}