import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PendingVerifications from './pages/PendingVerifications.tsx'
import AdminLogin from './pages/AdminLogin.tsx'

const path = window.location.pathname
const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'

// If not logged in and not on login page, redirect to login
if (!isLoggedIn && path !== '/login') {
  window.location.href = '/login'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/login' ? (
      <AdminLogin />
    ) : path === '/pending-verifications' ? (
      <PendingVerifications />
    ) : (
      <App />
    )}
  </StrictMode>,
)
