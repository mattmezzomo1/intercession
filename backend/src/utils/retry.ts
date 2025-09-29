/**
 * Utility functions for retry logic and fallback strategies (Backend)
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      if (onRetry) {
        onRetry(attempt, error);
      }

      console.log(`Retry attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Generate a generic location description from coordinates
 */
export function generateGenericLocation(latitude: number, longitude: number): {
  city: string;
  country: string;
} {
  // Determine hemisphere and general region
  const latHemisphere = latitude >= 0 ? 'Norte' : 'Sul';
  const lonHemisphere = longitude >= 0 ? 'Leste' : 'Oeste';
  
  // Round coordinates to 1 decimal place for privacy
  const roundedLat = Math.round(latitude * 10) / 10;
  const roundedLon = Math.round(longitude * 10) / 10;
  
  // Generate generic descriptions based on coordinate ranges
  let region = 'Região Desconhecida';
  let country = 'País Desconhecido';

  // Basic continent/region detection based on coordinates
  if (latitude >= -60 && latitude <= 15 && longitude >= -85 && longitude <= -30) {
    // South America
    country = 'América do Sul';
    if (latitude >= -35 && latitude <= -5 && longitude >= -75 && longitude <= -35) {
      region = 'Região Central';
    } else if (latitude >= -35 && latitude <= -20) {
      region = 'Região Sul';
    } else if (latitude >= -20 && latitude <= 0) {
      region = 'Região Norte';
    }
  } else if (latitude >= 15 && latitude <= 75 && longitude >= -170 && longitude <= -50) {
    // North America
    country = 'América do Norte';
    region = 'Região Continental';
  } else if (latitude >= 35 && latitude <= 75 && longitude >= -15 && longitude <= 45) {
    // Europe
    country = 'Europa';
    region = 'Região Continental';
  } else if (latitude >= -40 && latitude <= 40 && longitude >= 10 && longitude <= 180) {
    // Africa/Asia/Oceania
    if (longitude >= 10 && longitude <= 55) {
      country = 'África/Oriente Médio';
    } else if (longitude >= 55 && longitude <= 150) {
      country = 'Ásia';
    } else {
      country = 'Oceania';
    }
    region = 'Região Continental';
  }

  return {
    city: `${region} (${Math.abs(roundedLat)}°${latHemisphere})`,
    country: `${country} (${Math.abs(roundedLon)}°${lonHemisphere})`
  };
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Sleep utility function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
