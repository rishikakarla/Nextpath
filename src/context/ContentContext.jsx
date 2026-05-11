import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

const ContentContext = createContext(null)

const EMPTY_ROADMAP    = { beginner: [], beginnerPlus: [], intermediate: [], advanced: [] }
const EMPTY_DAILY_TASKS = { coding: null, aptitude: null, revision: null }

export function ContentProvider({ children }) {
  const [codingProblems,     setCodingProblems]     = useState([])
  const [assessmentQuestions, setAssessmentQuestions] = useState([])
  const [roadmapPhases,      setRoadmapPhases]      = useState(EMPTY_ROADMAP)
  const [roadmapConfigured,  setRoadmapConfigured]  = useState({ beginner: false, beginnerPlus: false, intermediate: false, advanced: false })
  const [dailyTasks,         setDailyTasks]         = useState(EMPTY_DAILY_TASKS)
  const [aptitudeTopics,     setAptitudeTopics]     = useState([])
  const [dailyQuote,         setDailyQuote]         = useState({ text: '', author: '' })
  const [companyProblems,    setCompanyProblems]    = useState({})
  const [companies,          setCompanies]          = useState([])

  useEffect(() => {
    const entries = [
      {
        key: 'codingProblems',
        seed: { items: [] },
        setter: d => setCodingProblems(d.items || []),
      },
      {
        key: 'assessmentQuestions',
        seed: { items: [] },
        setter: d => setAssessmentQuestions(d.items || []),
      },
      {
        key: 'roadmapPhases',
        seed: EMPTY_ROADMAP,
        setter: d => {
          setRoadmapPhases({
            beginner:     d.beginner     || [],
            beginnerPlus: d.beginnerPlus || [],
            intermediate: d.intermediate || [],
            advanced:     d.advanced     || [],
          })
          setRoadmapConfigured({
            beginner:     !!(d.beginner?.length),
            beginnerPlus: !!(d.beginnerPlus?.length),
            intermediate: !!(d.intermediate?.length),
            advanced:     !!(d.advanced?.length),
          })
        },
      },
      {
        key: 'dailyTasks',
        seed: EMPTY_DAILY_TASKS,
        setter: d => setDailyTasks({
          coding:   d.coding   || null,
          aptitude: d.aptitude || null,
          revision: d.revision || null,
        }),
      },
      {
        key: 'aptitudeTopics',
        seed: { items: [] },
        setter: d => setAptitudeTopics(d.items || []),
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
        seed: { items: [] },
        setter: d => setCompanies(d.items || []),
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
    const asIs = ['dailyTasks', 'roadmapPhases', 'dailyQuote', 'companyProblems']
    const payload = asIs.includes(type) ? data : { items: data }
    await setDoc(doc(db, 'content', type), payload)
  }

  return (
    <ContentContext.Provider value={{ codingProblems, assessmentQuestions, roadmapPhases, roadmapConfigured, dailyTasks, aptitudeTopics, dailyQuote, companyProblems, companies, updateContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export const useContent = () => {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be inside ContentProvider')
  return ctx
}
