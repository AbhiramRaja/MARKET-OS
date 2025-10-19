import { useState } from 'react'
import { getSavedSeller } from '../lib/seller-bus'

export default function Settings() {
  const seller = getSavedSeller()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [profile, setProfile] = useState({
    businessName: seller.businessName || '',
    email: seller.email || '',
    phone: '+91 9876543210',
    description: 'Leading electronics retailer in India',
    gstNumber: '27AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    bankAccount: {
      accountNumber: '****7890',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'TechGear Electronics Pvt Ltd'
    },
    notifications: {
      emailOrders: true,
      emailMarketing: false,
      smsOrders: true,
      pushNotifications: true
    }
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  async function handleSaveProfile() {
    setLoading(true)
    try {
      // await updateSellerProfile(seller.sellerId, profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      alert('✅ Profile updated successfully!')
    } catch (error) {
      alert('❌ Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  function handlePasswordChange() {
    if (password.new !== password.confirm) {
      alert('❌ New passwords do not match!')
      return
    }
    if (password.new.length < 8) {
      alert('❌ Password must be at least 8 characters!')
      return
    }
    alert('✅ Password updated successfully!')
    setPassword({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">⚙️ Settings</h1>

      {/* Business Profile */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🏢 Business Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name</label>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">GST Number</label>
            <input
              type="text"
              value={profile.gstNumber}
              onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Business Description</label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">📋 Tax Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">PAN Number</label>
            <input
              type="text"
              value={profile.panNumber}
              onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">GST Number</label>
            <input
              type="text"
              value={profile.gstNumber}
              disabled
              className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-xl border border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🏦 Bank Account Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Account Holder Name</label>
            <input
              type="text"
              value={profile.bankAccount.accountHolderName}
              onChange={(e) => setProfile({ 
                ...profile, 
                bankAccount: { ...profile.bankAccount, accountHolderName: e.target.value }
              })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Account Number</label>
            <input
              type="text"
              value={profile.bankAccount.accountNumber}
              disabled
              className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-xl border border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">IFSC Code</label>
            <input
              type="text"
              value={profile.bankAccount.ifscCode}
              onChange={(e) => setProfile({ 
                ...profile, 
                bankAccount: { ...profile.bankAccount, ifscCode: e.target.value }
              })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🔔 Notification Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800">
            <input
              type="checkbox"
              checked={profile.notifications.emailOrders}
              onChange={(e) => setProfile({
                ...profile,
                notifications: { ...profile.notifications, emailOrders: e.target.checked }
              })}
              className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <div className="font-semibold text-white">Email notifications for new orders</div>
              <div className="text-sm text-gray-400">Get notified when you receive a new order</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800">
            <input
              type="checkbox"
              checked={profile.notifications.smsOrders}
              onChange={(e) => setProfile({
                ...profile,
                notifications: { ...profile.notifications, smsOrders: e.target.checked }
              })}
              className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <div className="font-semibold text-white">SMS notifications for urgent orders</div>
              <div className="text-sm text-gray-400">Receive SMS for high-value or urgent orders</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800">
            <input
              type="checkbox"
              checked={profile.notifications.pushNotifications}
              onChange={(e) => setProfile({
                ...profile,
                notifications: { ...profile.notifications, pushNotifications: e.target.checked }
              })}
              className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <div className="font-semibold text-white">Push notifications</div>
              <div className="text-sm text-gray-400">Real-time browser notifications</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800">
            <input
              type="checkbox"
              checked={profile.notifications.emailMarketing}
              onChange={(e) => setProfile({
                ...profile,
                notifications: { ...profile.notifications, emailMarketing: e.target.checked }
              })}
              className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <div className="font-semibold text-white">Marketing emails</div>
              <div className="text-sm text-gray-400">Tips, promotions, and seller resources</div>
            </div>
          </label>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🔒 Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) => setPassword({ ...password, current: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <button
          onClick={handlePasswordChange}
          className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
        >
          Update Password
        </button>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
