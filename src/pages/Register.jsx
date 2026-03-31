import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.6l6.2 5.2C36.9 37.3 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
    </svg>
  )
}

export default function Register() {
  const { loginWithGoogle, loginWithGithub } = useApp()
  const navigate = useNavigate()
  const [socialLoading, setSocialLoading] = useState('')
  const [error, setError] = useState('')

  const handleSocial = async (provider, label) => {
    setError('')
    setSocialLoading(label)
    try {
      const fn = provider === 'google' ? loginWithGoogle : loginWithGithub
      const { isNewUser } = await fn()
      navigate(isNewUser ? '/profile-setup' : '/dashboard')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.code === 'auth/account-exists-with-different-credential'
          ? 'An account already exists with a different sign-in method.'
          : `${label} sign-up failed. Please try again.`)
      }
    } finally {
      setSocialLoading('')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>NextPath</h1>
          <p>Start your career preparation journey</p>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Sign up to get started</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="auth-social">
          <button
            type="button"
            className="auth-social-btn"
            onClick={() => handleSocial('google', 'Google')}
            disabled={!!socialLoading}
          >
            <GoogleIcon />
            {socialLoading === 'Google' ? 'Signing up…' : 'Continue with Google'}
          </button>
          <button
            type="button"
            className="auth-social-btn auth-social-btn--github"
            onClick={() => handleSocial('github', 'GitHub')}
            disabled={!!socialLoading}
          >
            <GithubIcon />
            {socialLoading === 'GitHub' ? 'Signing up…' : 'Continue with GitHub'}
          </button>
        </div>
      </div>
    </div>
  )
}
