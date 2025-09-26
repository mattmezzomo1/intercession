import { apiService } from './api';

export interface SubscriptionStatus {
  isPremium: boolean;
  subscription: {
    id: string;
    status: string;
    plan: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    canceledAt?: string;
  } | null;
}

export interface PaymentHistory {
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class SubscriptionService {
  private baseUrl = 'http://localhost:3001/api/subscription';

  async createCheckoutSession(priceId?: string): Promise<{ sessionId: string; url: string }> {
    const response = await apiService.request('/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to create checkout session');
    }

    return response.data;
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await apiService.request('/subscription/status');

    if (!response.success) {
      throw new Error(response.error || 'Failed to get subscription status');
    }

    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    const response = await apiService.request('/subscription/cancel', {
      method: 'POST',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel subscription');
    }
  }

  async reactivateSubscription(): Promise<void> {
    const response = await apiService.request('/subscription/reactivate', {
      method: 'POST',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to reactivate subscription');
    }
  }

  async getPaymentHistory(page = 1, limit = 10): Promise<PaymentHistory> {
    const response = await apiService.request(`/subscription/payments?page=${page}&limit=${limit}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get payment history');
    }

    return response.data;
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(priceId?: string): Promise<void> {
    try {
      const { url } = await this.createCheckoutSession(priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  // Format currency for display
  formatCurrency(amount: number, currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Convert from cents
  }

  // Check if subscription is active
  isSubscriptionActive(subscription: SubscriptionStatus['subscription']): boolean {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    
    return subscription.status === 'ACTIVE' && endDate > now;
  }

  // Get days until subscription ends
  getDaysUntilEnd(subscription: SubscriptionStatus['subscription']): number {
    if (!subscription) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
}

export const subscriptionService = new SubscriptionService();
