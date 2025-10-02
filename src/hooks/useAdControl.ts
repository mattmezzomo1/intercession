import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { admobWeb } from '@/lib/admob';

interface AdControlState {
  viewCount: number;
  shouldShowAd: boolean;
  lastAdShown: number;
  postCount: number;
}

const AD_TRIGGER_VIEWS = 3; // Show ad every 3 prayer request views
const AD_COOLDOWN = 30000; // 30 seconds cooldown between ads
const STORAGE_KEY = 'intercede_ad_control';

export const useAdControl = () => {
  const { user } = useAuth();
  const [adState, setAdState] = useState<AdControlState>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, return default state
      }
    }
    return {
      viewCount: 0,
      shouldShowAd: false,
      lastAdShown: 0,
      postCount: 0
    };
  });

  // Todos os usuários agora veem anúncios (sistema free para todos)
  const isPremium = false;

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adState));
  }, [adState]);

  // Track prayer request view - Agora mostra anúncio diretamente quando necessário
  const trackView = useCallback(async () => {
    // Todos os usuários veem anúncios agora

    setAdState(prev => {
      const newViewCount = prev.viewCount + 1;
      const now = Date.now();

      // Check if we should show an ad
      const shouldShow = newViewCount >= AD_TRIGGER_VIEWS &&
                        (now - prev.lastAdShown) > AD_COOLDOWN;

      if (shouldShow) {
        // Mostrar anúncio intersticial
        setTimeout(async () => {
          try {
            await admobWeb.showInterstitial();
            markAdShown();
          } catch (error) {
            console.error('Failed to show view interstitial:', error);
          }
        }, 500); // Pequeno delay para melhor UX
      }

      return {
        ...prev,
        viewCount: shouldShow ? 0 : newViewCount, // Reset count if showing ad
        shouldShowAd: shouldShow
      };
    });
  }, []);

  // Track post creation - Agora mostra anúncio diretamente
  const trackPost = useCallback(async () => {
    // Todos os usuários veem anúncios agora

    setAdState(prev => ({
      ...prev,
      postCount: prev.postCount + 1
    }));

    // Mostrar anúncio intersticial imediatamente após postar
    try {
      await admobWeb.showInterstitial();
      markAdShown();
    } catch (error) {
      console.error('Failed to show post interstitial:', error);
    }
  }, []);

  // Mark ad as shown
  const markAdShown = useCallback(() => {
    setAdState(prev => ({
      ...prev,
      shouldShowAd: false,
      lastAdShown: Date.now()
    }));
  }, []);

  // Reset ad state (useful for testing or manual reset)
  const resetAdState = useCallback(() => {
    setAdState({
      viewCount: 0,
      shouldShowAd: false,
      lastAdShown: 0,
      postCount: 0
    });
  }, []);

  // Mostrar anúncio sob demanda (para casos especiais)
  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    // Todos os usuários veem anúncios agora

    try {
      const success = await admobWeb.showInterstitial();
      if (success) {
        markAdShown();
      }
      return success;
    } catch (error) {
      console.error('Failed to show on-demand interstitial:', error);
      return false;
    }
  }, []);

  // Check if ad should be shown (todos os usuários veem anúncios)
  const shouldShowAd = adState.shouldShowAd;

  return {
    shouldShowAd,
    viewCount: adState.viewCount,
    postCount: adState.postCount,
    trackView,
    trackPost,
    markAdShown,
    resetAdState,
    showInterstitialAd,
    isPremium
  };
};
