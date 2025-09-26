import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Clock, Send, Loader2, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ImageGallery } from "@/components/ui/image-gallery";
import { useToast } from "@/hooks/use-toast";
import { usePrayerRequests, useCreateIntercession, useCreateComment, useCreateShare } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAdControl } from "@/hooks/useAdControl";
import { useCreateCheckout } from "@/hooks/useSubscription";
import { AdWithModal } from "@/components/monetization/AdWithModal";

interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  urgent: boolean;
  privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  status: 'ACTIVE' | 'ANSWERED' | 'ARCHIVED';
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId: string;
  languageId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  language: {
    id: string;
    code: string;
    name: string;
    nativeName: string;
  };
  images: Array<{
    id: string;
    url: string;
    prayerRequestId: string;
  }>;
  distance?: number;
  hasUserInterceded?: boolean;
  _count?: {
    intercessions: number;
    comments: number;
  };
}

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

export default function Feed() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState("");

  // Ad control
  const { shouldShowAd, trackView, markAdShown, isPremium } = useAdControl();
  const [showAdModal, setShowAdModal] = useState(false);
  const createCheckoutMutation = useCreateCheckout();

  // API hooks
  const { data: prayerRequestsData, isLoading, error } = usePrayerRequests({
    page: 1,
    limit: 20,
    latitude: user?.latitude,
    longitude: user?.longitude,
    maxDistance: 50000 // 50km radius
  });

  const createIntercessionMutation = useCreateIntercession();
  const createCommentMutation = useCreateComment();
  const createShareMutation = useCreateShare();

  // Handle ad modal actions
  const handleCloseAdModal = () => {
    setShowAdModal(false);
    markAdShown();
  };

  const handleUpgradeToPremium = async () => {
    createCheckoutMutation.mutate();
  };

  const handleSharePrayerRequest = async (prayerRequest: PrayerRequest) => {
    try {
      const result = await createShareMutation.mutateAsync({
        contentType: 'PRAYER_REQUEST',
        contentId: prayerRequest.id
      });

      const shareUrl = result.data.shareUrl;

      if (navigator.share) {
        await navigator.share({
          title: 'Pedido de Oração - Luminews',
          text: `Ore por este pedido: ${prayerRequest.title}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copiado! 📋",
          description: "O link do pedido de oração foi copiado para sua área de transferência.",
        });
      }
    } catch (error) {
      console.error('Error sharing prayer request:', error);
    }
  };

  const prayerRequests = prayerRequestsData?.data || [];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (prayerRequests.length === 0) return;

    if (direction === 'right') {
      setShowCommentModal(true);
      return;
    }

    // Track view for ad control
    trackView();

    setSwipeDirection(direction);

    setTimeout(() => {
      setCurrentCard(prev => (prev + 1) % prayerRequests.length);
      setSwipeDirection(null);

      // Check if we should show ad after view
      if (shouldShowAd && !isPremium) {
        setShowAdModal(true);
      }
    }, 300);
  };

  const handlePrayWithComment = () => {
    if (prayerRequests.length === 0) return;

    const currentRequest = prayerRequests[currentCard];
    setSwipeDirection('right');
    setShowCommentModal(false);

    // Track view for ad control
    trackView();

    // Create intercession
    createIntercessionMutation.mutate({
      prayerRequestId: currentRequest.id,
      comment: comment.trim() || undefined
    });

    // Create comment if provided
    if (comment.trim()) {
      createCommentMutation.mutate({
        prayerRequestId: currentRequest.id,
        content: comment.trim()
      });
    }

    setTimeout(() => {
      setCurrentCard(prev => (prev + 1) % prayerRequests.length);
      setSwipeDirection(null);
      setComment("");

      // Check if we should show ad after prayer
      if (shouldShowAd && !isPremium) {
        setShowAdModal(true);
      }
    }, 300);
  };

  const handleSkipComment = () => {
    if (prayerRequests.length === 0) return;

    const currentRequest = prayerRequests[currentCard];
    setSwipeDirection('right');
    setShowCommentModal(false);

    // Track view for ad control
    trackView();

    // Create intercession without comment
    createIntercessionMutation.mutate({
      prayerRequestId: currentRequest.id,
      comment: undefined
    });

    setTimeout(() => {
      setCurrentCard(prev => (prev + 1) % prayerRequests.length);
      setSwipeDirection(null);

      // Check if we should show ad after prayer
      if (shouldShowAd && !isPremium) {
        setShowAdModal(true);
      }
    }, 300);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
        <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
                Ore por Eles
              </h1>
              <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando pedidos de oração...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
        <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
                Ore por Eles
              </h1>
              <p className="text-sm text-muted-foreground">Erro ao carregar</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Erro ao carregar pedidos de oração</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  // No prayers state
  if (prayerRequests.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
        <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
                Ore por Eles
              </h1>
              <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🙏</span>
            <p className="text-muted-foreground mb-4">Não há pedidos de oração no momento</p>
            <p className="text-sm text-muted-foreground">Seja o primeiro a compartilhar!</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPrayer = prayerRequests[currentCard];

  return (
    <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
              Ore por Eles
            </h1>
            <p className="text-sm text-muted-foreground">
              {prayerRequests.length} pedidos aguardando
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Cards Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="relative w-full max-w-sm">
          {/* Background card */}
          {prayerRequests[(currentCard + 1) % prayerRequests.length] && (
            <div className="absolute inset-0 prayer-card scale-95 opacity-60 transform rotate-2 bg-card/60">
            </div>
          )}

          {/* Current card */}
          <div
            className={`prayer-card relative w-full p-6 transform transition-all duration-300 ${
              swipeDirection === 'right' ? 'animate-swipe-right' :
              swipeDirection === 'left' ? 'animate-swipe-left' : ''
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentPrayer.user.avatar} />
                <AvatarFallback className="bg-gradient-heaven text-white font-semibold">
                  {currentPrayer.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{currentPrayer.user.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(currentPrayer.createdAt)}
                  {currentPrayer.distance && (
                    <span className="text-xs">• {Math.round(currentPrayer.distance / 1000)}km</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={currentPrayer.urgent ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {currentPrayer.category.name}
                </Badge>
                {currentPrayer.urgent && (
                  <Badge variant="outline" className="text-xs border-prayer-urgent text-prayer-urgent">
                    Urgente
                  </Badge>
                )}
              </div>
            </div>

            {/* Prayer Content */}
            <div className="mb-6">
              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {currentPrayer.title}
              </h3>

              {/* Content */}
              <p className="text-foreground leading-relaxed text-base">
                {currentPrayer.content}
              </p>

              {/* Images */}
              {currentPrayer.images && currentPrayer.images.length > 0 && (
                <ImageGallery images={currentPrayer.images.map(img => img.url)} />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-prayer-intercession" />
                  <span>{currentPrayer._count?.intercessions || 0} orações</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{currentPrayer._count?.comments || 0}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSharePrayerRequest(currentPrayer)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* View Details Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-3 text-primary hover:text-primary"
              onClick={() => navigate(`/prayer/${currentPrayer.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver detalhes completos
            </Button>

            {/* Action Buttons */}
            <div className="flex gap-3 px-1">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-2 min-w-0"
                onClick={() => handleSwipe('left')}
              >
                <span className="truncate">Passar</span>
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-heaven hover:opacity-90 min-w-0"
                onClick={() => handleSwipe('right')}
              >
                <Heart className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">Vou orar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Deslize para a esquerda para passar • Deslize para a direita para orar
        </p>
      </div>

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Deseja adicionar um comentário?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Escreva uma palavra de encorajamento, versículo ou mensagem de fé..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleSkipComment}
              className="w-full sm:w-auto"
            >
              Apenas Orar
            </Button>
            <Button
              onClick={handlePrayWithComment}
              className="w-full sm:w-auto bg-gradient-heaven hover:opacity-90"
            >
              <Send className="h-4 w-4 mr-2" />
              Orar + Comentar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ad Modal */}
      <AdWithModal
        isOpen={showAdModal}
        onClose={handleCloseAdModal}
        onUpgradeToPremium={handleUpgradeToPremium}
      />
    </div>
  );
}