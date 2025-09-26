// AdMob Web SDK Configuration
// Para web, usamos o Google AdSense com configuração mobile-first

declare global {
  interface Window {
    adsbygoogle: any[];
    googletag: any;
  }
}

// Configuração Híbrida: AdSense (Web) + AdMob (Mobile)
export const ADMOB_CONFIG = {
  // Para WEB: Usar AdSense com seus IDs reais
  publisherId: "ca-pub-6053558142089562", // Seu Publisher ID real
  adUnits: {
    // Para web, usamos AdSense com comportamento intersticial
    interstitial: "ca-app-pub-6053558142089562/1008508761", // Seu ID real
    banner: "ca-app-pub-6053558142089562/1008508761", // Mesmo ID para banner
    rewarded: "ca-app-pub-6053558142089562/1008508761" // Mesmo ID para rewarded
  },
  testMode: process.env.NODE_ENV !== 'production'
};

// Classe para gerenciar anúncios AdMob Web
export class AdMobWeb {
  private static instance: AdMobWeb;
  private isInitialized = false;
  private interstitialLoaded = false;

  static getInstance(): AdMobWeb {
    if (!AdMobWeb.instance) {
      AdMobWeb.instance = new AdMobWeb();
    }
    return AdMobWeb.instance;
  }

  // Inicializar AdMob Web
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Carregar script do AdSense
      await this.loadAdSenseScript();
      
      // Configurar para comportamento mobile
      this.setupMobileOptimization();
      
      this.isInitialized = true;
      console.log('AdMob Web initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdMob Web:', error);
      throw error;
    }
  }

  // Carregar script do AdSense (já carregado no index.html)
  private loadAdSenseScript(): Promise<void> {
    return new Promise((resolve) => {
      // Script já está carregado no index.html
      if (window.adsbygoogle) {
        resolve();
        return;
      }

      // Aguardar script carregar
      const checkScript = () => {
        if (window.adsbygoogle) {
          resolve();
        } else {
          setTimeout(checkScript, 100);
        }
      };

      checkScript();
    });
  }

  // Configurar otimizações mobile
  private setupMobileOptimization(): void {
    // Configurar AdSense para comportamento mobile-first
    window.adsbygoogle = window.adsbygoogle || [];
    
    // Auto ads com configuração mobile
    window.adsbygoogle.push({
      google_ad_client: ADMOB_CONFIG.publisherId,
      enable_page_level_ads: true,
      overlays: {bottom: true}
    });
  }

  // Mostrar anúncio intersticial
  async showInterstitial(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Para web, criamos um modal intersticial
      return this.createInterstitialModal();
    } catch (error) {
      console.error('Failed to show interstitial:', error);
      return false;
    }
  }

  // Criar modal intersticial (simulando comportamento mobile)
  private createInterstitialModal(): Promise<boolean> {
    return new Promise((resolve) => {
      // Criar overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // Criar container do anúncio
      const adContainer = document.createElement('div');
      adContainer.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 90vw;
        max-height: 90vh;
        position: relative;
        overflow: hidden;
      `;

      // Botão fechar
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '✕';
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #666;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        z-index: 1;
      `;

      // Elemento do anúncio
      const adElement = document.createElement('ins');
      adElement.className = 'adsbygoogle';
      adElement.style.cssText = 'display:block; width:300px; height:250px;';
      adElement.setAttribute('data-ad-client', ADMOB_CONFIG.publisherId);
      adElement.setAttribute('data-ad-slot', ADMOB_CONFIG.adUnits.interstitial);
      adElement.setAttribute('data-ad-format', 'auto');

      // Montar estrutura
      adContainer.appendChild(closeButton);
      adContainer.appendChild(adElement);
      overlay.appendChild(adContainer);
      document.body.appendChild(overlay);

      // Carregar anúncio
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Error loading ad:', e);
      }

      // Eventos
      const closeAd = () => {
        document.body.removeChild(overlay);
        resolve(true);
      };

      closeButton.addEventListener('click', closeAd);
      
      // Auto-close após 5 segundos
      setTimeout(closeAd, 5000);
    });
  }

  // Mostrar banner responsivo
  createBannerAd(container: HTMLElement, slot?: string): void {
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.cssText = 'display:block; width:100%; height:auto;';
    adElement.setAttribute('data-ad-client', ADMOB_CONFIG.publisherId);
    adElement.setAttribute('data-ad-slot', slot || ADMOB_CONFIG.adUnits.banner);
    adElement.setAttribute('data-ad-format', 'auto');
    adElement.setAttribute('data-full-width-responsive', 'true');

    container.appendChild(adElement);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Error loading banner ad:', e);
    }
  }
}

// Instância singleton
export const admobWeb = AdMobWeb.getInstance();
