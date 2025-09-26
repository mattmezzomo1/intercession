/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Generate SQL for distance calculation using Haversine formula
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param tableName Table name (default: prayer_requests)
 * @returns SQL fragment for distance calculation
 */
export const getDistanceSQL = (
  userLat: number,
  userLon: number,
  tableName: string = 'prayer_requests'
): string => {
  return `
    (6371 * acos(
      cos(radians(${userLat})) * 
      cos(radians(${tableName}.latitude)) * 
      cos(radians(${tableName}.longitude) - radians(${userLon})) + 
      sin(radians(${userLat})) * 
      sin(radians(${tableName}.latitude))
    ))
  `;
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (lat?: number, lon?: number): boolean => {
  if (lat === undefined || lon === undefined) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};
