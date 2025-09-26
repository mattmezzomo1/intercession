import React, { useEffect } from 'react';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh user data to get updated subscription status
    if (sessionId) {
      refreshUser();
      toast({
        title: "Bem-vindo ao Premium! 🎉",
        description: "Sua assinatura foi ativada com sucesso!",
      });
    }
  }, [sessionId, refreshUser, toast]);

  return (
    <div className="min-h-screen bg-gradient-peace flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Sua assinatura Premium foi ativada com sucesso
            </p>
          </div>

          {/* Premium Badge */}
          <div className="flex items-center justify-center gap-2 p-3 bg-gradient-heaven/10 rounded-lg">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Você agora é Premium!</span>
          </div>

          {/* Benefits */}
          <div className="space-y-3 text-left">
            <h3 className="font-semibold text-center">Seus benefícios incluem:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Experiência sem anúncios</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Acesso prioritário a novos recursos</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Apoio direto à comunidade</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Suporte prioritário</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/feed')}
              className="w-full bg-gradient-heaven hover:opacity-90"
              size="lg"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Começar a Usar
            </Button>
            
            <Button
              onClick={() => navigate('/subscription')}
              variant="outline"
              className="w-full"
            >
              Gerenciar Assinatura
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Obrigado por apoiar nossa comunidade de oração! 🙏
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
