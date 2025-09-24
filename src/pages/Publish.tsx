import { useState } from "react";
import { ArrowLeft, Image, Tag, Lock, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const categories = [
  "Saúde", "Família", "Trabalho", "Financeiro", "Gratidão", 
  "Relacionamentos", "Estudos", "Viagem", "Proteção", "Sabedoria"
];

const privacyOptions = [
  { id: "public", label: "Público", icon: Globe, description: "Todos podem ver" },
  { id: "friends", label: "Amigos", icon: Users, description: "Apenas amigos" },
  { id: "private", label: "Privado", icon: Lock, description: "Apenas você" }
];

export default function Publish() {
  const navigate = useNavigate();
  const [prayerText, setPrayerText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!prayerText.trim() || !selectedCategory) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    navigate("/");
  };

  const canSubmit = prayerText.trim().length > 0 && selectedCategory;

  return (
    <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Compartilhar Pedido</h1>
            <p className="text-sm text-muted-foreground">Sua fé em palavras</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Prayer Text */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Seu pedido de oração</h3>
          <Textarea
            placeholder="Compartilhe aqui seu pedido de oração, gratidão ou motivo de louvor. Lembre-se que suas palavras tocam corações ao redor do mundo..."
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
            className="min-h-32 resize-none border-0 bg-muted/30 focus-visible:ring-1"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Toque os corações com suas palavras</span>
            <span>{prayerText.length}/500</span>
          </div>
        </Card>

        {/* Category Selection */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categoria
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category 
                    ? "bg-gradient-heaven text-white" 
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
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

        {/* Add Image Option */}
        <Card className="p-4">
          <Button variant="outline" className="w-full" disabled>
            <Image className="h-4 w-4 mr-2" />
            Adicionar imagem (em breve)
          </Button>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="p-4 bg-card/80 backdrop-blur-sm border-t">
        <Button
          size="lg"
          className="w-full bg-gradient-heaven hover:opacity-90 disabled:opacity-50"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
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
  );
}