import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'

const CollegeContext = createContext(null)

export function CollegeProvider({ children }) {
  const [colleges, setColleges] = useState([])
  const [collegesLoading, setCollegesLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'colleges'), snap => {
      setColleges(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCollegesLoading(false)
    }, () => setCollegesLoading(false))
    return unsub
  }, [])

  return (
    <CollegeContext.Provider value={{ colleges, collegesLoading }}>
      {children}
    </CollegeContext.Provider>
  )
}

export const useCollege = () => {
  const ctx = useContext(CollegeContext)
  if (!ctx) throw new Error('useCollege must be used within CollegeProvider')
  return ctx
}
