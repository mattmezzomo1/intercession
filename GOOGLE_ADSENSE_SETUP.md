# Configuração do Google AdSense - Intercede Together

## 📋 Pré-requisitos

- Aplicação web funcionando em produção
- Domínio próprio (não localhost)
- Conteúdo original e de qualidade
- Política de privacidade implementada
- Termos de uso definidos

## 🚀 Passo 1: Criar Conta no Google AdSense

1. **Acesse**: https://www.google.com/adsense/
2. **Clique em**: "Começar"
3. **Faça login** com sua conta Google
4. **Selecione seu país/território**
5. **Escolha o tipo de pagamento**

## 🌐 Passo 2: Adicionar seu Site

1. **No painel do AdSense**, clique em "Sites"
2. **Adicione seu site**: `https://seudominio.com`
3. **Aguarde a análise** (pode levar alguns dias)
4. **Verifique a propriedade** do site se solicitado

## 📝 Passo 3: Configurar Políticas Obrigatórias

### Política de Privacidade
Adicione uma página `/privacy-policy` com:

```markdown
# Política de Privacidade - Intercede Together

## Uso de Cookies e Publicidade

Este site utiliza o Google AdSense para exibir anúncios. O Google pode usar cookies para:
- Exibir anúncios relevantes aos usuários
- Medir a eficácia dos anúncios
- Personalizar a experiência publicitária

### Cookies de Terceiros
- Google AdSense utiliza cookies para servir anúncios baseados em visitas anteriores
- Usuários podem optar por não receber cookies visitando: https://www.google.com/privacy/ads/

### Dados Coletados
- Informações de navegação
- Preferências de anúncios
- Dados de interação com anúncios

Para mais informações, consulte a Política de Privacidade do Google.
```

### Termos de Uso
Adicione uma página `/terms-of-service` mencionando:
- Uso de publicidade
- Responsabilidades do usuário
- Limitações de responsabilidade

## 🔧 Passo 4: Implementar o Código AdSense

### 4.1 Obter o Publisher ID

1. **No painel AdSense**, vá em "Contas" → "Informações da conta"
2. **Copie seu Publisher ID**: `ca-pub-XXXXXXXXXXXXXXXXX`

### 4.2 Atualizar o Código

Edite o arquivo `src/components/ads/AdSenseAd.tsx`:

```typescript
// Substitua YOUR_PUBLISHER_ID pelo seu ID real
const PUBLISHER_ID = "ca-pub-1234567890123456"; // SEU ID AQUI

// No componente AdSenseAd, atualize:
script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`;

// E no elemento ins:
data-ad-client={PUBLISHER_ID}
```

### 4.3 Configurar Slots de Anúncio

1. **No AdSense**, vá em "Anúncios" → "Por unidade de anúncio"
2. **Crie 3 unidades de anúncio**:

#### Banner Horizontal (Feed)
- **Nome**: "Intercede Banner Feed"
- **Tipo**: Display responsivo
- **Tamanho**: Responsivo
- **Copie o data-ad-slot**: `1234567890`

#### Retângulo (Modal)
- **Nome**: "Intercede Rectangle Modal"  
- **Tipo**: Display responsivo
- **Tamanho**: Retângulo médio (300x250)
- **Copie o data-ad-slot**: `1234567891`

#### Intersticial (Pós-ação)
- **Nome**: "Intercede Interstitial"
- **Tipo**: Intersticial
- **Copie o data-ad-slot**: `1234567892`

### 4.4 Atualizar os Componentes

```typescript
// Em src/components/ads/AdSenseAd.tsx

const PUBLISHER_ID = "ca-pub-SEU_ID_AQUI";

// Banner Ad Component
export const BannerAd: React.FC<{ className?: string }> = ({ className = '' }) => (
  <AdSenseAd
    adSlot="1234567890" // Seu slot do banner
    adFormat="horizontal"
    className={className}
    style={{ minHeight: '90px' }}
  />
);

// Rectangle Ad Component  
export const RectangleAd: React.FC<{ className?: string }> = ({ className = '' }) => (
  <AdSenseAd
    adSlot="1234567891" // Seu slot do retângulo
    adFormat="rectangle"
    className={className}
    style={{ minHeight: '250px' }}
  />
);

// Interstitial Ad Component
export const InterstitialAd: React.FC<{ className?: string }> = ({ className = '' }) => (
  <AdSenseAd
    adSlot="1234567892" // Seu slot do intersticial
    adFormat="auto"
    className={className}
    style={{ minHeight: '300px', maxWidth: '320px', margin: '0 auto' }}
  />
);
```

## 🔍 Passo 5: Adicionar Meta Tags

Adicione no `index.html` ou `public/index.html`:

```html
<head>
  <!-- Outras meta tags -->
  
  <!-- Google AdSense -->
  <meta name="google-adsense-account" content="ca-pub-SEU_ID_AQUI">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-SEU_ID_AQUI" crossorigin="anonymous"></script>
