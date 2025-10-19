import { useState } from 'react'
import { getSavedSeller } from '../lib/seller-bus'

interface Document {
  name: string
  file: File | null
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
}

interface DocumentUploadProps {
  onDocumentsSubmitted?: () => void
}

export default function DocumentUpload({ onDocumentsSubmitted }: DocumentUploadProps) {
  const seller = getSavedSeller()
  const [documents, setDocuments] = useState<Document[]>([
    { name: 'Business Registration Certificate', file: null, status: 'pending' },
    { name: 'GST/Tax Registration Certificate', file: null, status: 'pending' },
    { name: 'Business Address Proof', file: null, status: 'pending' },
    { name: 'Bank Account Details (Cancelled Cheque)', file: null, status: 'pending' },
    { name: 'ID Proof (Aadhaar/PAN Card)', file: null, status: 'pending' }
  ])

  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleFileChange = (index: number, file: File | null) => {
    const newDocs = [...documents]
    newDocs[index].file = file
    newDocs[index].status = file ? 'uploaded' : 'pending'
    setDocuments(newDocs)
  }

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(index, file)
    }
  }

  const handleSubmit = async () => {
    setUploading(true)
    
    try {
      const currentSeller = JSON.parse(localStorage.getItem('currentSeller') || '{}')
      
      // Submit verification request to backend (DynamoDB)
      const response = await fetch('http://localhost:3001/notifications/seller-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentSeller.sellerId || seller.sellerId,
          businessName: currentSeller.businessName || seller.businessName,
          email: currentSeller.email || seller.email,
          documents: documents.map(d => ({
            name: d.name,
            uploaded: d.file !== null
          })),
          adminEmail: 'mmarket.os.123@gmail.com'
        })
      })
      
      const data = await response.json()
      
      // Update localStorage cache
      if (currentSeller.email) {
        currentSeller.documentsSubmitted = true;
        currentSeller.verificationStatus = 'pending';
        localStorage.setItem('currentSeller', JSON.stringify(currentSeller));
        localStorage.setItem('verificationStatus', 'pending');
        localStorage.setItem('documentsSubmitted', 'true');
      }
      
      if (response.ok) {
        if (data.status === 'approved') {
          alert('✅ You are already verified!')
          localStorage.setItem('verificationStatus', 'approved')
          window.location.reload()
        } else if (data.status === 'pending') {
          alert('⏳ Your verification request is already pending.\n\n📋 Admin will review it soon.')
          setSubmitted(true)
          if (onDocumentsSubmitted) {
            onDocumentsSubmitted()
          }
        } else {
          setSubmitted(true)
          if (onDocumentsSubmitted) {
            onDocumentsSubmitted()
          }
          alert('✅ Documents submitted successfully!\n\n📧 Admin will review your request.')
        }
      } else {
        alert('❌ Failed to submit documents. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('❌ Network error. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  const allUploaded = documents.every(doc => doc.file !== null)

  if (submitted) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">📄 Document Verification</h2>
          <p className="text-gray-400">Your documents have been submitted</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-8 text-center">
          <span className="text-6xl mb-4 block">✅</span>
          <h3 className="text-2xl font-bold text-green-300 mb-4">Documents Submitted Successfully!</h3>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 font-semibold mb-2">📧 Admin Notification Sent</p>
              <p className="text-sm text-gray-300">
                Our admin team at <strong>market.os.123@gmail.com</strong> has been notified and will review your documents.
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-300 font-semibold mb-2">⏳ What Happens Next?</p>
              <ul className="text-sm text-gray-300 text-left space-y-2">
                <li>✓ Admin will review your documents within 24-48 hours</li>
                <li>✓ You'll receive email notification with verification results</li>
                <li>✓ Once approved, you can start adding products and selling</li>
                <li>✓ If rejected, you'll receive feedback on what to fix</li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 font-semibold mb-2">❓ Need Help?</p>
              <p className="text-sm text-gray-300">
                For any questions or concerns, contact our support team at:<br/>
                <strong className="text-yellow-300">market.os.123@gmail.com</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">📄 Document Verification</h2>
        <p className="text-gray-400">Upload your business documents for verification</p>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">ℹ️</span>
          <div>
            <h3 className="text-white font-bold mb-2">Important Information</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>✅ All documents must be clear and readable</li>
              <li>✅ Accepted formats: PDF, JPG, PNG (Max 5MB per file)</li>
              <li>✅ Admin will review within 24-48 hours</li>
              <li>✅ Email notification will be sent to: <strong className="text-blue-300">{seller.email}</strong></li>
              <li>📧 Admin contact: <strong className="text-purple-300">market.os.123@gmail.com</strong></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{doc.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {doc.status === 'pending' && '⏳ Waiting for upload'}
                  {doc.status === 'uploaded' && '✅ Ready to submit'}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                doc.status === 'pending' ? 'bg-gray-700 text-gray-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {doc.status.toUpperCase()}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  id={`file-${index}`}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                />
                <label
                  htmlFor={`file-${index}`}
                  className="block cursor-pointer"
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 hover:border-purple-500 transition-all text-center bg-gray-800/50">
                    {doc.file ? (
                      <div>
                        <span className="text-4xl mb-2 block">��</span>
                        <p className="text-white font-semibold">{doc.file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl mb-2 block">📤</span>
                        <p className="text-white font-semibold mb-1">Click or drag to upload</p>
                        <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {doc.file && (
                <button
                  onClick={() => handleFileChange(index, null)}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 font-semibold transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!allUploaded || uploading}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
            allUploaded && !uploading
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {uploading ? '⏳ Submitting...' : allUploaded ? '✅ Submit All Documents' : '📤 Upload All Documents First'}
        </button>
      </div>

      {!allUploaded && (
        <p className="text-center text-gray-400 mt-4 text-sm">
          Please upload all required documents to proceed
        </p>
      )}
    </div>
  )
}
