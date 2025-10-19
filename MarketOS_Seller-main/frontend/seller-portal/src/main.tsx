import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './auth/amplify'
import App from './App.tsx'
import LoginPage from './auth/LoginPage.tsx'
import SignUpPage from './auth/SignUpPage.tsx'

// Simple routing based on path
const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/login' ? (
      <LoginPage />
    ) : path === '/signup' ? (
      <SignUpPage onSwitchToSignIn={() => window.location.href = '/login'} />
    ) : (
      <App />
    )}
  </StrictMode>,
)
