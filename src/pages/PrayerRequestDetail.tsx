import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Send, 
  Loader2,
  User,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/ui/image-gallery";
import { useToast } from "@/hooks/use-toast";
import { usePrayerRequest, useCreateIntercession, useCreateComment, usePrayerLogs } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { formatTimeAgo } from "@/lib/utils";

export default function PrayerRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPrayModal, setShowPrayModal] = useState(false);
  const [prayComment, setPrayComment] = useState("");
  const [newComment, setNewComment] = useState("");

  // API hooks
  const { data: prayerRequestData, isLoading, error } = usePrayerRequest(id!);
  const { data: prayerLogsData, isLoading: logsLoading } = usePrayerLogs(id!, { limit: 10 });
  const createIntercessionMutation = useCreateIntercession();
  const createCommentMutation = useCreateComment();

  const prayerRequest = prayerRequestData?.data;
  const prayerLogs = prayerLogsData?.data || [];

  const handlePray = () => {
    if (!prayerRequest) return;

    createIntercessionMutation.mutate({
      prayerRequestId: prayerRequest.id,
      comment: prayComment.trim() || undefined
    });

    if (prayComment.trim()) {
      createCommentMutation.mutate({
        prayerRequestId: prayerRequest.id,
        content: prayComment.trim()
      });
    }

    setShowPrayModal(false);
    setPrayComment("");
    
    toast({
      title: "Oração enviada! 🙏",
      description: "Sua intercessão foi registrada com amor.",
    });
  };

  const handleAddComment = () => {
    if (!prayerRequest || !newComment.trim()) return;

    createCommentMutation.mutate({
      prayerRequestId: prayerRequest.id,
      content: newComment.trim()
    });

    setNewComment("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !prayerRequest) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">😔</span>
          <p className="text-muted-foreground mb-4">Pedido não encontrado</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const hasUserInterceded = prayerRequest.intercessions?.some(
    (intercession: any) => intercession.userId === user?.id
  );

  return (
    <div className="min-h-screen bg-gradient-peace">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Detalhes do Pedido</h1>
            <p className="text-sm text-muted-foreground">
              {prayerRequest.category.name}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 pb-20">
        {/* Main Prayer Card */}
        <Card className="prayer-card">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={prayerRequest.user.avatar} />
                <AvatarFallback className="bg-gradient-heaven text-white font-semibold">
                  {prayerRequest.user.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <button
                  onClick={() => navigate(`/user/${prayerRequest.user.id}`)}
                  className="font-semibold text-primary hover:underline cursor-pointer text-left"
                >
                  {prayerRequest.user.name}
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(prayerRequest.createdAt)}
                  {prayerRequest.city && (
                    <>
                      <span>•</span>
                      <MapPin className="h-3 w-3" />
                      {prayerRequest.city}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={prayerRequest.urgent ? "destructive" : "secondary"}>
                  {prayerRequest.urgent ? "Urgente" : prayerRequest.category.name}
                </Badge>
                <Badge variant="outline">
                  {prayerRequest.status === "ACTIVE" ? "Ativo" : 
                   prayerRequest.status === "ANSWERED" ? "Respondido" : "Arquivado"}
                </Badge>
              </div>
            </div>

            <CardTitle className="text-xl mb-3">{prayerRequest.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Images */}
            {prayerRequest.images && prayerRequest.images.length > 0 && (
              <ImageGallery images={prayerRequest.images.map((img: any) => img.url)} />
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {prayerRequest.content}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>{prayerRequest._count?.intercessions || 0} orações</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{prayerRequest._count?.comments || 0} comentários</span>
              </div>
            </div>

            {/* Action Button */}
            {!hasUserInterceded && (
              <Button 
                onClick={() => setShowPrayModal(true)}
                className="w-full bg-gradient-heaven hover:opacity-90"
                size="lg"
              >
                <Heart className="h-4 w-4 mr-2" />
                Orar por este pedido
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Log de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prayerRequest.intercessions && prayerRequest.intercessions.length > 0 ? (
              <div className="space-y-4">
                {prayerRequest.intercessions.map((intercession: any) => (
                  <div key={intercession.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={intercession.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {intercession.user.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <button
                          onClick={() => navigate(`/user/${intercession.user.id}`)}
                          className="font-medium text-primary hover:underline cursor-pointer"
                        >
                          {intercession.user.name}
                        </button>
                        <span className="text-muted-foreground"> orou por este pedido</span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimeAgo(intercession.createdAt)}
                      </div>
                      {intercession.comment && (
                        <p className="text-sm mt-2 p-2 bg-background rounded border-l-2 border-primary/20">
                          {intercession.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma intercessão ainda</p>
                <p className="text-sm">Seja o primeiro a orar por este pedido!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prayer Logs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Orações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando orações...</span>
              </div>
            ) : prayerLogs.length > 0 ? (
              <div className="space-y-3">
                {prayerLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-green-800 dark:text-green-200">
                          <button
                            onClick={() => navigate(`/user/${log.user.id}`)}
                            className="font-medium text-green-800 dark:text-green-200 hover:underline cursor-pointer"
                          >
                            {log.user.name}
                          </button>
                          {" "}orou por este pedido
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(log.date).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ainda não há registros de orações para este pedido.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comentários ({prayerRequest._count?.comments || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Adicione um comentário de apoio..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  size="sm"
                >
                  {createCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Comentar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments List */}
            {prayerRequest.comments && prayerRequest.comments.length > 0 ? (
              <div className="space-y-4">
                {prayerRequest.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {comment.user.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <button
                          onClick={() => navigate(`/user/${comment.user.id}`)}
                          className="font-medium text-sm text-primary hover:underline cursor-pointer"
                        >
                          {comment.user.name}
                        </button>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-3">
                        {formatTimeAgo(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum comentário ainda</p>
                <p className="text-sm">Seja o primeiro a comentar!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prayer Modal */}
      <Dialog open={showPrayModal} onOpenChange={setShowPrayModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Orar por este pedido 🙏</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sua oração será registrada e o autor do pedido será notificado.
            </p>
            <Textarea
              placeholder="Deixe uma mensagem de apoio (opcional)..."
              value={prayComment}
              onChange={(e) => setPrayComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrayModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePray}
              disabled={createIntercessionMutation.isPending}
              className="bg-gradient-heaven"
            >
              {createIntercessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              Confirmar Oração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
