import React from 'react';
import { XCircle, ArrowLeft, Crown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useCreateCheckout } from '@/hooks/useSubscription';

export default function SubscriptionCancel() {
  const navigate = useNavigate();
  const createCheckoutMutation = useCreateCheckout();

  const handleTryAgain = () => {
    createCheckoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-peace flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Pagamento Cancelado
            </h1>
            <p className="text-muted-foreground">
              Não se preocupe, nenhuma cobrança foi realizada
            </p>
          </div>

          {/* Message */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Entendemos que às vezes é preciso pensar um pouco mais. 
              Você pode tentar novamente a qualquer momento!
            </p>
          </div>

          {/* Premium Benefits Reminder */}
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Benefícios Premium</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">Experiência sem anúncios</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">Acesso prioritário a novos recursos</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">Apoio direto à comunidade</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleTryAgain}
              disabled={createCheckoutMutation.isPending}
              className="w-full bg-gradient-heaven hover:opacity-90"
              size="lg"
            >
              {createCheckoutMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </>
              )}
            </Button>
            
            <Button
              onClick={() => navigate('/feed')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Apenas R$ 4,99/mês • Cancele a qualquer momento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
