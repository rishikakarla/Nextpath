import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'

function ReadingProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? Math.round((scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 1000, background: 'var(--border)' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#2f8d46,#10b981)', transition: 'width 0.1s' }} />
    </div>
  )
}

function TableOfContents({ sections, activeId }) {
  const items = [
    { id: 'intro', label: 'Introduction' },
    ...sections.map((s, i) => ({ id: `section-${i}`, label: s.heading })),
    { id: 'complexity', label: 'Complexity Analysis' },
    { id: 'keypoints', label: 'Key Points' },
    { id: 'resources', label: 'Learning Resources' },
    { id: 'quiz', label: 'Practice Quiz' },
  ]
  return (
    <div className="tp-toc">
      <div className="tp-toc-title">On This Page</div>
      {items.map(item => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`tp-toc-link${activeId === item.id ? ' active' : ''}`}
          onClick={e => {
            e.preventDefault()
            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}

function AttemptsTable({ attempts }) {
  const best = Math.max(...attempts.map(a => a.score))
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Your Attempts · Best: <span style={{ color: best >= 80 ? 'var(--success)' : '#ef4444' }}>{best}%</span>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '7px 12px', background: 'var(--bg)', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Date</span><span>Score</span><span>Correct</span><span>Result</span>
        </div>
        {[...attempts].reverse().map((a, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 12px', fontSize: 13, borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--card)' : 'transparent' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span style={{ fontWeight: 700, color: a.score >= 80 ? 'var(--success)' : '#ef4444' }}>{a.score}%</span>
            <span>{a.correct}/{a.total}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: a.score >= 80 ? 'var(--success)' : '#ef4444' }}>{a.score >= 80 ? '✓ Pass' : '✗ Fail'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TopicPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { progress, toggleTopic, quizAttempts, saveQuizAttempt, assessmentResult } = useApp()
  const { roadmapPhases: roadmapByLevel } = useContent()

  const LEVEL_MAP = { 'Beginner': 'beginner', 'Beginner+': 'beginnerPlus', 'Intermediate': 'intermediate', 'Advanced': 'advanced' }
  const levelKey = assessmentResult?.level ? (LEVEL_MAP[assessmentResult.level] || 'beginner') : null
  const roadmapPhases = levelKey ? (roadmapByLevel[levelKey] || []) : Object.values(roadmapByLevel).flat()

  const TOTAL_TOPICS = roadmapPhases.reduce((a, p) => a + p.topics.length, 0)

  // Find topic + phase
  let topic = null
  let phaseName = ''
  let phaseIdx = -1
  for (const [pi, phase] of roadmapPhases.entries()) {
    const found = phase.topics.find(t => t.id === topicId)
    if (found) { topic = found; phaseName = phase.title; phaseIdx = pi; break }
  }

  const isDone = progress.completedTopics?.includes(topicId)
  const quiz = topic?.quiz || []
  const concepts = topic?.concepts || []
  const keyPoints = topic?.keyPoints || []
  const prevAttempts = quizAttempts[topicId] || []

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizScore, setQuizScore] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Active TOC section
  const [activeId, setActiveId] = useState('intro')
  const contentRef = useRef(null)

  useEffect(() => {
    const sections = ['intro', ...concepts.map((_, i) => `section-${i}`), 'complexity', 'keypoints', 'resources', 'quiz']
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) { setActiveId(e.target.id); break }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [concepts.length])

  const submitQuiz = () => {
    if (quiz.length === 0) {
      if (!isDone) toggleTopic(topicId, TOTAL_TOPICS)
      return
    }
    const correct = quiz.filter((q, i) => quizAnswers[i] === q.answer).length
    const score = Math.round((correct / quiz.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)
    saveQuizAttempt(topicId, { score, correct, total: quiz.length, date: new Date().toISOString() })
    if (score >= 80 && !isDone) toggleTopic(topicId, TOTAL_TOPICS)
    document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleMarkComplete = () => {
    if (!isDone) toggleTopic(topicId, TOTAL_TOPICS)
    navigate(-1)
  }

  if (!topic) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Topic not found</div>
        <div style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This topic may not be part of your current roadmap.</div>
        <button className="btn btn-primary" onClick={() => navigate('/roadmap')}>← Back to Roadmap</button>
      </div>
    )
  }

  return (
    <>
      <ReadingProgress />
      <div className="tp-page" ref={contentRef}>

        {/* Back bar */}
        <div className="tp-back-bar">
          <button className="tp-back-btn" onClick={() => navigate('/roadmap')}>
            ← Back to Roadmap
          </button>
          <div className="tp-back-crumb">
            Phase {phaseIdx + 1} · {phaseName} · <strong>{topic.name}</strong>
          </div>
          {isDone && (
            <span className="tp-done-chip">✓ Completed</span>
          )}
        </div>

        <div className="tp-layout">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="tp-sidebar">
            <TableOfContents sections={concepts} activeId={activeId} />

            {/* Quick stats */}
            <div className="tp-sidebar-card">
              <div className="tp-sidebar-card-title">Topic Info</div>
              <div className="tp-sidebar-stat">
                <span>Quiz Questions</span>
                <strong>{quiz.length}</strong>
              </div>
              <div className="tp-sidebar-stat">
                <span>Concepts</span>
                <strong>{concepts.length}</strong>
              </div>
              <div className="tp-sidebar-stat">
                <span>Resources</span>
                <strong>{topic.resources?.length || 0}</strong>
              </div>
              <div className="tp-sidebar-stat">
                <span>Points on Complete</span>
                <strong style={{ color: 'var(--primary)' }}>+8 pts</strong>
              </div>
            </div>

            {/* CTA */}
            {!isDone && quiz.length === 0 && (
              <button className="btn btn-success" style={{ width: '100%', marginTop: 12 }} onClick={handleMarkComplete}>
                ✓ Mark as Complete
              </button>
            )}
            {isDone && (
              <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--success)', fontWeight: 700, fontSize: 14 }}>
                ✓ You completed this topic!
              </div>
            )}
            {prevAttempts.length > 0 && (
              <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Best Quiz Score</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: Math.max(...prevAttempts.map(a => a.score)) >= 80 ? 'var(--success)' : '#ef4444' }}>
                  {Math.max(...prevAttempts.map(a => a.score))}%
                </div>
              </div>
            )}
          </aside>

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <main className="tp-main">

            {/* GFG-style green header */}
            <div className="tp-article-header" id="intro">
              <div className="tp-article-breadcrumb">DSA → Phase {phaseIdx + 1} · {phaseName}</div>
              <h1 className="tp-article-title">{topic.name}</h1>
              <div className="tp-article-meta">
                {quiz.length > 0 && <span className="tp-meta-chip quiz">{quiz.length} Quiz Questions</span>}
                {isDone && <span className="tp-meta-chip done">✓ Completed</span>}
                {concepts.length > 0 && <span className="tp-meta-chip">{concepts.length} Concepts</span>}
                {topic.resources?.length > 0 && <span className="tp-meta-chip">▶ {topic.resources.length} Video{topic.resources.length > 1 ? 's' : ''}</span>}
              </div>
            </div>

            {/* Introduction */}
            {topic.description && (
              <p className="tp-intro">{topic.description}</p>
            )}

            {/* Concept Sections */}
            {concepts.map((c, i) => (
              <div key={i} className="tp-section" id={`section-${i}`}>
                <h2 className="tp-section-heading">
                  <span className="tp-section-num">{i + 1}</span>
                  {c.heading}
                </h2>
                {c.body && <p className="tp-section-body">{c.body}</p>}
                {c.code && (
                  <div className="tp-code-block">
                    <div className="tp-code-header">
                      <div className="tp-code-dots">
                        <span /><span /><span />
                      </div>
                      <span className="tp-code-lang">Code Example</span>
                      <button className="tp-copy-btn" onClick={() => navigator.clipboard?.writeText(c.code)}>
                        Copy
                      </button>
                    </div>
                    <pre className="tp-code-pre"><code>{c.code}</code></pre>
                  </div>
                )}
              </div>
            ))}

            {/* Complexity Analysis */}
            {(topic.complexity?.time || topic.complexity?.space) && (
              <div className="tp-section" id="complexity">
                <h2 className="tp-section-heading">
                  <span className="tp-section-num">⏱</span>
                  Complexity Analysis
                </h2>
                <div className="tp-complexity-grid">
                  {topic.complexity.time && (
                    <div className="tp-complexity-card">
                      <div className="tp-complexity-label">Time Complexity</div>
                      <code className="tp-complexity-val">{topic.complexity.time}</code>
                    </div>
                  )}
                  {topic.complexity.space && (
                    <div className="tp-complexity-card">
                      <div className="tp-complexity-label">Space Complexity</div>
                      <code className="tp-complexity-val">{topic.complexity.space}</code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Points */}
            {keyPoints.length > 0 && (
              <div className="tp-keypoints" id="keypoints">
                <div className="tp-keypoints-header">⭐ Key Points to Remember</div>
                <ul className="tp-keypoints-list">
                  {keyPoints.map((kp, i) => (
                    <li key={i}>{kp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Resources */}
            {topic.resources?.length > 0 && (
              <div className="tp-section" id="resources">
                <h2 className="tp-section-heading">
                  <span className="tp-section-num">📺</span>
                  Learning Resources
                </h2>
                <div className="tp-resources-grid">
                  {topic.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer" className="tp-resource-card">
                      <div className="tp-resource-thumb">
                        <div className="tp-resource-play">▶</div>
                      </div>
                      <div className="tp-resource-info">
                        <div className="tp-resource-title">{r.title || r.url}</div>
                        <div className="tp-resource-sub">Video · Click to watch</div>
                      </div>
                      <div className="tp-resource-cta">Watch →</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* No content placeholder */}
            {!topic.description && concepts.length === 0 && !topic.resources?.length && (
              <div className="tp-empty">
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Content coming soon</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>This topic's content is being prepared. Check back soon!</div>
              </div>
            )}

            {/* Quiz Section */}
            <div className="tp-section tp-quiz-section" id="quiz">
              <h2 className="tp-section-heading">
                <span className="tp-section-num">🧠</span>
                Practice Quiz
              </h2>

              {quiz.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic', marginBottom: 20 }}>
                  No quiz questions for this topic yet.
                </div>
              ) : (
                <>
                  {!quizSubmitted && (
                    <>
                      <div className="tp-quiz-info">
                        Answer all {quiz.length} questions and score 80%+ to complete this topic and earn +8 pts.
                      </div>
                      {quiz.map((q, qi) => (
                        <div key={qi} className="tp-quiz-question">
                          <div className="tp-quiz-q-text">Q{qi + 1}. {q.question}</div>
                          <div className="tp-quiz-options">
                            {q.options.map((opt, oi) => (
                              <button
                                key={oi}
                                className={`tp-quiz-opt${quizAnswers[qi] === oi ? ' selected' : ''}`}
                                onClick={() => setQuizAnswers(a => ({ ...a, [qi]: oi }))}
                              >
                                <span className="tp-quiz-opt-letter">{String.fromCharCode(65 + oi)}</span>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={submitQuiz}
                        disabled={quiz.some((_, i) => quizAnswers[i] === undefined)}
                        style={{ marginTop: 8 }}
                      >
                        Submit Quiz →
                      </button>
                    </>
                  )}

                  {quizSubmitted && (
                    <div className="tp-quiz-result">
                      <div className="tp-quiz-score-circle" style={{ borderColor: quizScore >= 80 ? 'var(--success)' : '#ef4444' }}>
                        <span className="tp-quiz-score-num" style={{ color: quizScore >= 80 ? 'var(--success)' : '#ef4444' }}>{quizScore}%</span>
                        <span className="tp-quiz-score-label">{quizScore >= 80 ? '🎉 Passed!' : '😔 Try Again'}</span>
                      </div>

                      {quizScore >= 80 ? (
                        <div className="tp-quiz-pass-msg">
                          Topic completed! +8 pts added to your score.
                        </div>
                      ) : (
                        <div className="tp-quiz-fail-msg">
                          You need at least 80% to complete this topic.
                          <button
                            className="btn btn-primary"
                            style={{ marginTop: 12, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                            onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null) }}
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      {/* Review answers */}
                      <div className="tp-quiz-review">
                        <div className="tp-quiz-review-title">Answer Review</div>
                        {quiz.map((q, qi) => {
                          const userAns = quizAnswers[qi]
                          const isCorrect = userAns === q.answer
                          return (
                            <div key={qi} className={`tp-quiz-review-item${isCorrect ? ' correct' : ' wrong'}`}>
                              <div className="tp-quiz-review-q">
                                <span className={`tp-quiz-review-icon`}>{isCorrect ? '✓' : '✗'}</span>
                                Q{qi + 1}. {q.question}
                              </div>
                              <div className="tp-quiz-review-ans">
                                {!isCorrect && (
                                  <div className="tp-quiz-review-your">Your answer: {q.options[userAns] ?? '—'}</div>
                                )}
                                <div className="tp-quiz-review-correct">Correct: {q.options[q.answer]}</div>
                                {q.explanation && (
                                  <div className="tp-quiz-review-exp">{q.explanation}</div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {prevAttempts.length > 0 && <AttemptsTable attempts={prevAttempts} />}
                    </div>
                  )}
                </>
              )}

              {/* Footer actions */}
              <div className="tp-footer-actions">
                <button className="btn btn-ghost" onClick={() => navigate('/roadmap')}>← Back to Roadmap</button>
                {isDone ? (
                  <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 14 }}>✓ Topic Completed</span>
                ) : quiz.length === 0 && (
                  <button className="btn btn-success" onClick={handleMarkComplete}>✓ Mark as Complete (+8 pts)</button>
                )}
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  )
}