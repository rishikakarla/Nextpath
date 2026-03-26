import { useState, useRef } from 'react'
import { LANGUAGES, runCode } from '../services/judge0'

const STATUS_COLOR = {
  'Accepted':           '#10b981',
  'Wrong Answer':       '#ef4444',
  'Time Limit Exceeded':'#f59e0b',
  'Runtime Error':      '#ef4444',
  'Compilation Error':  '#ef4444',
}

export default function CodeEditor({ onSuccess }) {
  const [langId, setLangId]     = useState(LANGUAGES[0].id)
  const [code, setCode]         = useState(LANGUAGES[0].template)
  const [stdin, setStdin]       = useState('')
  const [showStdin, setShowStdin] = useState(false)
  const [running, setRunning]   = useState(false)
  const [status, setStatus]     = useState(null) // { label, color, output, error, time, memory }
  const textareaRef             = useRef(null)

  const currentLang = LANGUAGES.find(l => l.id === langId)

  const handleLangChange = (id) => {
    const lang = LANGUAGES.find(l => l.id === Number(id))
    setLangId(lang.id)
    setCode(lang.template)
    setStatus(null)
  }

  const handleRun = async () => {
    if (!code.trim()) return
    setRunning(true)
    setStatus({ label: 'Submitting...', color: '#6366f1', output: null, error: null })
    try {
      const result = await runCode(code, langId, stdin, (msg) => {
        setStatus({ label: msg, color: '#6366f1', output: null, error: null })
      })

      const label    = result.status?.description || 'Unknown'
      const color    = STATUS_COLOR[label] || '#64748b'
      const output   = result.stdout   || ''
      const error    = result.stderr || result.compile_output || ''
      const time     = result.time     ? `${result.time}s`   : null
      const memory   = result.memory   ? `${result.memory} KB` : null

      setStatus({ label, color, output, error, time, memory })

      if (label === 'Accepted' && onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setStatus({ label: 'Error', color: '#ef4444', output: null, error: err.message })
    } finally {
      setRunning(false)
    }
  }

  // Handle tab key in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el   = textareaRef.current
      const start = el.selectionStart
      const end   = el.selectionEnd
      const newCode = code.substring(0, start) + '    ' + code.substring(end)
      setCode(newCode)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4
      })
    }
  }

  return (
    <div className="ce-root">
      {/* Toolbar */}
      <div className="ce-toolbar">
        <select
          className="ce-lang-select"
          value={langId}
          onChange={e => handleLangChange(e.target.value)}
          disabled={running}
        >
          {LANGUAGES.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <button
          className="ce-stdin-toggle"
          onClick={() => setShowStdin(v => !v)}
          type="button"
        >
          {showStdin ? '▼' : '▶'} stdin
        </button>

        <button
          className="btn btn-primary ce-run-btn"
          onClick={handleRun}
          disabled={running}
          type="button"
        >
          {running ? (
            <><span className="ce-spinner" /> Running...</>
          ) : (
            <>▶ Run Code</>
          )}
        </button>
      </div>

      {/* Optional stdin */}
      {showStdin && (
        <div className="ce-stdin-wrap">
          <div className="ce-label">Standard Input (stdin)</div>
          <textarea
            className="ce-stdin"
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            placeholder="Enter input for your program..."
            rows={3}
            disabled={running}
          />
        </div>
      )}

      {/* Code area */}
      <textarea
        ref={textareaRef}
        className="ce-code"
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        disabled={running}
        placeholder={`Write your ${currentLang?.name} solution here...`}
      />

      {/* Output panel */}
      {status && (
        <div className="ce-output">
          <div className="ce-output-header">
            <span className="ce-status-badge" style={{ background: status.color + '22', color: status.color, borderColor: status.color + '44' }}>
              {status.label}
            </span>
            {status.time && <span className="ce-meta">⏱ {status.time}</span>}
            {status.memory && <span className="ce-meta">💾 {status.memory}</span>}
          </div>

          {status.output && (
            <div className="ce-output-section">
              <div className="ce-label">Output</div>
              <pre className="ce-pre">{status.output}</pre>
            </div>
          )}

          {status.error && (
            <div className="ce-output-section">
              <div className="ce-label" style={{ color: '#ef4444' }}>Error</div>
              <pre className="ce-pre ce-pre-error">{status.error}</pre>
            </div>
          )}

          {!status.output && !status.error && status.label === 'Accepted' && (
            <div className="ce-output-section">
              <pre className="ce-pre" style={{ color: '#10b981' }}>Program executed successfully (no output).</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}