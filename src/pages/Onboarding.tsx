import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Calendar, 
  BookHeart, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Shield,
  Globe,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo à Família Luminews",
      subtitle: "Corrente de Oração",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Uma Comunidade de Fé e Amor
          </h3>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Você está prestes a fazer parte de uma família espiritual onde irmãos em Cristo se edificam mutuamente através da oração.
          </p>
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-800 font-semibold italic">
              "Enquanto cuidamos uns dos outros, Deus cuida de nós"
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Como Funciona Nossa Corrente",
      subtitle: "O Poder da Oração Coletiva",
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Um Ecossistema de Edificação Mútua
            </h3>
            <p className="text-gray-600">
              Cada membro contribui e recebe, criando uma corrente ininterrupta de amor e oração
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Compartilhe</h4>
                </div>
                <p className="text-gray-600">
                  Publique seus pedidos de oração em um ambiente seguro e acolhedor
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Interceda</h4>
                </div>
                <p className="text-gray-600">
                  Ore pelos pedidos dos irmãos e fortaleça a fé da comunidade
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Testemunhe</h4>
                </div>
                <p className="text-gray-600">
                  Compartilhe como Deus respondeu suas orações e inspire outros
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Conecte-se</h4>
                </div>
                <p className="text-gray-600">
                  Forme laços espirituais duradouros com irmãos de todo o Brasil
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Explore as Funcionalidades",
      subtitle: "Tudo que Você Precisa em Um Lugar",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ferramentas para Fortalecer sua Fé
            </h3>
          </div>
          
          <div className="space-y-4">
            <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Feed de Orações</h4>
                  <p className="text-gray-600">Veja e ore pelos pedidos mais recentes da comunidade</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Em Alta</h4>
                  <p className="text-gray-600">Pedidos que mais receberam orações e atenção</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Diário Espiritual</h4>
                  <p className="text-gray-600">Palavra do dia e reflexões para fortalecer sua caminhada</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <BookHeart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Meus Pedidos</h4>
                  <p className="text-gray-600">Acompanhe suas orações e veja como Deus tem respondido</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Valores da Nossa Comunidade",
      subtitle: "Princípios que Nos Guiam",
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Construindo Juntos o Reino de Deus
            </h3>
            <p className="text-gray-600">
              Nossa comunidade é baseada nos valores cristãos de amor, respeito e edificação mútua
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Ambiente Seguro</h4>
                  <p className="text-gray-600 text-sm">
                    Compartilhe seus pedidos com confiança em um espaço protegido e respeitoso
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Amor Genuíno</h4>
                  <p className="text-gray-600 text-sm">
                    Cada oração é feita com amor sincero e desejo de ver o bem do próximo
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Unidade em Cristo</h4>
                  <p className="text-gray-600 text-sm">
                    Independente da denominação, somos um só corpo em Cristo Jesus
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Oração Contínua</h4>
                  <p className="text-gray-600 text-sm">
                    A corrente nunca para - sempre há alguém orando, 24 horas por dia
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <p className="text-center text-gray-700 font-medium">
              "Levai as cargas uns dos outros e, assim, cumprireis a lei de Cristo."
            </p>
            <p className="text-center text-gray-500 text-sm mt-2">Gálatas 6:2</p>
          </div>
        </div>
      )
    },
    {
      title: "Pronto para Começar!",
      subtitle: "Sua Jornada de Fé Começa Agora",
      content: (
        <div className="text-center space-y-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Bem-vindo à Família Luminews!
            </h3>
            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              Você está pronto para fazer parte desta corrente de amor e oração. 
              Vamos juntos edificar o corpo de Cristo!
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-4">Próximos Passos:</h4>
            <div className="space-y-3 text-left max-w-sm mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span className="text-gray-700">Crie sua conta</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span className="text-gray-700">Complete seu perfil</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <span className="text-gray-700">Comece a orar e compartilhar</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    navigate('/register');
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Luminews
          </span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/login')}>
          Já tenho conta
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-2xl mx-auto">
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {steps[currentStep].title}
                </h1>
                <p className="text-lg text-gray-600">
                  {steps[currentStep].subtitle}
                </p>
              </div>
              
              <div className="mb-12">
                {steps[currentStep].content}
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentStep 
                          ? 'bg-blue-600' 
                          : index < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    />
                  ))}
                </div>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleFinish}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center"
                  >
                    Criar Conta
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
