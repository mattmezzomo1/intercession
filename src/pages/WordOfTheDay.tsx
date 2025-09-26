import { useState } from "react";
import { Calendar, Heart, Play, Share2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTodayWordOfDay, useWordOfDayByDate, useUserLanguages } from "@/hooks/useApi";

interface WordOfDay {
  id: string;
  date: string;
  word: string;
  verse: string;
  reference: string;
  devotionalTitle: string;
  devotionalContent: string;
  devotionalReflection: string;
  prayerTitle: string;
  prayerContent: string;
  prayerDuration: string;
  languageId: string;
  language: {
    id: string;
    code: string;
    name: string;
    nativeName: string;
  };
}

export default function WordOfTheDay() {
  const { toast } = useToast();

  // Prayer states
  const [prayerProgress, setPrayerProgress] = useState(0);
  const [isPraying, setIsPraying] = useState(false);

  // API hooks
  const { data: userLanguagesData } = useUserLanguages();
  const userLanguages = userLanguagesData?.data || [];
  const primaryLanguage = userLanguages.find(ul => ul.isPrimary)?.language || userLanguages[0]?.language;

  const { data: wordData, isLoading, error } = useTodayWordOfDay(primaryLanguage?.code);

  const currentWord = wordData?.data;

  const handleShare = () => {
    toast({
      title: "Palavra compartilhada! ✨",
      description: "A palavra do dia foi compartilhada com seus amigos.",
    });
  };

  const handlePrayerStart = () => {
    if (isPraying) {
      // Stop prayer
      setIsPraying(false);
      setPrayerProgress(0);
      toast({
        title: "Oração pausada",
        description: "Você pode retomar a qualquer momento.",
      });
    } else {
      // Start prayer
      setIsPraying(true);
      setPrayerProgress(0);

      // Simulate prayer progress (2 minutes = 120 seconds)
      const duration = 120000; // 2 minutes in milliseconds
      const interval = 100; // Update every 100ms
      const increment = (interval / duration) * 100;

      const timer = setInterval(() => {
        setPrayerProgress(prev => {
          const newProgress = prev + increment;
          if (newProgress >= 100) {
            clearInterval(timer);
            setIsPraying(false);
            toast({
              title: "Oração concluída! 🙏",
              description: "Que Deus abençoe seu tempo de oração.",
            });
            return 100;
          }
          return newProgress;
        });
      }, interval);

      toast({
        title: "Oração iniciada 🙏",
        description: "Dedique este tempo para estar com Deus.",
      });
    }
  };



  // For now, we'll disable navigation since we're only showing today's word
  // In the future, this could be enhanced to navigate between different dates
  const navigateWord = (direction: 'prev' | 'next') => {
    // Could implement date-based navigation here
    toast({
      title: "Navegação em desenvolvimento",
      description: "Em breve você poderá navegar entre diferentes dias.",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 min-h-screen">
        <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
                Palavra do Dia
              </h1>
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando palavra do dia...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentWord) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 min-h-screen">
        <header className="p-4 bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-heaven bg-clip-text text-transparent">
                Palavra do Dia
              </h1>
              <p className="text-sm text-muted-foreground">Erro ao carregar</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📖</span>
            <p className="text-muted-foreground mb-4">Erro ao carregar palavra do dia</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 min-h-screen">
      {/* Header */}
      <header className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Palavra do Dia
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(currentWord.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Word of the Day */}
        <Card className="p-6 text-center bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50 border-0 shadow-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWord('prev')}
                className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                Palavra do Dia
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWord('next')}
                className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              {currentWord.word}
            </h2>
          </div>

          <div className="space-y-4">
            <blockquote className="text-lg leading-relaxed text-foreground italic border-l-4 border-blue-500 pl-4 text-left">
              "{currentWord.verse}"
            </blockquote>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {currentWord.reference}
            </p>
          </div>
        </Card>

        {/* Devotional */}
        <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {currentWord.devotionalTitle}
          </h3>

          <div className="space-y-4 text-foreground leading-relaxed">
            <p>{currentWord.devotionalContent}</p>
            {currentWord.devotionalReflection && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-lg border-l-4 border-emerald-500">
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                  💭 Reflexão
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {currentWord.devotionalReflection}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Guided Prayer */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              🙏 {currentWord.prayerTitle}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {currentWord.prayerDuration}
            </Badge>
          </div>

          <p className="text-foreground leading-relaxed mb-6">
            {currentWord.prayerContent}
          </p>
          
          {/* Prayer Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            {prayerProgress > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${prayerProgress}%` }}
                ></div>
              </div>
            )}
            
            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={handlePrayerStart}
                className={`px-8 ${
                  isPraying
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                } text-white`}
              >
                <Play className="h-5 w-5 mr-2" />
                {isPraying ? "Pausar Oração" : "Iniciar Oração"}
              </Button>

              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            

          </div>
        </Card>
      </div>
    </div>
  );
}
