import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { MOCK_LEADERBOARD } from '../data/appData'
import { auth, db, googleProvider, githubProvider } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'

const mentorKey = (email) => email.replace(/\./g, '__').replace(/@/g, '--at--')

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
  const [isMentor, setIsMentor] = useState(false)
  const [mentorProfile, setMentorProfile] = useState(null)

  // Prevents syncing state back to Firestore right after it was loaded from there
  const dataLoaded = useRef(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (docSnap.exists()) {
          const data = docSnap.data()
          const today = todayStr()
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, photoURL: firebaseUser.photoURL || data.profile?.photoURL || '', ...data.profile })
          setStreak(data.streak || DEFAULT_STREAK)
          setProgress(data.progress || DEFAULT_PROGRESS)
          setSolvedProblems(data.solvedProblems || [])
          setDailyTasks(data.dailyTasks?.date === today ? data.dailyTasks : DEFAULT_DAILY())
          setPoints(data.points || 0)
          setAssessmentResult(data.assessmentResult || null)
          setQuizAttempts(data.quizAttempts || {})
          setTaskHistory(data.taskHistory || {})
          setCodingSubmissions(data.codingSubmissions || {})
          // Check mentor role
          const mSnap = await getDoc(doc(db, 'mentors', mentorKey(firebaseUser.email)))
          if (mSnap.exists()) { setIsMentor(true); setMentorProfile(mSnap.data()) }
          else { setIsMentor(false); setMentorProfile(null) }
          // Delay enabling sync so the load-triggered effects don't write back to Firestore
          setTimeout(() => { dataLoaded.current = true }, 0)
          // Backfill leaderboard entry with latest data on every login
          setDoc(doc(db, 'leaderboard', firebaseUser.uid), {
            uid: firebaseUser.uid,
            name: data.profile?.name || '',
            college: data.profile?.college || '',
            photoURL: firebaseUser.photoURL || '',
            points: data.points || 0,
            streak: data.streak?.count || 0,
            solvedCount: (data.solvedProblems || []).length,
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
        setIsMentor(false)
        setMentorProfile(null)
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
      photoURL: auth.currentUser.photoURL || user.photoURL || '',
      points,
      streak: streak.count,
      solvedCount: solvedProblems.length,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(console.error)
  }, [points, streak.count, solvedProblems.length]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const loginWithSocial = async (provider) => {
    const cred = await signInWithPopup(auth, provider)
    const firebaseUser = cred.user
    const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
    if (!docSnap.exists()) {
      // New user via social auth — create minimal profile
      const profile = {
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        college: '', branch: '', yearOfStudy: '', careerGoal: '',
        linkedin: '', phone: '',
        profileComplete: false,
        createdAt: new Date().toISOString(),
      }
      const defaultDaily = DEFAULT_DAILY()
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        profile, streak: DEFAULT_STREAK, progress: DEFAULT_PROGRESS,
        solvedProblems: [], dailyTasks: defaultDaily, points: 0,
        assessmentResult: null, quizAttempts: {}, taskHistory: {}, codingSubmissions: {},
      })
      setDoc(doc(db, 'leaderboard', firebaseUser.uid), {
        uid: firebaseUser.uid, name: profile.name, college: '',
        photoURL: firebaseUser.photoURL || '',
        points: 0, streak: 0, updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(console.error)
      setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...profile })
      setStreak(DEFAULT_STREAK); setProgress(DEFAULT_PROGRESS)
      setSolvedProblems([]); setDailyTasks(defaultDaily); setPoints(0)
      setAssessmentResult(null)
      setTimeout(() => { dataLoaded.current = true }, 0)
      return { isNewUser: true, displayName: firebaseUser.displayName || '' }
    }
    return { isNewUser: false, displayName: firebaseUser.displayName || '' }
  }

  const loginWithGoogle = () => loginWithSocial(googleProvider)
  const loginWithGithub = () => loginWithSocial(githubProvider)

  const updateProfile = async (profileData) => {
    if (!auth.currentUser) return
    const isNowComplete = !!(profileData.name && profileData.college && profileData.branch && profileData.yearOfStudy && profileData.careerGoal)
    const wasComplete = user?.profileComplete
    const updated = { ...profileData, profileComplete: isNowComplete, updatedAt: new Date().toISOString() }
    await setDoc(doc(db, 'users', auth.currentUser.uid), { profile: updated }, { merge: true })
    setDoc(doc(db, 'leaderboard', auth.currentUser.uid), {
      name: profileData.name || '',
      college: profileData.college || '',
    }, { merge: true }).catch(console.error)
    setUser(u => ({ ...u, ...updated }))
    // Award 50 points the first time profile is fully completed
    if (isNowComplete && !wasComplete) {
      setPoints(p => p + 50)
    }
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
  const solveProblem = (id, { passed, total } = {}) => {
    if (solvedProblems.includes(id)) return
    // Only mark solved when ALL test cases passed (points already awarded in ProblemEditor)
    const allPassed = !total || passed === total
    if (!allPassed) return
    setSolvedProblems(prev => [...prev, id])
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

  const LEVEL_ORDER = ['Rookie', 'Explorer', 'Coder', 'Master']
  const levelUp = () => {
    const currentLevel = assessmentResult?.level
    const idx = LEVEL_ORDER.indexOf(currentLevel)
    const nextLevel = LEVEL_ORDER[idx + 1]
    if (!nextLevel) return
    const newResult = { ...assessmentResult, level: nextLevel, leveledUpAt: new Date().toISOString() }
    setAssessmentResult(newResult)
    // Reset roadmap progress for the new level
    setProgress(prev => ({ ...prev, completedTopics: [], roadmap: 0 }))
    // Bonus XP for leveling up
    setPoints(p => p + 50)
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), {
        assessmentResult: newResult,
        progress: { ...progress, completedTopics: [], roadmap: 0 },
      }, { merge: true }).catch(console.error)
    }
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
      isMentor, mentorProfile, mentorKey,
      register, login, loginWithGoogle, loginWithGithub, updateProfile, logout, saveAssessment,
      completeTask, solveProblem, toggleTopic, levelUp, getLeaderboard, setPoints,
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
