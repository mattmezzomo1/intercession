// Serviço de geocoding para obter coordenadas de cidades
// Usando OpenStreetMap Nominatim API (gratuita)

interface GeocodingResult {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  displayName?: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    state?: string;
  };
}

class GeocodingService {
  private readonly apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  /**
   * Obter coordenadas de uma cidade/país
   */
  async getCoordinatesFromCity(city: string, country?: string): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({ city });
      if (country) {
        params.append('country', country);
      }

      const url = `${this.apiBaseUrl}/users/geocode?${params}`;
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const { data }: { data: NominatimResponse[] } = await response.json();

      if (data.length === 0) {
        return null;
      }

      const result = data[0];

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        city: result.address?.city || result.address?.town || result.address?.village || city,
        country: result.address?.country || country,
        displayName: result.display_name
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }
  
  /**
   * Obter informações de localização das coordenadas (reverse geocoding)
   */
  async getLocationFromCoordinates(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString()
      });

      const url = `${this.apiBaseUrl}/users/reverse-geocode?${params}`;
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`);
      }

      const { data }: { data: NominatimResponse } = await response.json();

      return {
        latitude,
        longitude,
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country,
        displayName: data.display_name
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
  
  /**
   * Obter localização atual do usuário via browser
   */
  async getCurrentLocation(): Promise<GeocodingResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Tentar obter informações da cidade
          const locationInfo = await this.getLocationFromCoordinates(latitude, longitude);
          
          resolve(locationInfo || {
            latitude,
            longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  }
}

export const geocodingService = new GeocodingService();
export type { GeocodingResult };
