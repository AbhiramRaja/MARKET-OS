import { useState, useEffect } from 'react'
import { signOut } from 'aws-amplify/auth'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import DocumentUpload from './pages/DocumentUpload'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import InventoryManagement from './pages/InventoryManagement'
import StoreLocations from './pages/StoreLocations'
import VerificationPending from './pages/VerificationPending'

type Page = 'dashboard' | 'orders' | 'products' | 'documents' | 'analytics' | 'inventory' | 'locations' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('documents')
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSubmittedDocuments, setHasSubmittedDocuments] = useState(false)

  async function handleSignOut() {
    try {
      await signOut()
      // Clear local storage
      localStorage.clear()
      sessionStorage.clear()
      // Redirect to login
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Force redirect anyway
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/login'
    }
  }

  // Check verification status on load
  useEffect(() => {
    const checkVerificationStatus = () => {
      try {
        // Check if user is logged in via Cognito
        const isLoggedIn = localStorage.getItem('sellerLoggedIn') === 'true'
        if (!isLoggedIn) {
          window.location.href = '/login'
          return
        }

        // Get current seller data from localStorage
        const currentSeller = JSON.parse(localStorage.getItem('currentSeller') || '{}')
        const verificationStatus = localStorage.getItem('verificationStatus') || currentSeller.verificationStatus || 'pending'
        const documentsSubmitted = localStorage.getItem('documentsSubmitted') === 'true' || currentSeller.documentsSubmitted === true
        
        console.log('🔍 Verification check:', { verificationStatus, documentsSubmitted })
        
        // Update state based on localStorage
        setHasSubmittedDocuments(documentsSubmitted)
        setIsVerified(verificationStatus === 'approved')
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking verification:', error)
        setIsLoading(false)
      }
    }
    
    checkVerificationStatus()
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // If not verified and documents submitted, show verification pending page
  if (!isVerified && hasSubmittedDocuments) {
    return <VerificationPending />
  }

  // If not verified and no documents submitted, show document upload page only
  if (!isVerified && !hasSubmittedDocuments) {
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
                  <h1 className="text-2xl font-bold text-white">MarketOS Seller</h1>
                  <p className="text-xs text-purple-300 font-medium">Welcome! Please verify your account</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl font-semibold bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <DocumentUpload onDocumentsSubmitted={() => {
            localStorage.setItem('documentsSubmitted', 'true')
            setHasSubmittedDocuments(true)
          }} />
        </main>
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
                <h1 className="text-2xl font-bold text-white">MarketOS Seller</h1>
                <p className="text-xs text-purple-300 font-medium">TechGear Electronics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button onClick={() => setCurrentPage('dashboard')} className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${currentPage === 'dashboard' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  📊 Dashboard
                </button>
                <button onClick={() => setCurrentPage('analytics')} className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${currentPage === 'analytics' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  📈 Analytics
                </button>
                <button onClick={() => setCurrentPage('products')} className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${currentPage === 'products' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  📦 Products
                </button>
                <button onClick={() => setCurrentPage('inventory')} className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${currentPage === 'inventory' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  🏪 Inventory
                </button>
                <button onClick={() => setCurrentPage('orders')} className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${currentPage === 'orders' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  📋 Orders
                </button>
                <button onClick={() => setCurrentPage('locations')} className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${currentPage === 'locations' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  📍 Locations
                </button>
                <button onClick={() => setCurrentPage('settings')} className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${currentPage === 'settings' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                  ⚙️ Settings
                </button>
              </div>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl font-semibold bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'products' && <Products />}
        {currentPage === 'inventory' && <InventoryManagement />}
        {currentPage === 'orders' && <Orders />}
        {currentPage === 'locations' && <StoreLocations />}
        {currentPage === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
