import { useState } from "react";
import { TrendingUp, Filter, Heart, MessageCircle, Clock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TrendingPrayer {
  id: string;
  name: string;
  avatar?: string;
  content: string;
  category: string;
  timeAgo: string;
  intercessions: number;
  comments: number;
  trending: boolean;
  growth: number;
}

const trendingPrayers: TrendingPrayer[] = [
  {
    id: "1",
    name: "Pedro Oliveira",
    avatar: "/placeholder.svg",
    content: "Minha esposa está grávida de gêmeos! Pedimos orações para uma gestação saudável e tranquila. Estamos muito felizes! 👶👶",
    category: "Família",
    timeAgo: "3 h",
    intercessions: 324,
    comments: 89,
    trending: true,
    growth: 156
  },
  {
    id: "2",
    name: "Igreja Central",
    content: "Campanha de arrecadação para famílias em situação de vulnerabilidade. Juntos somos mais fortes! Cada oração e ajuda faz a diferença.",
    category: "Comunidade",
    timeAgo: "6 h",
    intercessions: 512,
    comments: 127,
    trending: true,
    growth: 89
  },
  {
    id: "3",
    name: "Carla Mendes",
    avatar: "/placeholder.svg",
    content: "Enfrentando o câncer com fé. Cada dia é uma vitória! Obrigada por todas as orações que fortalecem minha jornada. 💜",
    category: "Saúde",
    timeAgo: "12 h",
    intercessions: 892,
    comments: 203,
    trending: true,
    growth: 234
  },
  {
    id: "4",
    name: "Marcos Silva",
    content: "Consegui me livrar do vício! 2 anos limpo! Deus é fiel e as orações de vocês me sustentaram. Gratidão eterna! 🙏",
    category: "Libertação",
    timeAgo: "1 dia",
    intercessions: 1247,
    comments: 356,
    trending: true,
    growth: 445
  }
];

const categories = ["Todos", "Saúde", "Família", "Gratidão", "Comunidade", "Libertação", "Trabalho"];

export default function Trending() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [timeFilter, setTimeFilter] = useState("24h");

  const filteredPrayers = selectedCategory === "Todos" 
    ? trendingPrayers 
    : trendingPrayers.filter(prayer => prayer.category === selectedCategory);

  return (
    <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-prayer-urgent" />
              Em Alta
            </h1>
            <p className="text-sm text-muted-foreground">
              Pedidos que mais tocaram corações
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Time Filter Tabs */}
        <Tabs value={timeFilter} onValueChange={setTimeFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Category Filter */}
      <div className="p-4 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap transition-all ${
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
      </div>

      {/* Trending List */}
      <div className="flex-1 p-4 space-y-4">
        {filteredPrayers.map((prayer, index) => (
          <Card key={prayer.id} className="p-4 prayer-card">
            {/* Ranking Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? "bg-yellow-500 text-white" :
                  index === 1 ? "bg-gray-400 text-white" :
                  index === 2 ? "bg-yellow-700 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={prayer.avatar} />
                  <AvatarFallback className="bg-gradient-heaven text-white text-sm font-semibold">
                    {prayer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{prayer.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {prayer.timeAgo}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-xs mb-1">
                  {prayer.category}
                </Badge>
                <p className="text-xs text-prayer-urgent font-medium">
                  +{prayer.growth} orações
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed mb-3 ml-11">
              {prayer.content}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between ml-11">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-prayer-intercession" />
                  <span>{prayer.intercessions.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{prayer.comments}</span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Heart className="h-3 w-3 mr-1" />
                Orar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="p-4">
        <Button variant="outline" className="w-full">
          Ver mais pedidos em alta
        </Button>
      </div>
    </div>
  );
}