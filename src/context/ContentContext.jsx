import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { ASSESSMENT_QUESTIONS, ROADMAP_PHASES, DAILY_TASKS } from '../data/appData'
import { CODING_PROBLEMS } from '../data/codingProblems'
import { APTITUDE_TOPICS } from '../data/aptitudeData'
import { COMPANIES } from '../data/companyData'

const ContentContext = createContext(null)

const SEEDED_PHASES = ROADMAP_PHASES.map(phase => ({
  ...phase,
  topics: phase.topics.map(topic => ({ ...topic, description: '', resources: [], quiz: [] })),
}))

const DEFAULT_ROADMAP = {
  beginner:     SEEDED_PHASES,
  beginnerPlus: SEEDED_PHASES,
  intermediate: [],
  advanced:     [],
}

export function ContentProvider({ children }) {
  const [codingProblems, setCodingProblems] = useState(CODING_PROBLEMS)
  const [assessmentQuestions, setAssessmentQuestions] = useState(ASSESSMENT_QUESTIONS)
  const [roadmapPhases, setRoadmapPhases] = useState(DEFAULT_ROADMAP)
  const [dailyTasks, setDailyTasks] = useState(DAILY_TASKS)
  const [aptitudeTopics, setAptitudeTopics] = useState(APTITUDE_TOPICS)
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' })
  const [companyProblems, setCompanyProblems] = useState({})
  const [companies, setCompanies] = useState(COMPANIES)

  useEffect(() => {
    const entries = [
      {
        key: 'codingProblems',
        seed: { items: CODING_PROBLEMS },
        setter: d => setCodingProblems(d.items || CODING_PROBLEMS),
      },
      {
        key: 'assessmentQuestions',
        seed: { items: ASSESSMENT_QUESTIONS },
        setter: d => setAssessmentQuestions(d.items || ASSESSMENT_QUESTIONS),
      },
      {
        key: 'roadmapPhases',
        seed: DEFAULT_ROADMAP,
        setter: d => setRoadmapPhases({
          beginner:     d.beginner     || (d.items || SEEDED_PHASES),
          beginnerPlus: d.beginnerPlus || SEEDED_PHASES,
          intermediate: d.intermediate || [],
          advanced:     d.advanced     || [],
        }),
      },
      {
        key: 'dailyTasks',
        seed: DAILY_TASKS,
        setter: d => setDailyTasks({
          coding:   d.coding   || DAILY_TASKS.coding,
          aptitude: d.aptitude || DAILY_TASKS.aptitude,
          revision: d.revision || DAILY_TASKS.revision,
        }),
      },
      {
        key: 'aptitudeTopics',
        seed: { items: APTITUDE_TOPICS },
        setter: d => setAptitudeTopics(d.items || APTITUDE_TOPICS),
      },
      {
        key: 'dailyQuote',
        seed: { text: 'Consistency is what transforms average into excellence.', author: 'Unknown' },
        setter: d => setDailyQuote({ text: d.text || '', author: d.author || '' }),
      },
      {
        key: 'companyProblems',
        seed: {},
        setter: d => setCompanyProblems(d || {}),
      },
      {
        key: 'companies',
        seed: { items: COMPANIES },
        setter: d => setCompanies(d.items || COMPANIES),
      },
    ]

    // Use onSnapshot so all students instantly see admin changes
    const unsubs = entries.map(({ key, seed, setter }) =>
      onSnapshot(
        doc(db, 'content', key),
        snap => {
          if (!snap.exists()) {
            setDoc(doc(db, 'content', key), seed)
          } else {
            setter(snap.data())
          }
        },
        err => console.error(`Content [${key}] read failed:`, err)
      )
    )

    return () => unsubs.forEach(u => u())
  }, [])

  const updateContent = async (type, data) => {
    // companyProblems and roadmapPhases/dailyTasks/dailyQuote stored as-is; others wrapped in { items }
    const asIs = ['dailyTasks', 'roadmapPhases', 'dailyQuote', 'companyProblems']
    const payload = asIs.includes(type) ? data : { items: data }
    await setDoc(doc(db, 'content', type), payload)
  }

  return (
    <ContentContext.Provider value={{ codingProblems, assessmentQuestions, roadmapPhases, dailyTasks, aptitudeTopics, dailyQuote, companyProblems, companies, updateContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export const useContent = () => {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be inside ContentProvider')
  return ctx
}