</head>
```

## 📱 Passo 6: Configurar para Mobile (AdMob)

### 6.1 Criar Conta AdMob
1. **Acesse**: https://admob.google.com/
2. **Vincule com sua conta AdSense**
3. **Adicione seu app** (se for PWA ou app mobile)

### 6.2 Configurar Unidades Mobile
```typescript
// Para dispositivos móveis, use formatos otimizados
const isMobile = window.innerWidth <= 768;

export const ResponsiveAd: React.FC = () => (
  <AdSenseAd
    adSlot={isMobile ? "SLOT_MOBILE" : "SLOT_DESKTOP"}
    adFormat="auto"
    responsive={true}
    style={{ 
      minHeight: isMobile ? '50px' : '90px',
      width: '100%'
    }}
  />
);
```

## ⚙️ Passo 7: Configurações Avançadas

### 7.1 Auto Ads (Opcional)
```html
<!-- Adicione no head para anúncios automáticos -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-SEU_ID_AQUI" crossorigin="anonymous"></script>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "ca-pub-SEU_ID_AQUI",
    enable_page_level_ads: true
  });
</script>
```

### 7.2 Lazy Loading
```typescript
// Em AdSenseAd.tsx, adicione lazy loading
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Carregar anúncio apenas quando visível
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        observer.unobserve(entry.target);
      }
    });
  });

  if (adRef.current) {
    observer.observe(adRef.current);
  }

  return () => observer.disconnect();
}, []);
```

## 🧪 Passo 8: Testar a Implementação

### 8.1 Modo de Teste
```typescript
// Para desenvolvimento, use anúncios de teste
const isProduction = process.env.NODE_ENV === 'production';
const adSlot = isProduction ? "SEU_SLOT_REAL" : "ca-app-pub-3940256099942544/6300978111";
```

### 8.2 Verificar Carregamento
1. **Abra o DevTools**
2. **Vá na aba Network**
3. **Procure por**: `googlesyndication.com`
4. **Verifique se não há erros 404**

## 📊 Passo 9: Monitoramento

### 9.1 Google Analytics
```html
<!-- Vincule com Google Analytics para métricas -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 9.2 Métricas Importantes
- **RPM** (Revenue per Mille): Receita por 1000 impressões
- **CTR** (Click Through Rate): Taxa de cliques
- **CPC** (Cost Per Click): Custo por clique
- **Viewability**: Porcentagem de anúncios visíveis

## ⚠️ Importantes Considerações

### Políticas do AdSense
- ❌ **Não clique** nos próprios anúncios
- ❌ **Não peça** para outros clicarem
- ❌ **Não coloque** anúncios em conteúdo inadequado
- ✅ **Mantenha** conteúdo original e de qualidade
- ✅ **Respeite** as diretrizes de posicionamento

### Performance
- **Lazy loading** para melhor performance
- **Limite** o número de anúncios por página
- **Monitore** o impacto na velocidade do site

### LGPD/GDPR
- **Implemente** banner de cookies
- **Permita** opt-out de anúncios personalizados
- **Mantenha** política de privacidade atualizada

## 🔧 Troubleshooting

### Anúncios não aparecem?
1. Verifique se o site foi aprovado
2. Confirme o Publisher ID
3. Verifique erros no console
4. Aguarde até 24h após implementação

### Receita baixa?
1. Otimize posicionamento dos anúncios
2. Melhore o conteúdo do site
3. Aumente o tráfego orgânico
4. Teste diferentes formatos

## 📞 Suporte

- **Central de Ajuda**: https://support.google.com/adsense/
- **Comunidade**: https://support.google.com/adsense/community
- **Status**: https://www.google.com/appsstatus#hl=pt-BR&v=status

---

## 🚀 Implementação Rápida

### Checklist de Configuração
- [ ] Conta AdSense criada e aprovada
- [ ] Publisher ID obtido
- [ ] 3 unidades de anúncio criadas
- [ ] Código atualizado com IDs reais
- [ ] Política de privacidade publicada
- [ ] Meta tags adicionadas
- [ ] Teste em produção realizado
- [ ] Monitoramento configurado

### Comandos para Atualizar

```bash
# 1. Atualizar o Publisher ID
# Edite: src/components/ads/AdSenseAd.tsx
# Substitua: ca-pub-YOUR_PUBLISHER_ID

# 2. Atualizar os slots
# BannerAd: data-ad-slot="SEU_SLOT_BANNER"
# RectangleAd: data-ad-slot="SEU_SLOT_RECTANGLE"
# InterstitialAd: data-ad-slot="SEU_SLOT_INTERSTITIAL"

# 3. Deploy para produção
npm run build
# Deploy no seu servidor
```

### Exemplo de Configuração Completa

```typescript
// src/components/ads/AdSenseAd.tsx - Configuração final
const PUBLISHER_ID = "ca-pub-1234567890123456"; // SEU ID REAL
const AD_SLOTS = {
  banner: "1234567890",      // Slot do banner
  rectangle: "1234567891",   // Slot do retângulo
  interstitial: "1234567892" // Slot do intersticial
};
```

**⚡ Dica Final**: Após implementar, aguarde alguns dias para ver os primeiros anúncios e receitas. O Google precisa de tempo para analisar seu conteúdo e otimizar os anúncios!
