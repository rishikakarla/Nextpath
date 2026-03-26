import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'

function getResult(score, total) {
  const pct = (score / total) * 100
  if (pct >= 80) return { level: 'Advanced', track: 'Fast Track', weakArea: 'Dynamic Programming', color: '#10b981' }
  if (pct >= 60) return { level: 'Intermediate', track: 'Standard Track', weakArea: 'Trees & Graphs', color: '#6366f1' }
  if (pct >= 40) return { level: 'Beginner+', track: 'Foundation+', weakArea: 'Problem Solving', color: '#f59e0b' }
  return { level: 'Beginner', track: 'Foundation', weakArea: 'Programming Basics', color: '#ef4444' }
}

export default function Assessment() {
  const { saveAssessment } = useApp()
  const { assessmentQuestions } = useContent()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  const q = assessmentQuestions[current]
  const total = assessmentQuestions.length

  const choose = (idx) => {
    if (revealed) return
    setSelected(idx)
  }

  const confirm = () => {
    if (selected === null) return
    setAnswers(a => ({ ...a, [q.id]: selected }))
    setRevealed(true)
  }

  const next = () => {
    if (current + 1 >= total) {
      const score = Object.entries({ ...answers, [q.id]: selected })
        .filter(([id, ans]) => {
          const question = assessmentQuestions.find(qq => qq.id === parseInt(id))
          return question && question.answer === ans
        }).length
      const r = { score, total, ...getResult(score, total), date: new Date().toISOString() }
      setResult(r)
      saveAssessment(r)
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const goToDashboard = () => navigate('/dashboard')

  const progress = ((current) / total) * 100

  if (done && result) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-result">
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎯</div>
            <div className="result-score">{result.score}/{result.total}</div>
            <div className="result-label">Questions Correct</div>

            <div className="result-details">
              <div className="result-detail-item">
                <div className="label">Level</div>
                <div className="value" style={{ color: result.color }}>{result.level}</div>
              </div>
              <div className="result-detail-item">
                <div className="label">Recommended Track</div>
                <div className="value">{result.track}</div>
              </div>
              <div className="result-detail-item">
                <div className="label">Focus Area</div>
                <div className="value">{result.weakArea}</div>
              </div>
            </div>

            <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: 20 }}>
              <strong>Your roadmap has been personalized!</strong> Based on your results, we recommend
              starting with the <strong>{result.track}</strong> learning path. Focus on improving
              your <strong>{result.weakArea}</strong> skills.
            </div>

            <button className="btn btn-primary btn-lg" onClick={goToDashboard}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="assessment-page">
      <div className="assessment-container">
        <div className="assessment-header">
          <h2>Skill Assessment Test</h2>
          <p>This helps us personalize your learning roadmap</p>
          <div className="progress-bar-wrap" style={{ marginTop: 16 }}>
            <div className="progress-bar-fill indigo" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="quiz-card">
          <div className="quiz-meta">
            <span className="quiz-counter">Question {current + 1} of {total}</span>
            <span className="quiz-category">{q.category}</span>
          </div>

          <div className="quiz-question">{q.question}</div>

          <div className="quiz-options">
            {q.options.map((opt, i) => {
              let cls = 'quiz-option'
              if (revealed) {
                if (i === q.answer) cls += ' correct'
                else if (i === selected && i !== q.answer) cls += ' wrong'
              } else if (i === selected) {
                cls += ' selected'
              }
              return (
                <button key={i} className={cls} onClick={() => choose(i)}>
                  <span style={{ fontWeight: 600, marginRight: 8, color: 'var(--text-muted)' }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>

          <div className="quiz-actions">
            {!revealed ? (
              <button className="btn btn-primary" onClick={confirm} disabled={selected === null}>
                Confirm Answer
              </button>
            ) : (
              <button className="btn btn-primary" onClick={next}>
                {current + 1 >= total ? 'See Results →' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
