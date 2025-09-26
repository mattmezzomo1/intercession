import { useState } from "react";
import { Settings, Heart, MessageCircle, Calendar, Award, Edit, LogOut, Loader2, MapPin, Crown, User, MoreVertical, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageGallery } from "@/components/ui/image-gallery";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats, useUserPrayerRequests, useUserIntercessions, useDeletePrayerRequest } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { EditPrayerRequestModal } from "@/components/EditPrayerRequestModal";
import { EditProfileModal } from "@/components/EditProfileModal";

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

// Helper function to format join date
const formatJoinDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState("prayers");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditPrayerModalOpen, setIsEditPrayerModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<any>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // API hooks
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const { data: prayerRequestsData, isLoading: prayersLoading } = useUserPrayerRequests({
    page: 1,
    limit: 10
  });
  const { data: intercessionsData, isLoading: intercessionsLoading } = useUserIntercessions({
    page: 1,
    limit: 10
  });
  const deletePrayerRequestMutation = useDeletePrayerRequest();

  const stats = statsData?.data;
  const myPrayers = prayerRequestsData?.data || [];
  const myIntercessions = intercessionsData?.data || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditPrayer = (prayer: any) => {
    setSelectedPrayer(prayer);
    setIsEditPrayerModalOpen(true);
  };

  const handleDeletePrayer = (prayer: any) => {
    setSelectedPrayer(prayer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPrayer) {
      deletePrayerRequestMutation.mutate(selectedPrayer.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedPrayer(null);
        }
      });
    }
  };

  if (statsLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
        <header className="p-4 bg-card/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Meu Perfil</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-lg sm:text-xl font-bold truncate mr-2">Meu Perfil</h1>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 sm:h-10 sm:w-10">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <div className="p-4">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0 flex-shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-heaven text-white text-lg sm:text-xl font-bold">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-lg sm:text-xl font-bold truncate">{user?.name}</h2>
                {(user as any)?.userType === 'INTERCESSOR' ? (
                  <div className="flex items-center gap-1 bg-gradient-heaven text-white px-2 py-1 rounded-full text-xs font-medium mx-auto sm:mx-0 w-fit">
                    <Crown className="h-3 w-3" />
                    Intercessor
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-medium mx-auto sm:mx-0 w-fit">
                    <User className="h-3 w-3" />
                    Usuário
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Desde {user?.createdAt ? formatJoinDate(user.createdAt) : 'N/A'}</span>
              </div>

              {(user?.city || user?.country) && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.city}{user.city && user.country && ', '}{user.country}</span>
                </div>
              )}

              {stats?.streak && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Award className="h-4 w-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium text-secondary truncate">
                    {stats.streak} dias consecutivos orando
                  </span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-primary">{stats?.prayersShared || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Pedidos</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-prayer-intercession">{stats?.intercessionsMade || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Orações</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-background/50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-secondary">{stats?.commentsLeft || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Apoios</p>
            </div>
          </div>
        </Card>

        {/* Informações bancárias para intercessores */}
        {(user as any)?.userType === 'INTERCESSOR' && (
          <Card className="p-4 mt-4 bg-gradient-heaven/5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-primary">Informações para Doações</h3>
            </div>

            {((user as any)?.bankAccount || (user as any)?.pixKey) ? (
              <div className="space-y-2">
                {(user as any)?.bankAccount && (
                  <div>
                    <p className="text-xs text-muted-foreground">Conta Bancária:</p>
                    <p className="text-sm font-mono bg-background/50 p-2 rounded border">
                      {(user as any).bankAccount}
                    </p>
                  </div>
                )}

                {(user as any)?.pixKey && (
                  <div>
                    <p className="text-xs text-muted-foreground">Chave PIX:</p>
                    <p className="text-sm font-mono bg-background/50 p-2 rounded border">
                      {(user as any).pixKey}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-muted-foreground">
                  Configure suas informações bancárias no perfil para receber doações
                </p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Content Tabs */}
      <div className="flex-1 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prayers">Meus Pedidos</TabsTrigger>
            <TabsTrigger value="intercessions">Minhas Orações</TabsTrigger>
          </TabsList>

          <TabsContent value="prayers" className="space-y-4 mt-4">
            {prayersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Carregando seus pedidos...</p>
              </div>
            ) : myPrayers.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🙏</span>
                <p className="text-muted-foreground mb-2">Você ainda não fez nenhum pedido</p>
                <p className="text-sm text-muted-foreground">Compartilhe sua primeira oração!</p>
              </div>
            ) : (
              myPrayers.map((prayer) => (
                <Card key={prayer.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={prayer.status === "ANSWERED" ? "default" : "secondary"}
                      className={
                        prayer.status === "ANSWERED"
                          ? "bg-prayer-answered text-white"
                          : ""
                      }
                    >
                      {prayer.status === "ANSWERED" ? "Respondido" :
                       prayer.status === "ACTIVE" ? "Ativo" : "Arquivado"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(prayer.createdAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPrayer(prayer)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePrayer(prayer)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2 line-clamp-2">{prayer.title}</h4>
                  <p className="text-sm leading-relaxed mb-3 line-clamp-3">{prayer.content}</p>

                  {/* Images */}
                  {prayer.images && prayer.images.length > 0 && (
                    <div className="mb-3">
                      <ImageGallery images={prayer.images.map(img => img.url)} />
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary p-0 h-auto"
                      onClick={() => navigate(`/prayer/${prayer.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver detalhes completos
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-prayer-intercession" />
                        <span>{prayer._count?.intercessions || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{prayer._count?.comments || 0}</span>
                    </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {prayer.category.name}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="intercessions" className="space-y-4 mt-4">
            {intercessionsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Carregando suas orações...</p>
              </div>
            ) : myIntercessions.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🙏</span>
                <p className="text-muted-foreground mb-2">Você ainda não orou por ninguém</p>
                <p className="text-sm text-muted-foreground">Vá ao feed e ore por outros!</p>
              </div>
            ) : (
              myIntercessions.map((intercession: any) => (
                <Card key={intercession.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={intercession.prayerRequest.user.avatar} />
                        <AvatarFallback className="bg-gradient-heaven text-white text-xs">
                          {intercession.prayerRequest.user.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{intercession.prayerRequest.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(intercession.createdAt)}
                        </p>
                      </div>
                    </div>
                    {intercession.prayerRequest.category && (
                      <Badge variant="secondary" className="text-xs">
                        {intercession.prayerRequest.category.name}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {intercession.prayerRequest.content}
                  </p>

                  {intercession.comment && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm">
                        <span className="font-medium text-prayer-intercession">Sua oração:</span> {intercession.comment}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Você orou por este pedido</span>
                    <Heart className="h-4 w-4 text-prayer-intercession fill-current" />
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Edit Prayer Request Modal */}
      {selectedPrayer && (
        <EditPrayerRequestModal
          isOpen={isEditPrayerModalOpen}
          onClose={() => {
            setIsEditPrayerModalOpen(false);
            setSelectedPrayer(null);
          }}
          prayerRequest={selectedPrayer}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido de oração?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pedido será permanentemente removido e todas as orações e comentários associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePrayerRequestMutation.isPending}
            >
              {deletePrayerRequestMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}