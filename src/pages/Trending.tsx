import { useState } from "react";
import { TrendingUp, Filter, Heart, MessageCircle, Clock, Crown, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageGallery } from "@/components/ui/image-gallery";
import { useTrendingPrayerRequests } from "@/hooks/useApi";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const categories = ["Todos", "Saúde", "Família", "Gratidão", "Comunidade", "Libertação", "Trabalho"];

export default function Trending() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [page, setPage] = useState(1);
  const [expandedPrayers, setExpandedPrayers] = useState<Set<string>>(new Set());

  // Fetch trending prayer requests
  const { data, isLoading, error } = useTrendingPrayerRequests({
    page,
    limit: 20,
  });

  const prayerRequests = data?.data || [];

  // Filter by category (client-side filtering for now)
  const filteredPrayers = selectedCategory === "Todos"
    ? prayerRequests
    : prayerRequests.filter(prayer => prayer.category?.name === selectedCategory);

  const togglePrayerExpansion = (prayerId: string) => {
    const newExpanded = new Set(expandedPrayers);
    if (newExpanded.has(prayerId)) {
      newExpanded.delete(prayerId);
    } else {
      newExpanded.add(prayerId);
    }
    setExpandedPrayers(newExpanded);
  };

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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando pedidos em alta...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Erro ao carregar pedidos em alta</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : filteredPrayers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum pedido em alta encontrado</p>
          </div>
        ) : (
          filteredPrayers.map((prayer, index) => (
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
                    <AvatarImage src={prayer.user?.avatar} />
                    <AvatarFallback className="bg-gradient-heaven text-white text-sm font-semibold">
                      {prayer.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{prayer.user?.name || 'Usuário'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(prayer.createdAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs mb-1">
                    {prayer.category?.name || 'Geral'}
                  </Badge>
                  <p className="text-xs text-prayer-urgent font-medium">
                    {prayer._count?.intercessions || 0} orações
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="ml-11 mb-3">
                <h4 className="font-semibold mb-2 line-clamp-2">{prayer.title}</h4>
                <p className="text-sm leading-relaxed line-clamp-3">
                  {prayer.content}
                </p>
              </div>

              {/* Images */}
              {prayer.images && prayer.images.length > 0 && (
                <div className="ml-11 mb-3">
                  <ImageGallery images={prayer.images.map(img => img.url)} />
                </div>
              )}

              {/* Comments/Intercessions Indicator */}
              {((prayer.intercessions && prayer.intercessions.length > 0) ||
                (prayer.comments && prayer.comments.length > 0) ||
                (prayer._count?.comments > 0) ||
                (prayer._count?.intercessions > 0)) && (
                <div className="pt-3 border-t ml-11">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                    onClick={() => togglePrayerExpansion(prayer.id)}
                  >
                    {expandedPrayers.has(prayer.id) ? '▼' : '▶'} Ver {
                      prayer._count?.comments || 0
                    } comentário{(prayer._count?.comments || 0) !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}

              {/* Expanded Comments/Intercessions Section */}
              {expandedPrayers.has(prayer.id) && (
                <div className="space-y-3 pt-2 ml-11">
                  {/* Intercessions */}
                  {prayer.intercessions && prayer.intercessions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-prayer-intercession">💬 Comentários:</p>
                      {prayer.intercessions.map((intercession: any) => (
                        <div key={intercession.id} className="bg-prayer-intercession/10 rounded-lg p-3 border-l-2 border-prayer-intercession">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={intercession.user.avatar} />
                              <AvatarFallback className="bg-gradient-heaven text-white text-xs">
                                {intercession.user.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{intercession.user.name}</span>
                            <span className="text-xs text-prayer-intercession font-medium">orou</span>
                          </div>
                          {intercession.comment && (
                            <p className="text-sm text-muted-foreground italic">"{intercession.comment}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Regular Comments */}
                  {prayer.comments && prayer.comments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">💭 Outros comentários:</p>
                      {prayer.comments.map((comment: any) => (
                        <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={comment.user.avatar} />
                              <AvatarFallback className="bg-gradient-heaven text-white text-xs">
                                {comment.user.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{comment.user.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View Details Button */}
              <div className="ml-11 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary p-0 h-auto"
                  onClick={() => navigate(`/prayer/${prayer.id}`)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver detalhes
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between ml-11 pt-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-prayer-intercession" />
                    <span>{(prayer._count?.intercessions || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{prayer._count?.comments || 0}</span>
                  </div>
                </div>
                {prayer.hasUserInterceded ? (
                  <Button size="sm" variant="outline" disabled className="text-prayer-intercession border-prayer-intercession">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                    Já orando
                  </Button>
                ) : (
                  <Button size="sm" className="bg-gradient-heaven hover:opacity-90">
                    <Heart className="h-3 w-3 mr-1" />
                    Orar
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {data?.pagination && data.pagination.page < data.pagination.totalPages && (
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setPage(prev => prev + 1)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando...
              </>
            ) : (
              'Ver mais pedidos em alta'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}