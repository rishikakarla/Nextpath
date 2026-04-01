import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useState, useEffect } from 'react'

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  return [theme, toggle]
}

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/roadmap', icon: '🗺️', label: 'Learning Roadmap' },
  { to: '/practice/daily', icon: '📅', label: 'Daily Practice' },
  { to: '/aptitude-training', icon: '🧮', label: 'Aptitude Training' },
  { to: '/company-learning', icon: '🏢', label: 'Company Learning' },
  { to: '/practice/coding', icon: '💻', label: 'Coding Practice' },
  { to: '/ide', icon: '🖥️', label: 'Code IDE' },
  { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { to: '/progress', icon: '📊', label: 'My Progress' },
  { to: '/mentor', icon: '👨‍🏫', label: 'Mentor Feedback' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
]

const ADMIN_EMAIL = 'kakarlarishi5124@gmail.com'

export default function Layout() {
  const { user, streak, points, logout } = useApp()
  const navigate = useNavigate()
  const [theme, toggleTheme] = useTheme()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>NextPath</h2>
          <p>Career Prep Platform</p>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-college">{user?.college}</div>
          <div className="sidebar-streak">
            <span>🔥 {streak.count} day streak</span>
          </div>
        </div>

        <nav>
          <div className="nav-section-title">Main Menu</div>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          {user?.email === ADMIN_EMAIL && (
            <>
              <div className="nav-section-title" style={{ marginTop: 16 }}>Admin</div>
              <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <span className="nav-icon">⚙️</span>
                Admin Portal
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-points">
            Points: <strong>{points}</strong>
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}
            style={{ color: 'rgba(255,255,255,.6)', borderColor: 'rgba(255,255,255,.2)' }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
