import { useState } from 'react'
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth'

interface Props {
  show: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ show, onClose }: Props) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!show) return null

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await resetPassword({ username: email })
      setSuccess('Reset code sent to your email!')
      setStep('code')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      })
      setSuccess('Password reset successfully!')
      setTimeout(() => {
        onClose()
        setStep('email')
        setEmail('')
        setCode('')
        setNewPassword('')
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Reset Password</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Reset Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500"
                placeholder="Enter code from email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-purple-500/30 rounded-lg text-white outline-none focus:border-purple-500"
                placeholder="Enter new password (min 8 characters)"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setCode('')
                setNewPassword('')
                setError('')
              }}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
