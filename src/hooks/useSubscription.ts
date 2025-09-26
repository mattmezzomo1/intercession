import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService, SubscriptionStatus, PaymentHistory } from '@/services/subscription';
import { useToast } from '@/hooks/use-toast';

// Get subscription status
export const useSubscriptionStatus = () => {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription', 'status'],
    queryFn: subscriptionService.getSubscriptionStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Create checkout session and redirect
export const useCreateCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (priceId?: string) => subscriptionService.redirectToCheckout(priceId),
    onError: (error: any) => {
      toast({
        title: "Erro no checkout",
        description: error.message || "Não foi possível processar o pagamento.",
        variant: "destructive",
      });
    },
  });
};

// Cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura será cancelada no final do período atual.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Não foi possível cancelar a assinatura.",
        variant: "destructive",
      });
    },
  });
};

// Reactivate subscription
export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: subscriptionService.reactivateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: "Assinatura reativada",
        description: "Sua assinatura foi reativada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reativar",
        description: error.message || "Não foi possível reativar a assinatura.",
        variant: "destructive",
      });
    },
  });
};

// Get payment history
export const usePaymentHistory = (page = 1, limit = 10) => {
  return useQuery<PaymentHistory>({
    queryKey: ['subscription', 'payments', page, limit],
    queryFn: () => subscriptionService.getPaymentHistory(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Check if user is premium (derived from subscription status)
export const useIsPremium = () => {
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus();
  
  return {
    isPremium: subscriptionStatus?.isPremium || false,
    isLoading,
    subscription: subscriptionStatus?.subscription,
  };
};
