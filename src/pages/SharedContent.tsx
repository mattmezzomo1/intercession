import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Heart, User, Clock, MapPin, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SharedContentData {
  shareId: string;
  contentType: 'WORD_OF_DAY' | 'PRAYER_REQUEST';
  content: any;
  sharedBy: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  createdAt: string;
}

export default function SharedContent() {
  const { shareId } = useParams<{ shareId: string }>();
  const { toast } = useToast();
  const [data, setData] = useState<SharedContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/share/${shareId}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Conteúdo não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar conteúdo compartilhado');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedContent();
    }
  }, [shareId]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.contentType === 'WORD_OF_DAY' ? 'Palavra do Dia' : 'Pedido de Oração',
          text: data?.contentType === 'WORD_OF_DAY' 
            ? `Confira esta palavra do dia: ${data.content.word}`
            : `Ore por este pedido: ${data.content.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado! 📋",
          description: "O link foi copiado para sua área de transferência.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-heaven rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🙏</span>
          </div>
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Conteúdo não encontrado</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link to="/">
            <Button className="w-full">
              Ir para página inicial
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peace">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-heaven rounded-xl flex items-center justify-center">
              <span className="text-lg">🙏</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Luminews</h1>
              <p className="text-xs text-slate-600">Conteúdo Compartilhado</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-10 w-10 rounded-xl hover:bg-slate-100"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Shared by info */}
        {data.sharedBy && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                {data.sharedBy.avatar ? (
                  <img 
                    src={data.sharedBy.avatar} 
                    alt={data.sharedBy.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600">Compartilhado por</p>
                <p className="font-semibold text-slate-800">{data.sharedBy.name}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Content */}
        {data.contentType === 'WORD_OF_DAY' ? (
          <WordOfDayContent content={data.content} />
        ) : (
          <PrayerRequestContent content={data.content} />
        )}

        {/* CTA Section */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-heaven rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Faça parte da nossa comunidade
              </h3>
              <p className="text-slate-600 mb-4">
                Junte-se a milhares de pessoas que oram umas pelas outras todos os dias
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  Criar conta gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full sm:w-auto">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Word of Day Content Component
function WordOfDayContent({ content }: { content: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6" />
          <div>
            <h2 className="text-xl font-bold">Palavra do Dia</h2>
            <p className="text-blue-100">
              {new Date(content.date).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2">{content.word}</h3>
          <p className="text-lg text-blue-100 mb-2">"{content.verse}"</p>
          <p className="text-sm text-blue-200">{content.reference}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-3">{content.devotionalTitle}</h4>
          <p className="text-slate-600 leading-relaxed">{content.devotionalContent}</p>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Reflexão</h4>
          <p className="text-slate-600 leading-relaxed">{content.devotionalReflection}</p>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-3">{content.prayerTitle}</h4>
          <p className="text-slate-600 leading-relaxed mb-3">{content.prayerContent}</p>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {content.prayerDuration}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// Prayer Request Content Component
function PrayerRequestContent({ content }: { content: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              {content.user.avatar ? (
                <img 
                  src={content.user.avatar} 
                  alt={content.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{content.user.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>{new Date(content.createdAt).toLocaleDateString('pt-BR')}</span>
                {content.city && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{content.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {content.category.name}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{content.title}</h3>
            <p className="text-slate-600 leading-relaxed">{content.content}</p>
          </div>
          
          {content.images && content.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {content.images.map((image: any, index: number) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Imagem ${index + 1}`}
                  className="rounded-lg object-cover aspect-square"
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{content._count.intercessions} orações</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💬</span>
              <span>{content._count.comments} comentários</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
