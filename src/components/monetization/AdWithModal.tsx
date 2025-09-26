import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MonetizationModal } from './MonetizationModal';
import { InterstitialAd } from '../ads/AdSenseAd';
import { useToast } from '@/hooks/use-toast';
import { admobWeb } from '@/lib/admob';

interface AdWithModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeToPremium: () => void;
}

export const AdWithModal: React.FC<AdWithModalProps> = ({
  isOpen,
  onClose,
  onUpgradeToPremium
}) => {
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const { toast } = useToast();

  const handleContinueWithAds = async () => {
    setShowMonetizationModal(false);

    // Mostrar anúncio intersticial diretamente
    try {
      await admobWeb.showInterstitial();
      onClose();
    } catch (error) {
      console.error('Failed to show interstitial:', error);
      onClose();
    }
  };

  const handleUpgrade = async () => {
    try {
      await onUpgradeToPremium();
      setShowMonetizationModal(false);
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCloseAd = () => {
    setShowAd(false);
    onClose();
  };

  // Show monetization modal first
  if (isOpen && !showAd) {
    return (
      <MonetizationModal
        isOpen={!showMonetizationModal ? isOpen : showMonetizationModal}
        onClose={() => {
          setShowMonetizationModal(false);
          onClose();
        }}
        onContinueWithAds={handleContinueWithAds}
        onUpgradeToPremium={handleUpgrade}
      />
    );
  }

  // Anúncios agora são mostrados nativamente via AdMob
  // Não precisamos mais do modal de anúncio

  return null;
};
