import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Users, 
  Calendar, 
  Shield, 
  BookOpen, 
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  userName = "irmão(ã)"
}) => {
  // Add a small celebration effect when modal opens
  useEffect(() => {
    if (isOpen) {
      // You could add confetti or other celebration effects here
      console.log('🎉 Welcome modal opened for:', userName);
    }
  }, [isOpen, userName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <DialogHeader className="space-y-4 pb-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Heart className="w-8 h-8 text-white animate-bounce" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Seja bem-vindo(a) à nossa comunidade de oração!
          </DialogTitle>
          <p className="text-lg text-gray-600 font-medium">
            Olá, <span className="text-blue-600 font-semibold">{userName}</span>! 🙏
          </p>
          <p className="text-sm text-gray-500 italic">
            Que alegria ter você conosco nesta jornada de fé!
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Aqui você pode:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Compartilhar seus pedidos de oração</span>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Obter apoio de outros irmãos</span>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Criar sua agenda de oração diária</span>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Apadrinhar pedidos de outros irmãos (ao apadrinhar um pedido ele entra automaticamente na sua agenda de oração diária)
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Ter acesso a uma palavra e um devocional diariamente</span>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Fortalecer seus hábitos de leitura da Palavra e oração!</span>
              </div>
            </div>
          </div>

          {/* Features Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-blue-200 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Comunidade</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Conecte-se com irmãos em Cristo de todo o Brasil
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Agenda</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Organize sua vida de oração diária
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Devocional</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Palavra e reflexão diária para sua edificação
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Apadrinhamento</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Interceda pelos pedidos de outros irmãos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Special Tip */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Nossa dica:
            </h4>
            <p className="text-gray-700 leading-relaxed">
              Fique à vontade para postar os pedidos que forem importantes para você. Deus se importa com os detalhes da nossa vida. No entanto, <strong>priorize orar pelos OUTROS</strong>. Enquanto cuidamos das necessidades dos outros, Deus cuida das nossas!
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 transform"
            >
              Começar minha jornada de oração! 🙏
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
