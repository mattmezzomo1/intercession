import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Star, Zap, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithAds: () => void;
  onUpgradeToPremium: () => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  onContinueWithAds,
  onUpgradeToPremium
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgradeToPremium();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    onContinueWithAds();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 rounded-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-between items-center">
            <div className="w-6" /> {/* Spacer */}
            <DialogTitle className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
              Apoie Nossa Comunidade
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Explanation */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-heaven rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Os anúncios nos ajudam a manter e crescer este ecossistema de oração, 
              permitindo que mais pessoas encontrem apoio espiritual.
            </p>
          </div>

          {/* Premium Benefits */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-primary">Versão Premium</h3>
                </div>
                <div className="text-2xl font-bold text-primary">R$ 4,99/mês</div>
                <p className="text-sm text-muted-foreground">
                  Ao comprar a versão paga você está ajudando a comunidade a crescer ainda mais rápido!
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">Experiência sem anúncios</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm">Acesso prioritário a novos recursos</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm">Apoio direto à comunidade</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-heaven hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Comprar Versão Premium
                </>
              )}
            </Button>

            <Button
              onClick={handleContinue}
              variant="outline"
              className="w-full py-3 rounded-xl"
              size="lg"
            >
              Continuar Vendo Anúncios
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Cancele a qualquer momento • Sem compromisso
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
