import { useState } from "react";
import { Calendar, Heart, Play, Share2, ChevronLeft, ChevronRight, Loader2, Check, Clock, User, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useTodayWordOfDay,
  useUserLanguages,
  useUserIntercessions,
  useUserPrayerLogs,
  useCreatePrayerLog,
  useCreatePrayerReminder,
  useUserPrayerReminders,
  useCreateShare
} from "@/hooks/useApi";

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

interface CommittedPrayer {
  id: string;
  createdAt: string;
  prayedToday: boolean;
  prayerRequest: {
    id: string;
    title: string;
    content: string;
    category: {
      name: string;
      slug: string;
    };
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
  };
}

export default function Diary() {
  const { toast } = useToast();

  // Prayer states
  const [prayerProgress, setPrayerProgress] = useState(0);
  const [isPraying, setIsPraying] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Reminder form states
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderContent, setReminderContent] = useState('');

  // API hooks
  const { data: userLanguagesData } = useUserLanguages();
  const userLanguages = userLanguagesData?.data || [];
  const primaryLanguage = userLanguages.find(ul => ul.isPrimary)?.language || userLanguages[0]?.language;

  const { data: wordData, isLoading: wordLoading, error: wordError } = useTodayWordOfDay(primaryLanguage?.code);
  const { data: intercessionsData, isLoading: prayersLoading } = useUserIntercessions({ limit: 20 });
  const { data: prayerLogsData } = useUserPrayerLogs({ limit: 100 });
  const { data: prayerRemindersData } = useUserPrayerReminders({ limit: 50 });
  const createPrayerLogMutation = useCreatePrayerLog();
  const createReminderMutation = useCreatePrayerReminder();
  const createShareMutation = useCreateShare();

  const currentWord = wordData?.data;
  const intercessions = intercessionsData?.data || [];
  const prayerLogs = prayerLogsData?.data || [];
  const prayerReminders = prayerRemindersData?.data || [];

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  // Create a set of prayer request IDs that user prayed for today
  const prayedTodaySet = new Set(
    prayerLogs
      .filter((log: any) => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.toISOString().split('T')[0] === todayString;
      })
      .map((log: any) => log.prayerRequest?.id)
      .filter(Boolean)
  );

  // Transform intercessions to the format we need, checking if user prayed today
  const committedPrayers = intercessions.map((intercession: any) => ({
    id: intercession.id,
    type: 'intercession',
    createdAt: intercession.createdAt,
    prayedToday: prayedTodaySet.has(intercession.prayerRequest.id),
    prayerRequest: {
      id: intercession.prayerRequest.id,
      title: intercession.prayerRequest.content.substring(0, 50) + (intercession.prayerRequest.content.length > 50 ? '...' : ''),
      content: intercession.prayerRequest.content,
      category: intercession.prayerRequest.category,
      user: intercession.prayerRequest.user,
      createdAt: intercession.prayerRequest.createdAt
    }
  }));

  // Transform prayer reminders to the same format
  const reminderPrayers = prayerReminders.map((reminder: any) => ({
    id: reminder.id,
    type: 'reminder',
    createdAt: reminder.createdAt,
    prayedToday: false, // Reminders don't have prayer logs yet
    prayerRequest: {
      id: reminder.id,
      title: reminder.title,
      content: reminder.content || reminder.title,
      category: { name: 'Lembrete', slug: 'reminder' },
      user: null, // It's the user's own reminder
      createdAt: reminder.createdAt
    }
  }));

  // Combine and sort all prayers by creation date
  const allPrayers = [...committedPrayers, ...reminderPrayers].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleShare = async () => {
    if (!currentWord) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não há palavra do dia para compartilhar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createShareMutation.mutateAsync({
        contentType: 'WORD_OF_DAY',
        contentId: currentWord.id
      });

      const shareUrl = result.data.shareUrl;

      if (navigator.share) {
        await navigator.share({
          title: 'Palavra do Dia - Luminews',
          text: `Confira esta palavra do dia: ${currentWord.word}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copiado! 📋",
          description: "O link da palavra do dia foi copiado para sua área de transferência.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSharePrayerRequest = async (prayerRequestId: string, title: string) => {
    try {
      const result = await createShareMutation.mutateAsync({
        contentType: 'PRAYER_REQUEST',
        contentId: prayerRequestId
      });

      const shareUrl = result.data.shareUrl;

      if (navigator.share) {
        await navigator.share({
          title: 'Pedido de Oração - Luminews',
          text: `Ore por este pedido: ${title}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copiado! 📋",
          description: "O link do pedido de oração foi copiado para sua área de transferência.",
        });
      }
    } catch (error) {
      console.error('Error sharing prayer request:', error);
    }
  };

  const handlePrayerToggle = () => {
    if (isPraying) {
      setIsPraying(false);
      setPrayerProgress(0);
    } else {
      setIsPraying(true);
      // Simulate prayer progress
      const interval = setInterval(() => {
        setPrayerProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPraying(false);
            toast({
              title: "Oração concluída! 🙏",
              description: "Que Deus abençoe seu tempo de oração.",
            });
            return 100;
          }
          return prev + 1;
        });
      }, 120); // 2 minutes = 120 seconds, so 1% per 1.2 seconds
    }
  };

  const resetPrayer = () => {
    setIsPraying(false);
    setPrayerProgress(0);
  };

  const handleMarkAsPrayed = async (prayerRequestId: string) => {
    try {
      await createPrayerLogMutation.mutateAsync({
        prayerRequestId,
        date: new Date().toISOString()
      });

      toast({
        title: "Oração registrada! 🙏",
        description: "Sua oração foi registrada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar oração",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReminder = async () => {
    if (!reminderTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o lembrete.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReminderMutation.mutateAsync({
        title: reminderTitle.trim(),
        content: reminderContent.trim() || undefined,
      });

      // Reset form and close modal
      setReminderTitle('');
      setReminderContent('');
      setShowReminderModal(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const navigateWord = (direction: 'prev' | 'next') => {
    toast({
      title: "Navegação em desenvolvimento",
      description: "Em breve você poderá navegar entre diferentes dias.",
    });
  };

  if (wordLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Carregando seu diário...</p>
          </div>
        </div>
      </div>
    );
  }

  if (wordError || !currentWord) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Erro ao carregar o diário.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 min-h-screen">
      {/* Header */}
      <header className="p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          <div className="space-y-1 min-w-0 flex-1 mr-2">
            <h1 className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Diário Espiritual
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium truncate">
                {new Date(currentWord.date).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 flex-shrink-0"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 space-y-6 sm:space-y-8 w-full max-w-4xl mx-auto overflow-hidden">
        {/* Word of the Day */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 border-0 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-400/5" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWord('prev')}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <div className="text-center flex-1 mx-2">
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold">
                  Palavra do Dia
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWord('next')}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight break-words">
                {currentWord.word}
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <blockquote className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 italic border-l-4 border-blue-500 pl-4 sm:pl-6 bg-white/50 dark:bg-slate-800/30 p-3 sm:p-4 rounded-r-xl shadow-sm text-responsive">
                "{currentWord.verse}"
              </blockquote>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 sm:px-4 py-1 sm:py-2 rounded-full inline-block">
                  {currentWord.reference}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Devotional */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50/30 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/10 border-0 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-400/5 dark:to-teal-400/5" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-lg sm:text-xl">📖</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 min-w-0">
                {currentWord.devotionalTitle}
              </h3>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
                {currentWord.devotionalContent}
              </p>
              {currentWord.devotionalReflection && (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 sm:p-6 rounded-xl border-l-4 border-emerald-500">
                  <h4 className="text-sm sm:text-base font-semibold text-emerald-800 dark:text-emerald-300 mb-2 sm:mb-3">
                    💭 Reflexão
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                    {currentWord.devotionalReflection}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Guided Prayer */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50/50 to-rose-50/30 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-rose-950/10 border-0 shadow-lg shadow-purple-500/10 dark:shadow-purple-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-400/5 dark:to-pink-400/5" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-lg sm:text-xl">🙏</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 min-w-0 truncate">
                  {currentWord.prayerTitle}
                </h3>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold flex-shrink-0">
                {currentWord.prayerDuration}
              </Badge>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg mb-6 sm:mb-8">
              {currentWord.prayerContent}
            </p>

            {/* Prayer Controls */}
            <div className="space-y-6 hidden">
              {prayerProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Progresso da Oração</span>
                    <span>{Math.round(prayerProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${prayerProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center hidden">
                <Button
                  onClick={handlePrayerToggle}
                  className={`${
                    isPraying
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  } text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
                >
                  {isPraying ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Pausar Oração
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      {prayerProgress > 0 ? "Continuar" : "Iniciar Oração"}
                    </div>
                  )}
                </Button>

                {prayerProgress > 0 && (
                  <Button
                    variant="outline"
                    onClick={resetPrayer}
                    className="px-6 py-3 rounded-xl font-semibold border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    Reiniciar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Committed Prayers Section */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50/50 to-indigo-50/30 dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-indigo-950/10 border-0 shadow-lg shadow-cyan-500/10 dark:shadow-cyan-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-400/5 dark:to-blue-400/5" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-lg sm:text-xl">💝</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 min-w-0">
                  Compromissos de Oração
                </h3>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold">
                  {allPrayers.length} {allPrayers.length === 1 ? 'item' : 'itens'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-950/50 px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm"
                  onClick={() => setShowReminderModal(true)}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Lembrete
                </Button>
              </div>
            </div>

            {prayersLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Carregando orações...</p>
              </div>
            ) : allPrayers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                  Você ainda não tem compromissos de oração ou lembretes.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Visite o feed para interceder por outros ou crie um lembrete!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allPrayers.map((prayer: CommittedPrayer) => (
                  <div
                    key={prayer.id}
                    className="flex items-start gap-4 p-5 bg-white/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90 dark:hover:bg-slate-800/70"
                  >
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            prayer.type === 'reminder'
                              ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {prayer.type === 'reminder' ? '🔒 Lembrete' : prayer.prayerRequest.category.name}
                        </Badge>
                        {prayer.prayedToday && (
                          <Badge className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                            ✓ Orado hoje
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-2">
                          {prayer.prayerRequest.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {prayer.prayerRequest.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                        {prayer.type === 'reminder' ? (
                          <div className="flex items-center gap-1">
                            <span>📝</span>
                            <span className="font-medium">Seu lembrete</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">{prayer.prayerRequest.user.name}</span>
                          </div>
                        )}
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(prayer.prayerRequest.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {prayer.type === 'reminder' ? (
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          Lembrete Pessoal
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant={prayer.prayedToday ? "secondary" : "default"}
                          disabled={prayer.prayedToday || createPrayerLogMutation.isPending}
                          onClick={() => handleMarkAsPrayed(prayer.prayerRequest.id)}
                          className={`shrink-0 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                            prayer.prayedToday
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          {prayer.prayedToday ? (
                            <div className="flex items-center gap-1">
                              <Check className="h-4 w-4" />
                              Orado
                            </div>
                          ) : createPrayerLogMutation.isPending ? (
                            <div className="flex items-center gap-1">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Orando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              Orei hoje
                            </div>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSharePrayerRequest(prayer.prayerRequest.id, prayer.prayerRequest.title)}
                          className="shrink-0 px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Prayer Reminder Modal */}
      <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-0 shadow-2xl">
          <DialogHeader className="space-y-3 pb-6">
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
              Novo Lembrete de Oração
            </DialogTitle>
          </DialogHeader>

          {/* Privacy Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">🔒</span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-2">Lembrete Privado</p>
                <p className="leading-relaxed">
                  Este lembrete será visível apenas para você. Se quiser que outras pessoas orem por isso,
                  <strong className="text-blue-900 dark:text-blue-100"> crie um pedido em "Meus Pedidos"</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Título *
              </Label>
              <Input
                id="title"
                placeholder="Ex: Orar pelo meu pai"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                maxLength={100}
                className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800 transition-all duration-200"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="content" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Descrição (opcional)
              </Label>
              <Textarea
                id="content"
                placeholder="Detalhes sobre o que orar..."
                value={reminderContent}
                onChange={(e) => setReminderContent(e.target.value)}
                rows={4}
                className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowReminderModal(false);
                setReminderTitle('');
                setReminderContent('');
              }}
              className="px-6 py-2 rounded-xl font-semibold border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateReminder}
              disabled={createReminderMutation.isPending || !reminderTitle.trim()}
              className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {createReminderMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </div>
              ) : (
                'Criar Lembrete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
