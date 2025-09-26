import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  Globe,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Clock,
  MessageCircle,
  Zap,
  Crown,
  Flame,
  HandHeart,
  UserCheck,
  Target,
  Infinity,
  ChevronDown,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    intercessors: 0,
    pastors: 0,
    warriors: 0
  });

  const testimonials = [
    {
      name: "Maria Silva",
      text: "Postei um pedido de oração pela cura da minha mãe e em 2 horas já tinha 50 pessoas orando! Deus respondeu de forma sobrenatural.",
      location: "São Paulo, SP",
      type: "Cura Divina"
    },
    {
      name: "Pastor João Santos",
      text: "Como intercessor ministerial, encontrei aqui um campo missionário digital. Oro diariamente por centenas de pedidos e vejo milagres acontecerem.",
      location: "Rio de Janeiro, RJ",
      type: "Intercessor Ministerial"
    },
    {
      name: "Ana Costa",
      text: "Estava passando por uma crise financeira. A comunidade orou comigo e em uma semana Deus abriu portas que pareciam impossíveis!",
      location: "Belo Horizonte, MG",
      type: "Provisão Divina"
    },
    {
      name: "Missionário Carlos",
      text: "Uso o Luminews para mobilizar oração pelas missões. É impressionante ver como a oração coletiva move montanhas!",
      location: "Manaus, AM",
      type: "Missões"
    }
  ];



  const features = [
    {
      icon: Target,
      title: "Poste Seu Pedido",
      description: "Compartilhe sua necessidade e tenha um exército de intercessores orando por você em minutos",
      highlight: true
    },
    {
      icon: Crown,
      title: "Intercessores Ministeriais",
      description: "Pessoas com chamado específico para intercessão dedicam tempo diário orando pelos pedidos",
      highlight: true
    },
    {
      icon: Users,
      title: "Oração Coletiva",
      description: "Multiplique o poder da sua oração com centenas de irmãos orando juntos pelo mesmo propósito"
    },
    {
      icon: Zap,
      title: "Respostas Rápidas",
      description: "Veja como Deus age rapidamente quando Seu povo se une em oração e concordância"
    },
    {
      icon: Globe,
      title: "Alcance Global",
      description: "Conecte-se com cristãos do mundo inteiro, criando uma rede global de oração"
    },
    {
      icon: Shield,
      title: "Ambiente Sagrado",
      description: "Espaço protegido e consagrado onde cada pedido é tratado com reverência e amor"
    }
  ];

  const getIntercessorTypes = () => [
    {
      icon: Crown,
      title: "Intercessores Ministeriais",
      description: "Pessoas com chamado específico de Deus para o ministério de intercessão",
      count: stats.intercessors > 0 ? `${stats.intercessors}+` : "0",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Flame,
      title: "Guerreiros de Oração",
      description: "Cristãos dedicados que oram intensamente pelos pedidos urgentes",
      count: stats.warriors > 0 ? `${stats.warriors}+` : "0",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: HandHeart,
      title: "Pastores e Líderes",
      description: "Liderança espiritual que intercede e abençoa a comunidade",
      count: stats.pastors > 0 ? `${stats.pastors}+` : "0",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: UserCheck,
      title: "Membros Ativos",
      description: "Irmãos em Cristo que oram regularmente uns pelos outros",
      count: stats.totalUsers > 0 ? `${stats.totalUsers}+` : "0",
      color: "from-green-500 to-emerald-600"
    }
  ];

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();

    return () => {
      clearInterval(testimonialInterval);
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        <div className="space-x-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Entrar
          </Button>
          <Button onClick={() => navigate('/register')}>
            Cadastrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
        </div>

        <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-200 hover:to-purple-200 border-0 px-6 py-2 text-lg">
          <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
          Corrente de Oração Global
        </Badge>

        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent leading-tight animate-fade-in">
          Luminews
        </h1>

        <p className="text-2xl md:text-3xl text-gray-700 mb-6 max-w-4xl mx-auto font-medium">
          Tenha um <span className="text-purple-600 font-bold">exército de intercessores</span> orando por você
        </p>

        <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 max-w-5xl mx-auto italic bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          "Enquanto cuidamos uns dos outros, Deus cuida de nós"
        </p>

        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 mb-12 max-w-4xl mx-auto">
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            <strong>Poste seu pedido</strong> e em minutos tenha <strong>centenas de cristãos orando</strong> por você,
            incluindo <strong>intercessores com chamado ministerial</strong> que dedicam suas vidas à oração!
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-1">2 min</div>
              <div className="text-sm text-gray-600">Tempo médio para primeira oração</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600 mb-1">50+</div>
              <div className="text-sm text-gray-600">Orações por pedido em média</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Intercessores sempre ativos</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            onClick={handleGetStarted}
          >
            <Target className="mr-3 w-6 h-6" />
            Postar Meu Primeiro Pedido
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
            onClick={scrollToFeatures}
          >
            <ChevronDown className="mr-2 w-5 h-5" />
            Ver Como Funciona
          </Button>
        </div>


      </section>

      {/* Biblical Quote Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Flame className="w-16 h-16 text-yellow-400 mx-auto mb-6 animate-pulse" />
            </div>

            <blockquote className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                "A Oração de um justo
              </span>
              <br />
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                pode muito em sua eficácia"
              </span>
            </blockquote>

            <p className="text-xl text-blue-100 mb-12 font-medium">
              Tiago 5:16
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <Infinity className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Poder Infinito</h3>
                <p className="text-blue-100">
                  Quando os justos se unem em oração, não há limites para o que Deus pode fazer
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Eficácia Divina</h3>
                <p className="text-blue-100">
                  Cada oração feita em fé move o coração de Deus e transforma realidades
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Autoridade Espiritual</h3>
                <p className="text-blue-100">
                  Unidos em Cristo, exercemos a autoridade que Ele nos deu sobre toda circunstância
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-8 rounded-2xl border border-yellow-400/30">
              <p className="text-2xl text-white font-semibold mb-4">
                Imagine ter <span className="text-yellow-300">milhares de justos</span> orando pelo seu pedido...
              </p>
              <p className="text-xl text-blue-100">
                Esse é o poder que você encontra no Luminews!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Army of Intercessors Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-purple-100 text-purple-800 px-6 py-2 text-lg">
              <Crown className="w-5 h-5 mr-2" />
              Exército de Intercessores
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Conheça Quem Ora Por Você
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa comunidade é formada por diferentes tipos de intercessores, cada um com seu chamado específico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {getIntercessorTypes().map((type, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${type.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <type.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{type.count}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-2xl text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                🔥 Quando você posta um pedido, TODOS eles são notificados!
              </h3>
              <p className="text-lg opacity-90">
                Imagine ter pastores, intercessores ministeriais e milhares de irmãos orando especificamente pelo seu pedido.
                Esse é o poder da oração coletiva no Luminews!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Como Funciona o Poder da Oração Coletiva
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como milhares de cristãos se unem para criar milagres através da oração
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  feature.highlight
                    ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200'
                    : 'bg-white'
                }`}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                    feature.highlight
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  {feature.highlight && (
                    <Badge className="mb-4 bg-purple-100 text-purple-800">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How it Works Process */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Seu Pedido em 4 Passos Simples
            </h3>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  1
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Poste seu Pedido</h4>
                <p className="text-gray-600 text-sm">Compartilhe sua necessidade de oração de forma segura</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  2
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Notificação Instantânea</h4>
                <p className="text-gray-600 text-sm">Milhares de intercessores são notificados imediatamente</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  3
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Oração Coletiva</h4>
                <p className="text-gray-600 text-sm">Centenas de pessoas começam a orar pelo seu pedido</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  4
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Milagre Acontece</h4>
                <p className="text-gray-600 text-sm">Deus responde através do poder da oração unida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Hidden for now */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-100 text-green-800 px-6 py-2 text-lg">
              <Heart className="w-5 h-5 mr-2" />
              Milagres Reais
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Vidas Transformadas Pelo Poder da Oração
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Testemunhos reais de como Deus tem respondido às orações da nossa comunidade
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Testimonial Type Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {testimonials[currentTestimonial].type}
                    </Badge>
                  </div>

                  <div className="p-12 text-center">
                    <div className="mb-8">
                      <div className="flex justify-center mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                        ))}
                      </div>

                      <blockquote className="text-2xl md:text-3xl text-gray-700 italic mb-8 leading-relaxed font-medium">
                        "{testimonials[currentTestimonial].text}"
                      </blockquote>

                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 text-xl">
                            {testimonials[currentTestimonial].name}
                          </p>
                          <p className="text-gray-600 text-lg">
                            {testimonials[currentTestimonial].location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            index === currentTestimonial
                              ? 'bg-purple-600 scale-125'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          onClick={() => setCurrentTestimonial(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                <div className="text-gray-700 font-medium">Relatam respostas de oração</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-700 font-medium">Milagres documentados</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">24h</div>
                <div className="text-gray-700 font-medium">Tempo médio de resposta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/10 to-orange-400/10"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-8 bg-yellow-400/20 text-yellow-300 border-yellow-400/30 px-6 py-3 text-lg">
              <Flame className="w-5 h-5 mr-2" />
              Sua Hora é Agora
            </Badge>

            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Pronto para ter um
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent block">
                Exército Orando
              </span>
              por você?
            </h2>

            <p className="text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Não enfrente suas batalhas sozinho. Junte-se a <strong className="text-white">milhares de intercessores</strong> que estão prontos para orar pelo seu pedido <strong className="text-yellow-300">agora mesmo!</strong>
            </p>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 mb-12">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-yellow-300 mb-2">GRATUITO</div>
                  <div className="text-blue-100">Para sempre</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-300 mb-2">SEGURO</div>
                  <div className="text-blue-100">100% Privado</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-300 mb-2">RÁPIDO</div>
                  <div className="text-blue-100">Orações em minutos</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300"
                onClick={handleGetStarted}
              >
                <Target className="mr-4 w-8 h-8" />
                POSTAR MEU PEDIDO AGORA
                <ArrowRight className="ml-4 w-8 h-8" />
              </Button>

              <p className="text-blue-200 text-lg">
                ✨ Junte-se a <strong>centenas de cristãos</strong> que já experimentaram o poder da oração coletiva
              </p>

              <div className="flex justify-center items-center space-x-8 text-blue-200 text-sm">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Ambiente Seguro
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Comunidade Cristã
                </div>
                <div className="flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Intercessores Ministeriais
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Luminews</span>
          </div>
          
          <p className="text-gray-400 mb-4">
            Edificando o corpo de Cristo através da oração
          </p>
          
          <p className="text-gray-500 text-sm">
            © 2024 Luminews. Feito com ❤️ para a família cristã.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
