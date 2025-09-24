import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PrayerRequest {
  id: string;
  name: string;
  avatar?: string;
  content: string;
  category: string;
  urgent: boolean;
  timeAgo: string;
  intercessions: number;
  comments: number;
}

const mockPrayerRequests: PrayerRequest[] = [
  {
    id: "1",
    name: "Maria Silva",
    avatar: "/placeholder.svg",
    content: "Peço orações pela recuperação da minha avó que está internada. Ela sempre foi minha inspiração e precisa de forças para se curar. 🙏",
    category: "Saúde",
    urgent: true,
    timeAgo: "2 min",
    intercessions: 42,
    comments: 8
  },
  {
    id: "2", 
    name: "João Santos",
    content: "Gratidão imensa! Consegui o emprego que tanto sonhava. Deus é fiel! Obrigado por todas as orações que recebi aqui. ✨",
    category: "Gratidão",
    urgent: false,
    timeAgo: "15 min",
    intercessions: 127,
    comments: 23
  },
  {
    id: "3",
    name: "Ana Costa",
    avatar: "/placeholder.svg", 
    content: "Meu casamento está passando por dificuldades. Peço sabedoria e restauração para nossa família. Acredito no poder da oração em conjunto.",
    category: "Família",
    urgent: false,
    timeAgo: "1 h",
    intercessions: 89,
    comments: 15
  }
];

export default function Feed() {
  const [currentCard, setCurrentCard] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    setTimeout(() => {
      setCurrentCard(prev => (prev + 1) % mockPrayerRequests.length);
      setSwipeDirection(null);
    }, 300);
  };

  const currentPrayer = mockPrayerRequests[currentCard];

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
              {mockPrayerRequests.length} pedidos aguardando
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
          {mockPrayerRequests[(currentCard + 1) % mockPrayerRequests.length] && (
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
                <AvatarImage src={currentPrayer.avatar} />
                <AvatarFallback className="bg-gradient-heaven text-white font-semibold">
                  {currentPrayer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{currentPrayer.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {currentPrayer.timeAgo}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant={currentPrayer.urgent ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {currentPrayer.category}
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
              <p className="text-foreground leading-relaxed text-base">
                {currentPrayer.content}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-prayer-intercession" />
                  <span>{currentPrayer.intercessions} orações</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{currentPrayer.comments}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-2"
                onClick={() => handleSwipe('left')}
              >
                Passar
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-heaven hover:opacity-90"
                onClick={() => handleSwipe('right')}
              >
                <Heart className="h-4 w-4 mr-2" />
                Orei por Você
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
    </div>
  );
}