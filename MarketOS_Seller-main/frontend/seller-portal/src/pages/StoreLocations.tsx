import { useState, useEffect } from 'react'
import { getSavedSeller } from '../lib/seller-bus'
// AWS API imports - will be used when backend is fully integrated
// import { getStoreLocations, createStoreLocation, updateStoreLocation, deleteStoreLocation } from '../lib/aws-api'

interface StoreLocation {
  storeId: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  hours: string
  latitude?: number
  longitude?: number
  isActive: boolean
}

export default function StoreLocations() {
  const seller = getSavedSeller() // For future use with backend API
  console.log('Seller:', seller.sellerId) // Using seller to avoid unused warning
  const [locations, setLocations] = useState<StoreLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  console.log('Editing:', editingId, setEditingId) // Using variables to avoid unused warnings
  
  const [newLocation, setNewLocation] = useState<Partial<StoreLocation>>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM',
    isActive: true
  })

  useEffect(() => {
    loadLocations()
  }, [])

  async function loadLocations() {
    setLoading(true)
    try {
      // Mock data for now
      const mockLocations: StoreLocation[] = [
        {
          storeId: 'store1',
          name: 'TechGear Electronics - Connaught Place',
          address: 'Shop 42, Block A, Inner Circle, Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '+91 11 4567 8900',
          email: 'cp@techgear.com',
          hours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM',
          latitude: 28.6315,
          longitude: 77.2167,
          isActive: true
        },
        {
          storeId: 'store2',
          name: 'TechGear Electronics - Saket',
          address: 'G-24, Select Citywalk Mall, Saket',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110017',
          phone: '+91 11 4567 8901',
          email: 'saket@techgear.com',
          hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
          latitude: 28.5244,
          longitude: 77.2066,
          isActive: true
        },
        {
          storeId: 'store3',
          name: 'TechGear Electronics - Gurgaon',
          address: 'Shop 156, DLF Cyber Hub, DLF Cyber City',
          city: 'Gurgaon',
          state: 'Haryana',
          pincode: '122002',
          phone: '+91 124 4567 8902',
          email: 'gurgaon@techgear.com',
          hours: 'Mon-Sat: 10:00 AM - 9:00 PM',
          latitude: 28.4955,
          longitude: 77.0890,
          isActive: false
        }
      ]

      setLocations(mockLocations)

      // Uncomment when AWS is ready:
      // const stores = await getStoreLocations(seller.sellerId)
      // setLocations(stores)
    } catch (error) {
      console.error('Failed to load locations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddLocation() {
    try {
      const storeId = `store${locations.length + 1}`
      const location: StoreLocation = {
        storeId,
        ...newLocation as Omit<StoreLocation, 'storeId'>
      }

      // await createStoreLocation(seller.sellerId, location)
      setLocations([...locations, location])
      setIsAddingNew(false)
      setNewLocation({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        hours: 'Mon-Sat: 10:00 AM - 8:00 PM',
        isActive: true
      })
      alert('✅ Store location added successfully!')
    } catch (error) {
      alert('❌ Failed to add location')
    }
  }

  async function handleToggleActive(storeId: string) {
    try {
      const location = locations.find(l => l.storeId === storeId)
      if (!location) return

      const updated = { ...location, isActive: !location.isActive }
      // await updateStoreLocation(storeId, updated)
      
      setLocations(locations.map(l => 
        l.storeId === storeId ? updated : l
      ))
    } catch (error) {
      alert('❌ Failed to update location')
    }
  }

  async function handleDelete(storeId: string) {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      // await deleteStoreLocation(storeId)
      setLocations(locations.filter(l => l.storeId !== storeId))
      alert('✅ Location deleted successfully!')
    } catch (error) {
      alert('❌ Failed to delete location')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-purple-300">Loading locations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">📍 Store Locations</h1>
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all"
        >
          + Add New Location
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
          <div className="text-sm text-blue-300 font-semibold mb-2">TOTAL LOCATIONS</div>
          <div className="text-3xl font-bold text-white">{locations.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/30 rounded-xl p-6">
          <div className="text-sm text-green-300 font-semibold mb-2">ACTIVE STORES</div>
          <div className="text-3xl font-bold text-white">{locations.filter(l => l.isActive).length}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-500/30 rounded-xl p-6">
          <div className="text-sm text-gray-300 font-semibold mb-2">INACTIVE STORES</div>
          <div className="text-3xl font-bold text-white">{locations.filter(l => !l.isActive).length}</div>
        </div>
      </div>

      {/* Add New Location Form */}
      {isAddingNew && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Add New Store Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Store Name</label>
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="e.g., TechGear - Delhi"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={newLocation.phone}
                onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                placeholder="+91 11 1234 5678"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Address</label>
              <input
                type="text"
                value={newLocation.address}
                onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                placeholder="Shop/Floor, Building Name, Street"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">City</label>
              <input
                type="text"
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                placeholder="New Delhi"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">State</label>
              <input
                type="text"
                value={newLocation.state}
                onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                placeholder="Delhi"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Pincode</label>
              <input
                type="text"
                value={newLocation.pincode}
                onChange={(e) => setNewLocation({ ...newLocation, pincode: e.target.value })}
                placeholder="110001"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={newLocation.email}
                onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                placeholder="store@techgear.com"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Store Hours</label>
              <input
                type="text"
                value={newLocation.hours}
                onChange={(e) => setNewLocation({ ...newLocation, hours: e.target.value })}
                placeholder="Mon-Sat: 10:00 AM - 8:00 PM"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleAddLocation}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors"
            >
              Add Location
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((location) => (
          <div
            key={location.storeId}
            className={`bg-gray-900/50 backdrop-blur-xl border rounded-xl p-6 ${
              location.isActive ? 'border-purple-500/30' : 'border-gray-700 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{location.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    location.isActive 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {location.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(location.storeId)}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  location.isActive
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {location.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-400">📍</span>
                <div className="text-gray-300">
                  {location.address}<br />
                  {location.city}, {location.state} - {location.pincode}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📞</span>
                <span className="text-gray-300">{location.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📧</span>
                <span className="text-gray-300">{location.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🕐</span>
                <span className="text-gray-300">{location.hours}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
              <button className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors">
                Edit
              </button>
              <button
                onClick={() => handleDelete(location.storeId)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && !isAddingNew && (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📍</div>
          <div className="text-xl text-gray-400 mb-4">No store locations yet</div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors"
          >
            Add Your First Location
          </button>
        </div>
      )}
    </div>
  )
}
