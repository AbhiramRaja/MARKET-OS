export interface Seller {
  id?: string
  sellerId: string
  businessName?: string
  email?: string
}

const SELLER_KEY = 'current_seller'

export function getSavedSeller(): Seller {
  const saved = localStorage.getItem(SELLER_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return { sellerId: '' }
    }
  }
  return { sellerId: '' }
}

export function saveSeller(seller: Seller) {
  localStorage.setItem(SELLER_KEY, JSON.stringify(seller))
}

export function clearSeller() {
  localStorage.removeItem(SELLER_KEY)
}

export interface VerificationStatus {
  isVerified: boolean
  status: 'pending' | 'approved' | 'rejected'
  submittedAt?: string
  verifiedAt?: string
}

export function getVerificationStatus(): VerificationStatus {
  const saved = localStorage.getItem('verification-status')
  return saved ? JSON.parse(saved) : { isVerified: false, status: 'pending' }
}

export function setVerificationStatus(status: VerificationStatus) {
  localStorage.setItem('verification-status', JSON.stringify(status))
}
