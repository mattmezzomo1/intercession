import { Heart, MessageCircle, MoreHorizontal, Clock, Edit, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface MyPrayerRequest {
  id: string;
  content: string;
  category: string;
  urgent: boolean;
  timeAgo: string;
  intercessions: number;
  comments: number;
  status: 'active' | 'answered' | 'archived';
}

const mockMyRequests: MyPrayerRequest[] = [
  {
    id: "1",
    content: "Peço orações pela minha entrevista de emprego amanhã. Estou nervoso, mas confio que Deus tem o melhor para mim.",
    category: "Trabalho",
    urgent: false,
    timeAgo: "2 h",
    intercessions: 15,
    comments: 3,
    status: 'active'
  },
  {
    id: "2", 
    content: "Gratidão! Minha mãe se recuperou da cirurgia. Obrigado a todos que oraram! 🙏",
    category: "Gratidão",
    urgent: false,
    timeAgo: "1 dia",
    intercessions: 47,
    comments: 12,
    status: 'answered'
  },
  {
    id: "3",
    content: "Peço sabedoria para tomar uma decisão importante sobre mudança de cidade.",
    category: "Decisões",
    urgent: false,
    timeAgo: "3 dias",
    intercessions: 23,
    comments: 8,
    status: 'active'
  }
];

export default function MyRequests() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered': return 'Respondido';
      case 'archived': return 'Arquivado';
      default: return 'Ativo';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-peace min-h-screen">
      {/* Header */}
      <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
              Meus Pedidos
            </h1>
            <p className="text-sm text-muted-foreground">
              {mockMyRequests.filter(r => r.status === 'active').length} pedidos ativos
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Requests List */}
      <div className="flex-1 p-4 space-y-4">
        {mockMyRequests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className={getStatusColor(request.status)}
                  >
                    {getStatusLabel(request.status)}
                  </Badge>
                  <Badge 
                    variant={request.urgent ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {request.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {request.timeAgo}
                </div>
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-4">
                {request.content}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-prayer-intercession" />
                    <span>{request.intercessions} orações</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{request.comments}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Ver Comentários
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}