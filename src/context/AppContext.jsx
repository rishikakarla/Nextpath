import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { MOCK_LEADERBOARD } from '../data/appData'
import { auth, db } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AppContext = createContext(null)

const DEFAULT_STREAK = { count: 0, lastDate: null, history: [] }
const DEFAULT_PROGRESS = { dsa: 0, aptitude: 0, roadmap: 0, completedTopics: [] }
const todayStr = () => new Date().toDateString()
const DEFAULT_DAILY = () => ({ date: todayStr(), coding: false, aptitude: false, revision: false })

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [streak, setStreak] = useState(DEFAULT_STREAK)
  const [progress, setProgress] = useState(DEFAULT_PROGRESS)
  const [solvedProblems, setSolvedProblems] = useState([])
  const [dailyTasks, setDailyTasks] = useState(DEFAULT_DAILY)
  const [points, setPoints] = useState(0)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [quizAttempts, setQuizAttempts] = useState({})
  const [taskHistory, setTaskHistory] = useState({})
  const [codingSubmissions, setCodingSubmissions] = useState({})

  // Prevents syncing state back to Firestore right after it was loaded from there
  const dataLoaded = useRef(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (docSnap.exists()) {
          const data = docSnap.data()
          const today = todayStr()
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...data.profile })
          setStreak(data.streak || DEFAULT_STREAK)
          setProgress(data.progress || DEFAULT_PROGRESS)
          setSolvedProblems(data.solvedProblems || [])
          setDailyTasks(data.dailyTasks?.date === today ? data.dailyTasks : DEFAULT_DAILY())
          setPoints(data.points || 0)
          setAssessmentResult(data.assessmentResult || null)
          setQuizAttempts(data.quizAttempts || {})
          setTaskHistory(data.taskHistory || {})
          setCodingSubmissions(data.codingSubmissions || {})
          // Delay enabling sync so the load-triggered effects don't write back to Firestore
          setTimeout(() => { dataLoaded.current = true }, 0)
          // Backfill leaderboard entry with latest data on every login
          setDoc(doc(db, 'leaderboard', firebaseUser.uid), {
            uid: firebaseUser.uid,
            name: data.profile?.name || '',
            college: data.profile?.college || '',
            points: data.points || 0,
            streak: data.streak?.count || 0,
            updatedAt: new Date().toISOString(),
          }, { merge: true }).catch(console.error)
        }
        // If doc doesn't exist yet, register() will set state and enable sync
      } else {
        dataLoaded.current = false
        setUser(null)
        setStreak(DEFAULT_STREAK)
        setProgress(DEFAULT_PROGRESS)
        setSolvedProblems([])
        setDailyTasks(DEFAULT_DAILY())
        setPoints(0)
        setAssessmentResult(null)
        setQuizAttempts({})
        setTaskHistory({})
        setCodingSubmissions({})
      }
      setAuthLoading(false)
    })
    return unsub
  }, [])

  // ── Firestore sync ────────────────────────────────────────────────────────
  const syncField = (field, value) => {
    if (!dataLoaded.current || !auth.currentUser) return
    setDoc(doc(db, 'users', auth.currentUser.uid), { [field]: value }, { merge: true }).catch(console.error)
  }

  useEffect(() => { syncField('streak', streak) }, [streak])
  useEffect(() => { syncField('progress', progress) }, [progress])
  useEffect(() => { syncField('solvedProblems', solvedProblems) }, [solvedProblems])
  useEffect(() => { syncField('dailyTasks', dailyTasks) }, [dailyTasks])
  useEffect(() => { syncField('points', points) }, [points])
  useEffect(() => { syncField('quizAttempts', quizAttempts) }, [quizAttempts])
  useEffect(() => { syncField('taskHistory', taskHistory) }, [taskHistory])
  useEffect(() => { syncField('codingSubmissions', codingSubmissions) }, [codingSubmissions])

  // ── Public leaderboard entry (readable by all authenticated users) ──────────
  useEffect(() => {
    if (!dataLoaded.current || !auth.currentUser || !user) return
    setDoc(doc(db, 'leaderboard', auth.currentUser.uid), {
      uid: auth.currentUser.uid,
      name: user.name || '',
      college: user.college || '',
      points,
      streak: streak.count,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(console.error)
  }, [points, streak.count]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth ──────────────────────────────────────────────────────────────────
  const register = async (formData) => {
    const { email, password, ...profile } = formData
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const profileWithMeta = { ...profile, createdAt: new Date().toISOString() }
    const defaultDaily = DEFAULT_DAILY()
    await setDoc(doc(db, 'users', cred.user.uid), {
      profile: profileWithMeta,
      streak: DEFAULT_STREAK,
      progress: DEFAULT_PROGRESS,
      solvedProblems: [],
      dailyTasks: defaultDaily,
      points: 0,
      assessmentResult: null,
      quizAttempts: {},
      taskHistory: {},
      codingSubmissions: {},
    })
    setUser({ uid: cred.user.uid, email, ...profileWithMeta })
    setStreak(DEFAULT_STREAK)
    setProgress(DEFAULT_PROGRESS)
    setSolvedProblems([])
    setDailyTasks(defaultDaily)
    setPoints(0)
    setAssessmentResult(null)
    setTimeout(() => { dataLoaded.current = true }, 0)
    // Create leaderboard entry immediately on registration
    setDoc(doc(db, 'leaderboard', cred.user.uid), {
      uid: cred.user.uid,
      name: profileWithMeta.name || '',
      college: profileWithMeta.college || '',
      points: 0,
      streak: 0,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(console.error)
  }

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
    // onAuthStateChanged handles loading user data
  }

  const logout = async () => {
    dataLoaded.current = false
    await signOut(auth)
  }

  // ── Assessment ────────────────────────────────────────────────────────────
  const saveAssessment = (result) => {
    setAssessmentResult(result)
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), { assessmentResult: result }, { merge: true }).catch(console.error)
    }
  }

  // ── Streak ────────────────────────────────────────────────────────────────
  const triggerStreak = () => {
    const today = todayStr()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toDateString()

    setStreak(prev => {
      if (prev.lastDate === today) return prev
      const newCount = prev.lastDate === yStr ? prev.count + 1 : 1
      const history = [...(prev.history || []).slice(-29), today]
      return { count: newCount, lastDate: today, history }
    })
  }

  // ── Daily Practice ────────────────────────────────────────────────────────
  const completeTask = (type, dayNum = 1, submission = {}, pts = 5) => {
    const today = todayStr()
    setDailyTasks(prev => {
      if (prev[type]) return prev
      const updated = { ...prev, date: today, [type]: true }
      const allDone = updated.coding && updated.aptitude && updated.revision
      setPoints(p => p + (allDone ? pts + 15 : pts))
      if (allDone) triggerStreak()
      return updated
    })
    setProgress(prev => ({
      ...prev,
      aptitude: type === 'aptitude' ? Math.min(100, prev.aptitude + 5) : prev.aptitude,
    }))
    const dayKey = `day_${dayNum}`
    setTaskHistory(prev => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] || {}),
        [type]: { completedAt: new Date().toISOString(), ...submission },
      },
    }))
  }

  // ── Coding Practice ───────────────────────────────────────────────────────
  const solveProblem = (id) => {
    if (solvedProblems.includes(id)) return
    setSolvedProblems(prev => [...prev, id])
    setPoints(p => p + 10)
    setProgress(prev => ({ ...prev, dsa: Math.min(100, prev.dsa + 4) }))
  }

  // ── Coding Submissions ────────────────────────────────────────────────────
  const saveSubmission = (problemId, submission) => {
    setCodingSubmissions(prev => ({
      ...prev,
      [problemId]: [submission, ...(prev[problemId] || [])].slice(0, 20),
    }))
  }

  // ── Quiz Attempts ─────────────────────────────────────────────────────────
  const saveQuizAttempt = (topicId, attempt) => {
    setQuizAttempts(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), attempt],
    }))
  }

  // ── Roadmap ───────────────────────────────────────────────────────────────
  const toggleTopic = (topicId, totalTopics) => {
    setProgress(prev => {
      const isDone = prev.completedTopics.includes(topicId)
      const topics = isDone
        ? prev.completedTopics.filter(t => t !== topicId)
        : [...prev.completedTopics, topicId]
      const roadmap = Math.round((topics.length / totalTopics) * 100)
      if (!isDone) setPoints(p => p + 8)
      return { ...prev, completedTopics: topics, roadmap }
    })
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────
  const getLeaderboard = () => {
    const myEntry = user
      ? { id: user.uid, name: user.name, points, streak: streak.count, college: user.college || '', isMe: true }
      : null
    const base = myEntry
      ? [...MOCK_LEADERBOARD.filter(e => e.id !== user?.uid), myEntry]
      : MOCK_LEADERBOARD
    return base.sort((a, b) => b.points - a.points).map((e, i) => ({ ...e, rank: i + 1 }))
  }

  return (
    <AppContext.Provider value={{
      user, authLoading, streak, progress, solvedProblems, dailyTasks, points, assessmentResult,
      quizAttempts, saveQuizAttempt,
      taskHistory,
      codingSubmissions, saveSubmission,
      register, login, logout, saveAssessment,
      completeTask, solveProblem, toggleTopic, getLeaderboard, setPoints,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
