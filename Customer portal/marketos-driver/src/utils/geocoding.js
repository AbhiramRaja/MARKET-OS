/**
 * Utility functions for geocoding and location services
 */

/**
 * Default coordinates for common Indian cities
 */
const CITY_COORDINATES = {
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.7041, 77.1025],
  'bangalore': [12.9716, 77.5946],
  'hyderabad': [17.3850, 78.4867],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'pune': [18.5204, 73.8567],
  'ahmedabad': [23.0225, 72.5714],
  'jaipur': [26.9124, 75.7873],
  'lucknow': [26.8467, 80.9462]
};

/**
 * Get approximate coordinates for a city
 * @param {string} city - City name
 * @returns {Array} [latitude, longitude]
 */
export const getCityCoordinates = (city) => {
  const cityLower = city.toLowerCase().trim();
  return CITY_COORDINATES[cityLower] || [19.0760, 72.8777]; // Default to Mumbai
};

/**
 * Generate random coordinates near a base location
 * @param {Array} baseCoords - Base coordinates [lat, lng]
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array} [latitude, longitude]
 */
export const getRandomNearbyCoordinates = (baseCoords, radiusKm = 5) => {
  const [baseLat, baseLng] = baseCoords;
  
  // Convert radius to degrees (approximately)
  const radiusInDegrees = radiusKm / 111; // 1 degree ≈ 111 km
  
  // Random angle and distance
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;
  
  // Calculate new coordinates
  const newLat = baseLat + (distance * Math.cos(angle));
  const newLng = baseLng + (distance * Math.sin(angle));
  
  return [newLat, newLng];
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Array} coords1 - First coordinates [lat, lng]
 * @param {Array} coords2 - Second coordinates [lat, lng]
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (coords1, coords2) => {
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Estimate delivery time based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Estimated time string
 */
export const estimateDeliveryTime = (distanceKm) => {
  // Assume average speed of 20 km/h in city traffic
  const avgSpeedKmh = 20;
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  
  if (timeMinutes < 60) {
    return `${timeMinutes} mins`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode
  ].filter(Boolean); // Remove empty values
  
  return parts.join(', ');
};

/**
 * Extract pickup location from address (simplified - first line)
 * @param {Object} address - Address object
 * @returns {string} Pickup location
 */
export const getPickupLocation = (address) => {
  return address.addressLine1 || address.city || 'Store Location';
};

/**
 * Get delivery coordinates from address
 * Uses city name to get approximate coordinates
 * In production, you should use a geocoding API
 * @param {Object} address - Address object
 * @returns {Array} [latitude, longitude]
 */
export const getCoordinatesFromAddress = (address) => {
  const city = address.city || 'mumbai';
  const baseCoords = getCityCoordinates(city);
  
  // Generate slightly random coordinates to simulate different locations in the city
  return getRandomNearbyCoordinates(baseCoords, 10);
};
