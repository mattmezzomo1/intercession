import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Prayer Requests hooks
export const usePrayerRequests = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  urgent?: boolean;
  status?: string;
  language?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
}) => {
  return useQuery({
    queryKey: ['prayerRequests', params],
    queryFn: () => apiService.getPrayerRequests(params),
  });
};

export const useTrendingPrayerRequests = (params?: {
  page?: number;
  limit?: number;
  language?: string;
}) => {
  return useQuery({
    queryKey: ['trendingPrayerRequests', params],
    queryFn: () => apiService.getTrendingPrayerRequests(params),
  });
};

export const usePrayerRequest = (id: string) => {
  return useQuery({
    queryKey: ['prayerRequest', id],
    queryFn: () => apiService.getPrayerRequest(id),
    enabled: !!id,
  });
};

export const useCreatePrayerRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.createPrayerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userPrayerRequests'] });
      toast({
        title: "Pedido de oração criado! 🙏",
        description: "Sua oração foi compartilhada com a comunidade.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar pedido",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePrayerRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updatePrayerRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userPrayerRequests'] });
      toast({
        title: "Pedido atualizado! ✅",
        description: "Suas alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePrayerRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiService.deletePrayerRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userPrayerRequests'] });
      toast({
        title: "Pedido excluído! 🗑️",
        description: "Seu pedido foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

// Intercessions hooks
export const useCreateIntercession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.createIntercession,
    onSuccess: (data, variables) => {
      // Immediately update the cache to remove the prayer request from the list
      queryClient.setQueryData(['prayerRequests'], (oldData: any) => {
        if (!oldData?.data?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.filter((request: any) => request.id !== variables.prayerRequestId)
          }
        };
      });

      // Also invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['prayerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['intercessions'] });
      queryClient.invalidateQueries({ queryKey: ['userIntercessions'] });

      toast({
        title: "Oração enviada! 🙏",
        description: "Sua intercessão foi registrada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao orar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const useUserIntercessions = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['userIntercessions', params],
    queryFn: () => apiService.getUserIntercessions(params),
  });
};

// Comments hooks
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast({
        title: "Comentário enviado! 💬",
        description: "Seu comentário foi adicionado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao comentar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

// Prayer Logs hooks
export const useCreatePrayerLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.createPrayerLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userPrayerLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userCommittedPrayers'] });
      toast({
        title: "Oração registrada! 🙏",
        description: "Sua oração foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar oração",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const usePrayerLogs = (prayerRequestId: string, params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['prayerLogs', prayerRequestId, params],
    queryFn: () => apiService.getPrayerLogs(prayerRequestId, params),
    enabled: !!prayerRequestId,
  });
};

export const useUserPrayerLogs = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['userPrayerLogs', params],
    queryFn: () => apiService.getUserPrayerLogs(params),
  });
};

export const useUserCommittedPrayers = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['userCommittedPrayers', params],
    queryFn: () => apiService.getUserCommittedPrayers(params),
  });
};

// Word of Day hooks
export const useTodayWordOfDay = (language?: string) => {
  return useQuery({
    queryKey: ['wordOfDay', 'today', language],
    queryFn: () => apiService.getTodayWordOfDay(language),
  });
};

export const useWordOfDayByDate = (date: string, language?: string) => {
  return useQuery({
    queryKey: ['wordOfDay', date, language],
    queryFn: () => apiService.getWordOfDayByDate(date, language),
    enabled: !!date,
  });
};

// Categories hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: apiService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Languages hooks
export const useLanguages = () => {
  return useQuery({
    queryKey: ['languages'],
    queryFn: apiService.getLanguages,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserLanguages = () => {
  return useQuery({
    queryKey: ['userLanguages'],
    queryFn: apiService.getUserLanguages,
  });
};

export const useUpdateUserLanguages = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.updateUserLanguages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLanguages'] });
      toast({
        title: "Idiomas atualizados! 🌍",
        description: "Suas preferências de idioma foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar idiomas",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

// User hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: apiService.getUserProfile,
  });
};

export const usePublicProfile = (userId: string) => {
  return useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => apiService.getPublicProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast({
        title: "Perfil atualizado! ✅",
        description: "Suas informações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: apiService.getUserStats,
  });
};

export const useUserPrayerRequests = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['userPrayerRequests', params],
    queryFn: () => apiService.getUserPrayerRequests(params),
  });
};

// Prayer Reminders hooks
export const useUserPrayerReminders = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['userPrayerReminders', params],
    queryFn: () => apiService.getUserPrayerReminders(params),
  });
};

export const useCreatePrayerReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.createPrayerReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrayerReminders'] });
      toast({
        title: "Lembrete criado! 📝",
        description: "Seu lembrete de oração foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar lembrete",
        description: error.response?.data?.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePrayerReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updatePrayerReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrayerReminders'] });
      toast({
        title: "Lembrete atualizado! ✏️",
        description: "Seu lembrete foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar lembrete",
        description: error.response?.data?.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePrayerReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiService.deletePrayerReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPrayerReminders'] });
      toast({
        title: "Lembrete excluído! 🗑️",
        description: "Seu lembrete foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir lembrete",
        description: error.response?.data?.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

// Share hooks
export const useCreateShare = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.createShare,
    onSuccess: (data) => {
      toast({
        title: "Link criado! 🔗",
        description: "Link de compartilhamento criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar link",
        description: error.response?.data?.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};

export const useGetSharedContent = (shareId: string) => {
  return useQuery({
    queryKey: ['sharedContent', shareId],
    queryFn: () => apiService.getSharedContent(shareId),
    enabled: !!shareId,
  });
};

export const useUserSharedContent = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['userSharedContent', params],
    queryFn: () => apiService.getUserSharedContent(params),
  });
};

export const useDeleteShare = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiService.deleteShare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSharedContent'] });
      toast({
        title: "Link removido! 🗑️",
        description: "Link de compartilhamento removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover link",
        description: error.response?.data?.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
};
