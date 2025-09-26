import { useState, useEffect } from "react";
import { ArrowLeft, Image, Tag, Lock, Globe, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { useNavigate } from "react-router-dom";
import { useCategories, useCreatePrayerRequest, useUserLanguages } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { geocodingService } from "@/services/geocoding";
import { useAdControl } from "@/hooks/useAdControl";
import { useCreateCheckout } from "@/hooks/useSubscription";
import { AdWithModal } from "@/components/monetization/AdWithModal";
import { useToast } from "@/hooks/use-toast";

const privacyOptions = [
  { id: "PUBLIC", label: "Público", icon: Globe, description: "Todos podem ver" },
  { id: "FRIENDS", label: "Amigos", icon: Users, description: "Apenas amigos" },
  { id: "PRIVATE", label: "Privado", icon: Lock, description: "Apenas você" }
];

export default function Publish() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [prayerText, setPrayerText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [images, setImages] = useState<string[]>([]);

  // Ad control
  const { trackPost, shouldShowAd, markAdShown, isPremium } = useAdControl();
  const [showAdModal, setShowAdModal] = useState(false);
  const createCheckoutMutation = useCreateCheckout();

  // API hooks
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: userLanguagesData } = useUserLanguages();
  const createPrayerRequestMutation = useCreatePrayerRequest();

  const categories = categoriesData?.data || [];
  const userLanguages = userLanguagesData?.data || [];
  const primaryLanguage = userLanguages.find(ul => ul.isPrimary)?.language || userLanguages[0]?.language;

  // Handle ad modal actions
  const handleCloseAdModal = () => {
    setShowAdModal(false);
    markAdShown();
    navigate("/");
  };

  const handleUpgradeToPremium = async () => {
    createCheckoutMutation.mutate();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !prayerText.trim() || !selectedCategory || !primaryLanguage) return;

    const prayerData: any = {
      title: title.trim(),
      content: prayerText.trim(),
      urgent: isUrgent,
      privacy: privacy as 'PUBLIC' | 'PRIVATE' | 'FRIENDS',
      categoryId: selectedCategory,
      languageId: primaryLanguage.id,
    };

    // Só adiciona imagens se houver alguma
    if (images.length > 0) {
      prayerData.images = images;
    }

    // Tentar obter coordenadas se o usuário não tiver
    let latitude = user?.latitude;
    let longitude = user?.longitude;
    let city = user?.city;
    let country = user?.country;

    // Se não tiver coordenadas mas tiver cidade/país, tentar geocoding
    if ((!latitude || !longitude) && city && country) {
      try {
        const geocodingResult = await geocodingService.getCoordinatesFromCity(city, country);
        if (geocodingResult) {
          latitude = geocodingResult.latitude;
          longitude = geocodingResult.longitude;
          city = geocodingResult.city || city;
          country = geocodingResult.country || country;
        }
      } catch (error) {
        console.log('Geocoding failed during prayer creation:', error);
      }
    }

    // Se ainda não tiver coordenadas, tentar localização atual
    if (!latitude || !longitude) {
      try {
        const currentLocation = await geocodingService.getCurrentLocation();
        if (currentLocation) {
          latitude = currentLocation.latitude;
          longitude = currentLocation.longitude;
          city = city || currentLocation.city;
          country = country || currentLocation.country;
        }
      } catch (error) {
        console.log('Current location failed during prayer creation:', error);
      }
    }

    // Só adiciona localização se os dados existirem
    if (latitude && longitude) {
      prayerData.latitude = latitude;
      prayerData.longitude = longitude;
    }

    if (city) {
      prayerData.city = city;
    }

    if (country) {
      prayerData.country = country;
    }

    createPrayerRequestMutation.mutate(prayerData, {
      onSuccess: () => {
        // Track post for ad control
        trackPost();

        // Show ad modal if needed (for non-premium users)
        if (shouldShowAd && !isPremium) {
          setShowAdModal(true);
        } else {
          navigate("/");
        }
      }
    });
  };

  const canSubmit = title.trim().length > 0 && prayerText.trim().length > 0 && selectedCategory && !createPrayerRequestMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-peace pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 p-4 bg-card/80 backdrop-blur-sm border-b safe-area-top">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="touch-target" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Compartilhar Pedido</h1>
            <p className="text-sm text-muted-foreground">Sua fé em palavras</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Título do pedido</h3>
          <Textarea
            placeholder="Digite um título resumido para seu pedido..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-16 resize-none border-0 bg-muted/30 focus-visible:ring-1"
            maxLength={200}
            rows={2}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Um título claro ajuda outros a entenderem seu pedido</span>
            <span>{title.length}/200</span>
          </div>
        </Card>

        {/* Prayer Text */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Seu pedido de oração</h3>
          <Textarea
            placeholder="Compartilhe aqui seu pedido de oração, gratidão ou motivo de louvor. Lembre-se que suas palavras tocam corações ao redor do mundo..."
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
            className="min-h-32 resize-none border-0 bg-muted/30 focus-visible:ring-1"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Toque os corações com suas palavras</span>
            <span>{prayerText.length}/1000</span>
          </div>
        </Card>

        {/* Category Selection */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categoria
          </h3>
          {categoriesLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carregando categorias...</p>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-4">
              <p className="text-sm text-destructive">Erro ao carregar categorias</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? "bg-gradient-heaven text-white"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Image Upload */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Imagens (opcional)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione até 5 imagens para ilustrar seu pedido
          </p>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            useR2Upload={true}
          />
        </Card>

        {/* Urgency Toggle */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Marcar como urgente</h3>
              <p className="text-sm text-muted-foreground">
                Pedidos urgentes aparecem em destaque
              </p>
            </div>
            <Button
              variant={isUrgent ? "default" : "outline"}
              size="sm"
              onClick={() => setIsUrgent(!isUrgent)}
              className={isUrgent ? "bg-prayer-urgent hover:bg-prayer-urgent/90" : ""}
            >
              {isUrgent ? "Urgente" : "Normal"}
            </Button>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Privacidade</h3>
          <div className="space-y-2">
            {privacyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    privacy === option.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPrivacy(option.id)}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    privacy === option.id ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}>
                    {privacy === option.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Submit Button no final da página */}
        <div className="mt-8 mb-4">
          <Button
            size="lg"
            className="w-full bg-gradient-heaven hover:opacity-90 disabled:opacity-50 touch-target min-h-[52px] text-base font-semibold shadow-lg"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {createPrayerRequestMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Compartilhando...
              </div>
            ) : (
              "Compartilhar Pedido"
            )}
          </Button>
        </div>
      </div>

      {/* Ad Modal */}
      <AdWithModal
        isOpen={showAdModal}
        onClose={handleCloseAdModal}
        onUpgradeToPremium={handleUpgradeToPremium}
      />
    </div>
  );
}