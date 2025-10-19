export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-5xl">⏳</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Verification In Progress
        </h1>
        
        <p className="text-xl text-gray-300 mb-6">
          Thank you for submitting your documents!
        </p>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
          <p className="text-gray-200 text-lg leading-relaxed">
            We'll notify you once your verification has been <span className="text-green-400 font-semibold">approved</span> or <span className="text-red-400 font-semibold">rejected</span>.
          </p>
          <p className="text-gray-400 text-sm mt-3">
            This process usually takes 24-48 hours. We'll send you an email notification once the review is complete.
          </p>
        </div>

        <div className="space-y-3 text-left bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">📋 What happens next?</h3>
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="text-gray-300 font-medium">Document Review</p>
              <p className="text-gray-400 text-sm">Our team will verify your business documents</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="text-gray-300 font-medium">Background Check</p>
              <p className="text-gray-400 text-sm">We'll validate your business information</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="text-gray-300 font-medium">Approval & Access</p>
              <p className="text-gray-400 text-sm">Once approved, you'll get full access to the seller portal</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-4">
            Need help or have questions?
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:support@marketos.com" className="px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-all border border-purple-500/30">
              📧 Contact Support
            </a>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
              }}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-all"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
