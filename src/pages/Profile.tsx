import { useState } from "react";
import { Settings, Heart, MessageCircle, Calendar, Award, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const userStats = {
  name: "Ana Santos",
  avatar: "/placeholder.svg",
  joinDate: "Janeiro 2024",
  prayersShared: 23,
  intercessionsMade: 456,
  commentsLeft: 89,
  streak: 15
};

const myPrayers = [
  {
    id: "1",
    content: "Gratidão pela nova oportunidade de trabalho! Deus sempre provê no tempo certo. 🙏",
    category: "Gratidão",
    timeAgo: "2 dias",
    intercessions: 67,
    comments: 12,
    status: "answered"
  },
  {
    id: "2", 
    content: "Pedindo orações para minha cirurgia na próxima semana. Confio que tudo correrá bem.",
    category: "Saúde",
    timeAgo: "1 semana",
    intercessions: 234,
    comments: 45,
    status: "active"
  },
  {
    id: "3",
    content: "Obrigada por todas as orações! Meu pai já está em casa e se recuperando bem. ❤️",
    category: "Saúde", 
    timeAgo: "2 semanas",
    intercessions: 189,
    comments: 67,
    status: "answered"
  }
];

const recentIntercessions = [
  {
    id: "1",
    author: "Pedro Silva",
    content: "Pedindo sabedoria para decisões importantes na empresa...",
    category: "Trabalho",
    timeAgo: "1 h"
  },
  {
    id: "2",
    author: "Maria Oliveira", 
    content: "Minha filha está passando por ansiedade. Peço orações...",
    category: "Família",
    timeAgo: "3 h"
  },
  {
    id: "3",
    author: "Carlos Mendes",
    content: "Gratidão pela cura do meu irmão! Deus é fiel...",
    category: "Gratidão",
    timeAgo: "6 h"
  }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("prayers");

  return (
    <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Meu Perfil</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Profile Section */}
      <div className="p-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userStats.avatar} />
              <AvatarFallback className="bg-gradient-heaven text-white text-lg font-bold">
                {userStats.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{userStats.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Desde {userStats.joinDate}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Award className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">
                  {userStats.streak} dias consecutivos orando
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{userStats.prayersShared}</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-prayer-intercession">{userStats.intercessionsMade}</p>
              <p className="text-xs text-muted-foreground">Orações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{userStats.commentsLeft}</p>
              <p className="text-xs text-muted-foreground">Apoios</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Tabs */}
      <div className="flex-1 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prayers">Meus Pedidos</TabsTrigger>
            <TabsTrigger value="intercessions">Minhas Orações</TabsTrigger>
          </TabsList>

          <TabsContent value="prayers" className="space-y-4 mt-4">
            {myPrayers.map((prayer) => (
              <Card key={prayer.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant={prayer.status === "answered" ? "default" : "secondary"}
                    className={
                      prayer.status === "answered" 
                        ? "bg-prayer-answered text-white" 
                        : ""
                    }
                  >
                    {prayer.status === "answered" ? "Respondido" : "Ativo"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{prayer.timeAgo}</span>
                </div>
                
                <p className="text-sm leading-relaxed mb-3">{prayer.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-prayer-intercession" />
                      <span>{prayer.intercessions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{prayer.comments}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {prayer.category}
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="intercessions" className="space-y-4 mt-4">
            {recentIntercessions.map((intercession) => (
              <Card key={intercession.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{intercession.author}</p>
                  <span className="text-xs text-muted-foreground">{intercession.timeAgo}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{intercession.content}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {intercession.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-prayer-intercession">
                    <Heart className="h-3 w-3" />
                    <span>Você orou</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}