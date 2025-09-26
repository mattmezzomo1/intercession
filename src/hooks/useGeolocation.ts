import { useState, useCallback } from 'react';
import { geocodingService, GeocodingResult } from '@/services/geocoding';
import { useToast } from '@/hooks/use-toast';

interface UseGeolocationReturn {
  isLoading: boolean;
  error: string | null;
  getCoordinatesFromCity: (city: string, country?: string) => Promise<GeocodingResult | null>;
  getCurrentLocation: () => Promise<GeocodingResult | null>;
  getLocationFromCoordinates: (lat: number, lon: number) => Promise<GeocodingResult | null>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getCoordinatesFromCity = useCallback(async (city: string, country?: string): Promise<GeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geocodingService.getCoordinatesFromCity(city, country);
      
      if (!result) {
        const errorMsg = `Não foi possível encontrar coordenadas para ${city}${country ? `, ${country}` : ''}`;
        setError(errorMsg);
        toast({
          title: "Localização não encontrada",
          description: errorMsg,
          variant: "destructive",
        });
        return null;
      }

      return result;
    } catch (err) {
      const errorMsg = 'Erro ao buscar coordenadas da cidade';
      setError(errorMsg);
      toast({
        title: "Erro de geocoding",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getCurrentLocation = useCallback(async (): Promise<GeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geocodingService.getCurrentLocation();
      
      if (!result) {
        const errorMsg = 'Não foi possível obter sua localização atual';
        setError(errorMsg);
        return null;
      }

      return result;
    } catch (err) {
      const errorMsg = 'Erro ao obter localização atual';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLocationFromCoordinates = useCallback(async (lat: number, lon: number): Promise<GeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await geocodingService.getLocationFromCoordinates(lat, lon);
      
      if (!result) {
        const errorMsg = 'Não foi possível obter informações da localização';
        setError(errorMsg);
        return null;
      }

      return result;
    } catch (err) {
      const errorMsg = 'Erro ao buscar informações da localização';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getCoordinatesFromCity,
    getCurrentLocation,
    getLocationFromCoordinates,
  };
};
