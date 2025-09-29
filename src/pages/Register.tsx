import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { geocodingService } from "@/services/geocoding";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    languages: [] as string[],
    motivations: [] as string[]
  });

  // Languages state
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [languagesError, setLanguagesError] = useState<string | null>(null);

  // Motivation options
  const motivationOptions = [
    { id: 'pray_request', label: 'Quero pedir oração' },
    { id: 'pray_for_others', label: 'Quero orar por irmãos e por causas importantes' },
    { id: 'improve_routine', label: 'Quero melhorar minha rotina de oração' },
    { id: 'intercessor_calling', label: 'Sou um intercessor / tenho chamado ministerial para intercessão' },
    { id: 'dedicated_intercessor', label: 'Busco dedicar pelo menos 2 horas por dia para oração por causas dos irmãos' }
  ];

  // Load languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        setLanguagesError(null);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/languages`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setLanguages(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        setLanguagesError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLanguagesLoading(false);
      }
    };

    fetchLanguages();
  }, []); // Empty dependency array - only run once on mount

  // Request location permission early and show status to user
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'unavailable'>('pending');

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (!navigator.geolocation) {
        setLocationPermissionStatus('unavailable');
        return;
      }

      // Check if we already have permission
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });

          if (permission.state === 'granted') {
            setLocationPermissionStatus('granted');
          } else if (permission.state === 'denied') {
            setLocationPermissionStatus('denied');
          } else {
            // Request permission by trying to get location
            navigator.geolocation.getCurrentPosition(
              () => {
                setLocationPermissionStatus('granted');
              },
              (error) => {
                console.error('Error getting location:', error);
                if (error.code === error.PERMISSION_DENIED) {
                  setLocationPermissionStatus('denied');
                } else {
                  setLocationPermissionStatus('denied');
                }
              },
              {
                timeout: 10000,
                enableHighAccuracy: false,
                maximumAge: 300000
              }
            );
          }
        } catch (error) {
          // Fallback for browsers that don't support permissions API
          navigator.geolocation.getCurrentPosition(
            () => {
              setLocationPermissionStatus('granted');
            },
            (error) => {
              console.error('Error getting location:', error);
              setLocationPermissionStatus('denied');
            },
            {
              timeout: 10000,
              enableHighAccuracy: false,
              maximumAge: 300000
            }
          );
        }
      } else {
        // Fallback for browsers that don't support permissions API
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermissionStatus('granted');
          },
          (error) => {
            console.error('Error getting location:', error);
            setLocationPermissionStatus('denied');
          },
          {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 300000
          }
        );
      }
    };

    requestLocationPermission();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageChange = (languageId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked
        ? [...prev.languages, languageId]
        : prev.languages.filter(id => id !== languageId)
    }));
  };

  const handleMotivationChange = (motivationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      motivations: checked
        ? [...prev.motivations, motivationId]
        : prev.motivations.filter(id => id !== motivationId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (formData.motivations.length === 0) {
      toast({
        title: "Selecione pelo menos uma motivação",
        description: "Isso nos ajuda a personalizar a experiência para você.",
        variant: "destructive"
      });
      return;
    }

    if (formData.languages.length === 0) {
      toast({
        title: "Selecione pelo menos um idioma",
        description: "Isso nos ajuda a personalizar o conteúdo para você.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Show loading toast
    toast({
      title: "⏳ Criando sua conta...",
      description: "Aguarde enquanto processamos seus dados",
    });

    try {
      // Get user's location via GPS only
      let latitude: number | undefined;
      let longitude: number | undefined;
      let finalCity: string | undefined;
      let finalCountry: string | undefined;

      // Try to get current location via GPS
      try {
        console.log('Attempting to get current location...');
        const currentLocation = await geocodingService.getCurrentLocation();
        console.log('Current location result:', currentLocation);

        if (currentLocation) {
          latitude = currentLocation.latitude;
          longitude = currentLocation.longitude;
          finalCity = currentLocation.city;
          finalCountry = currentLocation.country;

          console.log('Location data to be sent:', {
            latitude,
            longitude,
            finalCity,
            finalCountry
          });

          const isGeneric = currentLocation.isGeneric;
          toast({
            title: isGeneric ? "📍 Localização aproximada obtida!" : "📍 Localização obtida!",
            description: isGeneric
              ? `${finalCity || 'Coordenadas'}, ${finalCountry || 'obtidas'} (aproximada)`
              : `${finalCity || 'Coordenadas'}, ${finalCountry || 'obtidas'}`,
            duration: isGeneric ? 4000 : 3000,
          });
        } else {
          console.log('No location data received');
        }
      } catch (error) {
        console.log('Current location failed:', error);
        toast({
          title: "⚠️ Localização não obtida",
          description: "Continuando sem localização. Você pode configurar depois no perfil.",
          duration: 5000,
        });
      }

      // Determine user type based on motivations
      const isIntercessor = formData.motivations.includes('dedicated_intercessor');
      const userType = isIntercessor ? 'INTERCESSOR' : 'USER';

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: finalCity || undefined,
        country: finalCountry || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        languages: formData.languages,
        userType: userType,
        userMotivations: JSON.stringify(formData.motivations)
      };

      console.log('Registration payload:', payload);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok && data.success) {
        // Update auth context with token and user data
        login(data.data.token, data.data.user);

        toast({
          title: "🎉 Conta Criada com Sucesso!",
          description: `Bem-vindo(a) ao Intercede Together, ${data.data.user.name}! Redirecionando...`,
          duration: 4000,
        });

        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          languages: [],
          motivations: []
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        let errorMessage = data.error || data.message || "Não foi possível criar a conta";

        if (errorMessage.includes('email')) {
          errorMessage = "Este email já está em uso. Tente outro email.";
        } else if (errorMessage.includes('validation')) {
          errorMessage = "Dados inválidos. Verifique os campos e tente novamente.";
        }

        toast({
          title: "❌ Erro no Cadastro",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = "Erro de conexão. Verifique se o servidor está funcionando.";

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "❌ Erro de Conexão",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-3xl">🙏</span>
            </div>
            <div className="w-10"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Luminews
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Crie sua conta e comece a orar junto com nossa comunidade
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-slate-800 dark:text-slate-200">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-400">
              Junte-se à nossa comunidade de oração
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nome completo *
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email *
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Location permission status */}
              <div className={`space-y-2 p-4 rounded-xl border transition-all duration-200 ${
                locationPermissionStatus === 'granted'
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  : locationPermissionStatus === 'denied'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                  : locationPermissionStatus === 'unavailable'
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                  : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-center gap-2">
                  <MapPin className={`h-4 w-4 ${
                    locationPermissionStatus === 'granted'
                      ? 'text-green-600 dark:text-green-400'
                      : locationPermissionStatus === 'denied'
                      ? 'text-amber-600 dark:text-amber-400'
                      : locationPermissionStatus === 'unavailable'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <Label className={`text-sm font-medium ${
                    locationPermissionStatus === 'granted'
                      ? 'text-green-800 dark:text-green-200'
                      : locationPermissionStatus === 'denied'
                      ? 'text-amber-800 dark:text-amber-200'
                      : locationPermissionStatus === 'unavailable'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    Localização
                  </Label>
                  {locationPermissionStatus === 'granted' && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      ✓ Permitida
                    </span>
                  )}
                  {locationPermissionStatus === 'denied' && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                      ⚠ Negada
                    </span>
                  )}
                  {locationPermissionStatus === 'unavailable' && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                      ✗ Indisponível
                    </span>
                  )}
                  {locationPermissionStatus === 'pending' && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      ⏳ Verificando...
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  {locationPermissionStatus === 'granted' && (
                    <p className="text-green-700 dark:text-green-300">
                      Sua localização será obtida automaticamente durante o cadastro para personalizar o conteúdo.
                    </p>
                  )}
                  {locationPermissionStatus === 'denied' && (
                    <div className="space-y-2">
                      <p className="text-amber-700 dark:text-amber-300">
                        Permissão de localização negada. Você pode configurar sua localização manualmente depois no perfil.
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          💡 Para permitir: clique no ícone de localização na barra de endereços do navegador.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
                          onClick={() => {
                            setLocationPermissionStatus('pending');
                            // Tentar novamente após um pequeno delay
                            setTimeout(() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  () => setLocationPermissionStatus('granted'),
                                  () => setLocationPermissionStatus('denied'),
                                  { timeout: 10000, enableHighAccuracy: false }
                                );
                              }
                            }, 100);
                          }}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  )}
                  {locationPermissionStatus === 'unavailable' && (
                    <p className="text-red-700 dark:text-red-300">
                      Geolocalização não está disponível neste navegador. Você pode configurar sua localização manualmente depois no perfil.
                    </p>
                  )}
                  {locationPermissionStatus === 'pending' && (
                    <p className="text-blue-700 dark:text-blue-300">
                      Verificando permissões de localização...
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Senha *
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-12 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800 transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirmar senha *
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    O que mais condiz com sua situação atual? *
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Selecione uma ou mais opções que descrevem seus objetivos
                  </p>
                </div>

                <div className="space-y-3">
                  {motivationOptions.map((motivation) => (
                    <div key={motivation.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Checkbox
                        id={motivation.id}
                        checked={formData.motivations.includes(motivation.id)}
                        onCheckedChange={(checked) =>
                          handleMotivationChange(motivation.id, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={motivation.id}
                        className="text-sm leading-5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {motivation.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {formData.motivations.includes('dedicated_intercessor') && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🙏</span>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        Você será identificado como Intercessor
                      </p>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Intercessores podem receber doações e têm recursos especiais na plataforma
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Idiomas que você fala *
                  </Label>
                </div>

                {languagesLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Carregando idiomas...</p>
                  </div>
                ) : languagesError ? (
                  <div className="text-center py-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Erro ao carregar idiomas</p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                      {languagesError}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                      Verifique se o backend está rodando e tente novamente
                    </p>
                  </div>
                ) : languages.length === 0 ? (
                  <div className="text-center py-6 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum idioma encontrado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    {languages.map((language) => (
                      <div key={language.id} className="flex items-center space-x-2 p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <Checkbox
                          id={language.id}
                          checked={formData.languages.includes(language.id)}
                          onCheckedChange={(checked) =>
                            handleLanguageChange(language.id, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={language.id}
                          className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-300"
                        >
                          {language.nativeName}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading || formData.languages.length === 0 || formData.motivations.length === 0}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Criar conta
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              {(formData.languages.length === 0 || formData.motivations.length === 0) && !languagesLoading && (
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {formData.motivations.length === 0
                      ? "Selecione pelo menos uma motivação para continuar"
                      : "Selecione pelo menos um idioma para continuar"
                    }
                  </p>
                </div>
              )}
            </form>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Já tem uma conta?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Faça login
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  ← Voltar à página inicial
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
