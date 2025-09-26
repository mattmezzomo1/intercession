import React from 'react';
import { ArrowLeft, Crown, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionStatus, useCancelSubscription, useReactivateSubscription, usePaymentHistory } from '@/hooks/useSubscription';
import { subscriptionService } from '@/services/subscription';

export default function Subscription() {
  const navigate = useNavigate();
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus();
  const { data: paymentHistory } = usePaymentHistory(1, 5);
  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();

  const isPremium = subscriptionStatus?.isPremium || false;
  const subscription = subscriptionStatus?.subscription;

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar sua assinatura? Ela será cancelada no final do período atual.')) {
      cancelMutation.mutate();
    }
  };

  const handleReactivate = () => {
    reactivateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace">
        <header className="sticky top-0 z-20 p-4 bg-card/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Assinatura</h1>
          </div>
        </header>
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peace pb-20">
      <header className="sticky top-0 z-20 p-4 bg-card/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Assinatura</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Status da Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Plano</span>
                  <Badge className="bg-gradient-heaven text-white">Premium</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge variant={subscription?.cancelAtPeriodEnd ? "destructive" : "default"}>
                    {subscription?.cancelAtPeriodEnd ? "Cancelando" : "Ativo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Próxima cobrança</span>
                  <span className="text-sm text-muted-foreground">
                    {subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
                {subscription?.cancelAtPeriodEnd && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      Sua assinatura será cancelada em {subscriptionService.getDaysUntilEnd(subscription)} dias
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Você está no plano gratuito</p>
                <Button className="bg-gradient-heaven hover:opacity-90">
                  Assinar Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscription?.cancelAtPeriodEnd ? (
                <Button
                  onClick={handleReactivate}
                  disabled={reactivateMutation.isPending}
                  className="w-full bg-gradient-heaven hover:opacity-90"
                >
                  {reactivateMutation.isPending ? "Reativando..." : "Reativar Assinatura"}
                </Button>
              ) : (
                <Button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  {cancelMutation.isPending ? "Cancelando..." : "Cancelar Assinatura"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {paymentHistory && paymentHistory.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {payment.status === 'SUCCEEDED' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{payment.description || 'Pagamento Premium'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {subscriptionService.formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <Badge variant={payment.status === 'SUCCEEDED' ? 'default' : 'destructive'} className="text-xs">
                        {payment.status === 'SUCCEEDED' ? 'Pago' : 'Falhou'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefícios Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Experiência sem anúncios</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Acesso prioritário a novos recursos</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Apoio direto à comunidade</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Suporte prioritário</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
