import { useState, useEffect } from "react";
import { X, User, MapPin, Globe, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateUserProfile } from "@/hooks/useApi";
import { useGeolocation } from "@/hooks/useGeolocation";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const updateProfileMutation = useUpdateUserProfile();
  const { getCoordinatesFromCity, getCurrentLocation, isLoading: geoLoading } = useGeolocation();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    bankAccount: (user as any)?.bankAccount || '',
    pixKey: (user as any)?.pixKey || '',
  });

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        bankAccount: (user as any)?.bankAccount || '',
        pixKey: (user as any)?.pixKey || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
  };

  const handleGetCurrentLocation = async () => {
    setLocationStatus('loading');

    try {
      const location = await getCurrentLocation();

      if (location) {
        setLocationStatus('success');

        toast({
          title: "📍 Localização obtida!",
          description: `${location.city}, ${location.country}`,
        });

        // Atualizar perfil diretamente com a nova localização
        const updateData = {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
        };

        updateProfileMutation.mutate(updateData, {
          onSuccess: () => {
            refreshUser();
            toast({
              title: "✅ Localização atualizada!",
              description: "Sua localização foi salva com sucesso.",
            });
          }
        });
      } else {
        setLocationStatus('error');
      }
    } catch (error) {
      setLocationStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Preparar dados para envio
      const updateData: any = {
        name: formData.name.trim(),
        avatar: formData.avatar || undefined,
      };

      // Adicionar campos bancários se o usuário for intercessor
      if ((user as any)?.userType === 'INTERCESSOR') {
        updateData.bankAccount = formData.bankAccount || undefined;
        updateData.pixKey = formData.pixKey || undefined;
      }

      updateProfileMutation.mutate(updateData, {
        onSuccess: () => {
          refreshUser();
          onClose();
          toast({
            title: "✅ Perfil atualizado!",
            description: "Suas informações foram salvas com sucesso.",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Erro ao atualizar perfil",
            description: error.message || "Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao salvar o perfil.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Foto de Perfil</Label>
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatar={formData.avatar}
                onAvatarChange={handleAvatarChange}
                size="lg"
                useR2Upload={true}
              />
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Localização</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={geoLoading || locationStatus === 'loading'}
                className="text-xs"
              >
                {locationStatus === 'loading' ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : locationStatus === 'success' ? (
                  <Check className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <MapPin className="h-3 w-3 mr-1" />
                )}
                {locationStatus === 'loading' ? 'Obtendo...' : 'Verificar localização'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {user?.city && user?.country
                ? `Localização atual: ${user.city}, ${user.country}`
                : "Clique no botão acima para obter sua localização via GPS"
              }
            </p>
          </div>

          {/* Campos bancários para intercessores */}
          {(user as any)?.userType === 'INTERCESSOR' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Informações Financeiras</Label>
              <p className="text-xs text-muted-foreground">
                Como intercessor, você pode receber doações dos usuários
              </p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Conta Bancária</Label>
                  <Input
                    id="bankAccount"
                    name="bankAccount"
                    type="text"
                    placeholder="Banco, Agência, Conta (ex: Nubank - Ag: 0001 - Conta: 12345-6)"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    name="pixKey"
                    type="text"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={formData.pixKey}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updateProfileMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-heaven"
              disabled={updateProfileMutation.isPending || geoLoading}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
