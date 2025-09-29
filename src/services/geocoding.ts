// Serviço de geocoding para obter coordenadas de cidades
// Usando OpenStreetMap Nominatim API (gratuita)
import { retryWithBackoff, generateGenericLocation, isValidCoordinates } from '@/utils/retry';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  displayName?: string;
  isGeneric?: boolean; // Indica se a localização é genérica (fallback)
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
  private readonly apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
   * Com retry automático e fallback para localização genérica
   */
  async getLocationFromCoordinates(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    // Validar coordenadas
    if (!isValidCoordinates(latitude, longitude)) {
      console.error('Invalid coordinates provided:', { latitude, longitude });
      return null;
    }

    console.log(`Starting reverse geocoding for coordinates: ${latitude}, ${longitude}`);

    try {
      // Tentar reverse geocoding com retry
      const result = await retryWithBackoff(
        async () => {
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

          const city = data.address?.city || data.address?.town || data.address?.village;
          const country = data.address?.country;

          // Se não conseguiu extrair pelo menos cidade ou país, considerar como falha
          if (!city && !country) {
            throw new Error('No usable location data in response');
          }

          return {
            latitude,
            longitude,
            city,
            country,
            displayName: data.display_name,
            isGeneric: false
          };
        },
        {
          maxAttempts: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          onRetry: (attempt, error) => {
            console.log(`Reverse geocoding retry ${attempt}/3:`, error.message);
          }
        }
      );

      console.log('Reverse geocoding successful:', result);
      return result;

    } catch (error) {
      console.warn('Reverse geocoding failed after retries, using fallback:', error);

      // Fallback: gerar localização genérica baseada nas coordenadas
      const genericLocation = generateGenericLocation(latitude, longitude);

      const fallbackResult: GeocodingResult = {
        latitude,
        longitude,
        city: genericLocation.city,
        country: genericLocation.country,
        displayName: `Localização aproximada: ${genericLocation.city}, ${genericLocation.country}`,
        isGeneric: true
      };

      console.log('Using generic location fallback:', fallbackResult);
      return fallbackResult;
    }
  }
  
  /**
   * Obter localização atual do usuário via browser
   */
  async getCurrentLocation(): Promise<GeocodingResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      // Primeiro, verificar se temos permissão
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
          if (permission.state === 'denied') {
            console.error('Geolocation permission denied');
            resolve(null);
            return;
          }

          // Prosseguir com a obtenção da localização
          this.requestCurrentPosition(resolve);
        }).catch(() => {
          // Fallback se a API de permissões não estiver disponível
          this.requestCurrentPosition(resolve);
        });
      } else {
        // Fallback se a API de permissões não estiver disponível
        this.requestCurrentPosition(resolve);
      }
    });
  }

  /**
   * Método auxiliar para solicitar a posição atual
   */
  private requestCurrentPosition(resolve: (value: GeocodingResult | null) => void): void {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          console.log('GPS coordinates obtained:', {
            latitude,
            longitude,
            accuracy: position.coords.accuracy
          });

          // Tentar obter informações da cidade com o novo sistema de retry
          const locationInfo = await this.getLocationFromCoordinates(latitude, longitude);

          if (locationInfo) {
            console.log('Location info obtained:', {
              city: locationInfo.city,
              country: locationInfo.country,
              isGeneric: locationInfo.isGeneric
            });
            resolve(locationInfo);
          } else {
            // Fallback final: retornar apenas coordenadas com localização genérica
            console.warn('All location methods failed, using final fallback');
            const genericLocation = generateGenericLocation(latitude, longitude);

            resolve({
              latitude,
              longitude,
              city: genericLocation.city,
              country: genericLocation.country,
              displayName: `Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              isGeneric: true
            });
          }
        } catch (error) {
          console.error('Error processing GPS location:', error);

          // Fallback final mesmo com erro
          const { latitude, longitude } = position.coords;
          const genericLocation = generateGenericLocation(latitude, longitude);

          resolve({
            latitude,
            longitude,
            city: genericLocation.city,
            country: genericLocation.country,
            displayName: `Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            isGeneric: true
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });

        // Fornecer mensagens de erro mais específicas
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error('User denied the request for Geolocation.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            console.error('The request to get user location timed out.');
            break;
          default:
            console.error('An unknown error occurred.');
            break;
        }

        resolve(null);
      },
      {
        timeout: 20000, // Aumentar timeout para 20 segundos
        enableHighAccuracy: true, // Usar alta precisão para melhor resultado
        maximumAge: 60000 // Aceitar cache de até 1 minuto
      }
    );
  }
}

export const geocodingService = new GeocodingService();
export type { GeocodingResult };
