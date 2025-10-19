import { useState, useEffect } from 'react'

interface VerificationRequest {
  _id: string
  sellerId: string
  businessName: string
  email: string
  documents: Array<{ name: string; uploaded: boolean }>
  status: string
  submittedAt: string
}

export default function PendingVerifications() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    try {
      const response = await fetch('http://localhost:3001/admin/pending-verifications')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load pending verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (sellerId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`http://localhost:3001/admin/verify-seller/${sellerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reason: action === 'reject' ? 'Document verification failed' : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update seller status')
      }

      alert(`Seller ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
      
      // Refresh the list after action
      await loadRequests()
    } catch (error) {
      console.error('Error updating seller:', error)
      alert('Failed to update seller status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Pending Verifications</h1>
                <p className="text-xs text-purple-300 font-medium">Review seller documents</p>
              </div>
            </div>
            <button 
              onClick={() => window.close()}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {requests.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
            <p className="text-gray-400">No pending verification requests at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div 
                key={request._id}
                className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{request.businessName}</h3>
                    <p className="text-gray-400">Seller ID: {request.sellerId}</p>
                    <p className="text-gray-400">Email: {request.email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(request.sellerId, 'approve')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleAction(request.sellerId, 'reject')}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3">📄 Documents Submitted:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {request.documents.map((doc) => (
                      <div 
                        key={doc.name}
                        className="flex items-center gap-2 text-sm"
                      >
                        {doc.uploaded ? (
                          <span className="text-green-400">✅</span>
                        ) : (
                          <span className="text-red-400">❌</span>
                        )}
                        <span className="text-gray-300">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
