import React, { useEffect, useRef } from 'react';
import { admobWeb, ADMOB_CONFIG } from '@/lib/admob';

interface AdMobAdProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
  type?: 'banner' | 'rectangle' | 'interstitial';
}

export const AdMobAd: React.FC<AdMobAdProps> = ({
  adSlot,
  adFormat = 'auto',
  style = {},
  className = '',
  responsive = true,
  type = 'banner'
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeAd = async () => {
      try {
        // Inicializar AdMob Web
        await admobWeb.initialize();

        // Criar anúncio banner se o container existir
        if (adRef.current && type === 'banner') {
          const slot = adSlot || ADMOB_CONFIG.adUnits.banner;
          admobWeb.createBannerAd(adRef.current, slot);
        }
      } catch (error) {
        console.error('AdMob error:', error);
      }
    };

    initializeAd();
  }, [adSlot, type]);

  const defaultStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    minHeight: type === 'banner' ? '50px' : '250px',
    ...style
  };

  return (
    <div
      className={`admob-container ${className}`}
      ref={adRef}
      style={defaultStyle}
    />
  );
};

// Manter compatibilidade com nome antigo
export const AdSenseAd = AdMobAd;

// Banner Ad Component - Mobile-first banner
export const BannerAd: React.FC<{ className?: string }> = ({ className = '' }) => (
  <AdMobAd
    adSlot={ADMOB_CONFIG.adUnits.banner}
    adFormat="horizontal"
    className={className}
    type="banner"
    style={{ minHeight: '50px' }}
  />
);

// Rectangle Ad Component - For modals and cards
export const RectangleAd: React.FC<{ className?: string }> = ({ className = '' }) => (
  <AdMobAd
    adSlot={ADMOB_CONFIG.adUnits.banner}
    adFormat="rectangle"
    className={className}
    type="rectangle"
    style={{ minHeight: '250px', maxWidth: '300px', margin: '0 auto' }}
  />
);

// Interstitial Ad Component - Agora usa o sistema nativo
export const InterstitialAd: React.FC<{
  className?: string;
  onAdClosed?: () => void;
}> = ({ className = '', onAdClosed }) => {
  const showInterstitial = async () => {
    try {
      const success = await admobWeb.showInterstitial();
      if (success && onAdClosed) {
        onAdClosed();
      }
    } catch (error) {
      console.error('Failed to show interstitial:', error);
      if (onAdClosed) onAdClosed();
    }
  };

  useEffect(() => {
    showInterstitial();
  }, []);

  return (
    <div className={`interstitial-placeholder ${className}`}>
      <p className="text-center text-muted-foreground">Carregando anúncio...</p>
    </div>
  );
};
