import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Assessment from './pages/Assessment'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Roadmap from './pages/Roadmap'
import DailyPractice from './pages/DailyPractice'
import CodingPractice from './pages/CodingPractice'
import Leaderboard from './pages/Leaderboard'
import Progress from './pages/Progress'
import MentorFeedback from './pages/MentorFeedback'
import Admin from './pages/Admin'
import IDE from './pages/IDE'
import AptitudeTraining from './pages/AptitudeTraining'
import TopicPage from './pages/TopicPage'
import ProfileSetup from './pages/ProfileSetup'
import Profile from './pages/Profile'
import CompanyLearning from './pages/CompanyLearning'

function Require({ children }) {
  const { user, authLoading } = useApp()
  if (authLoading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user, authLoading } = useApp()
  if (authLoading) return null
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/profile-setup" element={<Require><ProfileSetup /></Require>} />
      <Route path="/assessment" element={<Require><Assessment /></Require>} />
      <Route path="/" element={<Require><Layout /></Require>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="roadmap/topic/:topicId" element={<TopicPage />} />
        <Route path="practice/daily" element={<DailyPractice />} />
        <Route path="practice/coding" element={<CodingPractice />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="progress" element={<Progress />} />
        <Route path="mentor" element={<MentorFeedback />} />
        <Route path="ide" element={<IDE />} />
        <Route path="aptitude-training" element={<AptitudeTraining />} />
        <Route path="company-learning" element={<CompanyLearning />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
