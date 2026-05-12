import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useContent } from '../context/ContentContext'
import {
  CodingProblemsTab,
  AssessmentTab,
  RoadmapTab,
  DailyTasksTab,
  AptitudeTab,
  QuoteTab,
  CompaniesTab,
  CompanyQuestionsTab,
} from './Admin'

const TRAINER_TABS = [
  { key: 'coding',     label: '💻 Coding Problems'   },
  { key: 'assessment', label: '📝 Assessment'         },
  { key: 'roadmap',    label: '🗺️ Roadmap'            },
  { key: 'daily',      label: '📅 Daily Tasks'        },
  { key: 'aptitude',   label: '🧮 Aptitude Training'  },
  { key: 'quote',      label: '💬 Daily Quote'        },
  { key: 'companies',  label: '🏢 Manage Companies'   },
  { key: 'company',    label: '📋 Company Questions'  },
]

export default function TrainerPortal() {
  const { user, isTrainer, trainerProfile, logout } = useApp()
  const { codingProblems, assessmentQuestions, roadmapPhases, dailyTasks, aptitudeTopics, dailyQuote, companyProblems, companies, updateContent } = useContent()
  const navigate = useNavigate()
  const [tab, setTab] = useState('coding')

  if (!isTrainer) return <Navigate to="/dashboard" replace />

  const name = trainerProfile?.name || user?.name || 'Trainer'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>NextPath Trainer Portal</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Welcome, {name} — Content Management</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 13 }}
          >
            ← Back to App
          </button>
          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
        {/* Sidebar */}
        <aside style={{ width: 210, background: 'var(--card)', borderRight: '1px solid var(--border)', paddingTop: 16, flexShrink: 0 }}>
          <div style={{ padding: '6px 20px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.8px', textTransform: 'uppercase' }}>
            Content
          </div>
          {TRAINER_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: '100%', textAlign: 'left', padding: '11px 20px', border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'var(--primary-light)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text)',
              fontWeight: tab === t.key ? 700 : 400, fontSize: 14,
              borderLeft: `3px solid ${tab === t.key ? 'var(--primary)' : 'transparent'}`,
            }}>
              {t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {tab === 'coding'     && <CodingProblemsTab    problems={codingProblems}          onUpdate={d => updateContent('codingProblems', d)} />}
          {tab === 'assessment' && <AssessmentTab         questions={assessmentQuestions}    onUpdate={d => updateContent('assessmentQuestions', d)} />}
          {tab === 'roadmap'    && <RoadmapTab            roadmapByLevel={roadmapPhases}     onUpdate={d => updateContent('roadmapPhases', d)} />}
          {tab === 'daily'      && <DailyTasksTab         tasks={dailyTasks}                 onUpdate={d => updateContent('dailyTasks', d)} />}
          {tab === 'aptitude'   && <AptitudeTab           topics={aptitudeTopics}            onUpdate={d => updateContent('aptitudeTopics', d)} />}
          {tab === 'quote'      && <QuoteTab              quote={dailyQuote}                 onUpdate={d => updateContent('dailyQuote', d)} />}
          {tab === 'companies'  && <CompaniesTab          companies={companies}              onUpdate={d => updateContent('companies', { items: d })} />}
          {tab === 'company'    && <CompanyQuestionsTab   companies={companies} companyProblems={companyProblems} onUpdate={d => updateContent('companyProblems', d)} />}
        </main>
      </div>
    </div>
  )
}
