import { Heart, MessageCircle, MoreHorizontal, Clock, Edit, Archive, Loader2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ImageGallery } from "@/components/ui/image-gallery";
import { useUserPrayerRequests, useUpdatePrayerRequest } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
  return `${Math.floor(diffInSeconds / 2592000)}m`;
};

export default function MyRequests() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // API hooks
  const { data: prayerRequestsData, isLoading, error, refetch } = useUserPrayerRequests({
    page: 1,
    limit: 50 // Get more requests to show all user's prayers
  });

  const updatePrayerRequestMutation = useUpdatePrayerRequest();

  const myRequests = prayerRequestsData?.data || [];

  // Handle card click to navigate to prayer details
  const handleCardClick = (requestId: string, event: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/prayer/${requestId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANSWERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ANSWERED': return 'Respondido';
      case 'ARCHIVED': return 'Arquivado';
      default: return 'Ativo';
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'ACTIVE' | 'ANSWERED' | 'ARCHIVED') => {
    try {
      await updatePrayerRequestMutation.mutateAsync({
        id,
        data: { status: newStatus }
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <span className="text-4xl mb-4 block">😔</span>
            <p className="text-muted-foreground mb-4">Erro ao carregar seus pedidos</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
              Meus Pedidos
            </h1>
            <p className="text-sm text-muted-foreground">
              {myRequests.filter(r => r.status === 'ACTIVE').length} pedidos ativos
            </p>
          </div>
          <div className="flex items-center gap-2">
            {myRequests.length > 0 && (
              <Button
                size="sm"
                onClick={() => navigate('/publish')}
                className="bg-gradient-heaven hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Requests List */}
      <div className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Carregando seus pedidos...</p>
          </div>
        ) : myRequests.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">🙏</span>
            <p className="text-muted-foreground mb-2">Você ainda não fez nenhum pedido</p>
            <p className="text-sm text-muted-foreground mb-6">Compartilhe sua primeira oração!</p>
            <Button
              size="lg"
              onClick={() => navigate('/publish')}
              className="bg-gradient-heaven hover:opacity-90"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar primeiro pedido
            </Button>
          </div>
        ) : (
          myRequests.map((request) => (
            <Card
              key={request.id}
              className="overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200"
              onClick={(e) => handleCardClick(request.id, e)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(request.status)} text-xs`}
                    >
                      {getStatusLabel(request.status)}
                    </Badge>
                    <Badge
                      variant={request.urgent ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {request.category?.name || 'Geral'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(request.createdAt)}
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {request.title}
                </h4>

                {/* Content */}
                <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-3">
                  {request.content}
                </p>

                {/* Images */}
                {request.images && request.images.length > 0 && (
                  <div className="mb-3">
                    <ImageGallery images={request.images.map(img => img.url)} />
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-prayer-intercession" />
                      <span>{request._count?.intercessions || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{request._count?.comments || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {request.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleStatusChange(request.id, 'ANSWERED')}
                      disabled={updatePrayerRequestMutation.isPending}
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      Marcar como Respondido
                    </Button>
                  )}
                  {request.status !== 'ARCHIVED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-3 text-xs"
                      onClick={() => handleStatusChange(request.id, 'ARCHIVED')}
                      disabled={updatePrayerRequestMutation.isPending}
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Arquivar
                    </Button>
                  )}
                  {request.status === 'ARCHIVED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleStatusChange(request.id, 'ACTIVE')}
                      disabled={updatePrayerRequestMutation.isPending}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Reativar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}