import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { usePublicProfile } from "@/hooks/useApi";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Heart, 
  MessageCircle, 
  FileText, 
  Copy, 
  User,
  Crown,
  Loader2
} from "lucide-react";

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedPixKey, setCopiedPixKey] = useState(false);

  const { data: profileData, isLoading, error } = usePublicProfile(userId!);
  const profile = profileData?.data;

  const copyPixKey = async () => {
    if (!profile?.pixKey) return;
    
    try {
      await navigator.clipboard.writeText(profile.pixKey);
      setCopiedPixKey(true);
      toast({
        title: "Chave PIX copiada! 📋",
        description: "A chave PIX foi copiada para a área de transferência.",
      });
      setTimeout(() => setCopiedPixKey(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a chave PIX.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserTypeLabel = (userType: string) => {
    return userType === 'INTERCESSOR' ? 'Intercessor' : 'Usuário';
  };

  const getUserTypeColor = (userType: string) => {
    return userType === 'INTERCESSOR' 
      ? 'bg-gradient-heaven text-white' 
      : 'bg-secondary text-secondary-foreground';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">😔</span>
          <p className="text-muted-foreground mb-4">Perfil não encontrado</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peace">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg truncate">Perfil Público</h1>
              <p className="text-sm text-muted-foreground truncate">{profile.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-gradient-heaven text-white text-2xl font-semibold">
                  {profile.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {/* Name and Type */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <Badge className={getUserTypeColor(profile.userType)}>
                  {profile.userType === 'INTERCESSOR' && <Crown className="h-3 w-3 mr-1" />}
                  {getUserTypeLabel(profile.userType)}
                </Badge>
              </div>

              {/* Location */}
              {(profile.city || profile.country) && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {profile.city && profile.country 
                      ? `${profile.city}, ${profile.country}`
                      : profile.city || profile.country
                    }
                  </span>
                </div>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Membro desde {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <FileText className="h-4 w-4" />
                  <span className="font-semibold text-lg">{profile.stats.prayersShared}</span>
                </div>
                <p className="text-xs text-muted-foreground">Pedidos</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-red-500">
                  <Heart className="h-4 w-4" />
                  <span className="font-semibold text-lg">{profile.stats.intercessionsMade}</span>
                </div>
                <p className="text-xs text-muted-foreground">Orações</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-blue-500">
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-semibold text-lg">{profile.stats.commentsLeft}</span>
                </div>
                <p className="text-xs text-muted-foreground">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Offerings Card */}
        {profile.userType === 'INTERCESSOR' && profile.pixKey && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Apoie este Intercessor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Se você foi abençoado pelas orações deste intercessor, considere fazer uma oferta como forma de gratidão e apoio ao ministério.
              </p>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium">Chave PIX para Ofertas</h4>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">
                    {profile.pixKey}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPixKey}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedPixKey ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Dica: Copie a chave PIX e use no seu aplicativo bancário para fazer a transferência.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivations Card */}
        {profile.userMotivations && (
          <Card>
            <CardHeader>
              <CardTitle>Motivações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(profile.userMotivations).map((motivation: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {motivation}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
