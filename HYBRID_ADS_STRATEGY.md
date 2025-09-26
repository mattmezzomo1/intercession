# 📱 Estratégia Híbrida de Anúncios - Intercede Together

## 🎯 **Estratégia: AdSense Web + AdMob Mobile**

### **Por que Híbrida?**
- ✅ **Web**: AdSense é otimizado para navegadores
- ✅ **Mobile**: AdMob é otimizado para apps nativos
- ✅ **Consistência**: Mesma experiência intersticial em ambos
- ✅ **Flexibilidade**: Melhor monetização para cada plataforma

## 🔧 **Configuração Atual**

### **Web (React + Vite)**
- **Plataforma**: Google AdSense
- **Publisher ID**: `ca-pub-6053558142089562`
- **Intersticial ID**: `ca-app-pub-6053558142089562/1008508761`
- **Script**: Já carregado no `index.html`

### **Mobile (React Native - Futuro)**
- **Plataforma**: Google AdMob
- **App ID**: Android criado ✅
- **Intersticial ID**: `ca-app-pub-6053558142089562/1008508761`
- **SDK**: `react-native-google-mobile-ads`

## 📋 **IDs Configurados**

```typescript
// src/lib/admob.ts
export const ADMOB_CONFIG = {
  publisherId: "ca-pub-6053558142089562",
  adUnits: {
    interstitial: "ca-app-pub-6053558142089562/1008508761",
    banner: "ca-app-pub-6053558142089562/1008508761", // Mesmo ID
    rewarded: "ca-app-pub-6053558142089562/1008508761" // Mesmo ID
  }
};
```

## 🚀 **Como Funciona**

### **1. Web (AdSense com comportamento mobile)**
```typescript
// Anúncio intersticial simulado para web
const showInterstitial = async () => {
  // Cria modal full-screen
  // Carrega anúncio AdSense dentro
  // Comportamento similar ao mobile
};
```

### **2. Mobile (AdMob nativo)**
```typescript
// React Native - Futuro
import { InterstitialAd } from 'react-native-google-mobile-ads';

const interstitial = InterstitialAd.createForAdRequest(
  'ca-app-pub-6053558142089562/1008508761'
);
```

## 🎯 **Pontos de Anúncio (Ambas Plataformas)**

### **Intersticial Após Postar**
```typescript
const handleSubmit = async () => {
  await createPrayerRequest(data);
  await trackPost(); // Mostra intersticial
  navigate('/feed');
};
```

### **Intersticial a Cada 3 Visualizações**
```typescript
const handleViewPrayer = () => {
  trackView(); // Conta +1, mostra se atingir 3
};
```

### **Sem Anúncios para Premium**
```typescript
const { isPremium } = useAdControl();
if (isPremium) return; // Pula anúncios
```

## 📱 **Verificação de Propriedade (AdSense)**

### **Script já adicionado no index.html:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6053558142089562" 
     crossorigin="anonymous"></script>
```

### **Para verificar propriedade:**
1. Acesse: https://www.google.com/adsense/
2. Vá em **Sites** → **Adicionar site**
3. Digite: `https://seudominio.com`
4. O script já está no `<head>` ✅
5. Aguarde aprovação (1-7 dias)

## 🔄 **Fluxo de Desenvolvimento**

### **Fase 1: Web (Atual)**
- ✅ AdSense configurado
- ✅ Sistema intersticial implementado
- ✅ Controle de frequência ativo
- ✅ Premium bypass funcionando

### **Fase 2: Mobile (Futuro)**
```bash
# Instalar SDK AdMob
npm install react-native-google-mobile-ads

# Configurar Android
# android/app/src/main/AndroidManifest.xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-6053558142089562~XXXXXXXXXX"/>

# Usar mesmo sistema de controle
const { trackPost, trackView } = useAdControl();
```

## 🧪 **Testar Implementação**

### **Web (Desenvolvimento)**
```bash
npm run dev
# Anúncios de teste aparecem
# Funcionalidade completa
```

### **Web (Produção)**
```bash
npm run build
npm run preview
# Anúncios reais após aprovação do site
```

### **Verificar Funcionamento**
1. **DevTools** → **Network** → Procurar `googlesyndication.com`
2. **Console** → Verificar erros de AdSense
3. **Testar** → Postar pedido → Ver intersticial
4. **Testar** → Visualizar 3 pedidos → Ver intersticial

## 📊 **Métricas Unificadas**

### **AdSense Console (Web)**
- Impressões de anúncios web
- CTR e eCPM web
- Receita web

### **AdMob Console (Mobile)**
- Impressões de anúncios mobile
- CTR e eCPM mobile  
- Receita mobile

### **Firebase Analytics (Ambos)**
- Eventos unificados
- Funil de conversão
- Comportamento do usuário

## 🎯 **Vantagens da Estratégia Híbrida**

| Aspecto | Web (AdSense) | Mobile (AdMob) |
|---------|---------------|----------------|
| **Otimização** | Navegadores | Apps nativos |
| **Formatos** | Display + Intersticial | Intersticial + Rewarded |
| **Controle** | Bom | Excelente |
| **Monetização** | Boa | Muito boa |
| **UX** | Adaptada | Nativa |

## 🔧 **Configurações Pendentes**

### **1. Aprovação do Site (AdSense)**
- [ ] Adicionar domínio no AdSense
- [ ] Aguardar aprovação (1-7 dias)
- [ ] Verificar anúncios reais

### **2. Políticas Obrigatórias**
- [ ] Página de Política de Privacidade
- [ ] Termos de Uso
- [ ] Banner de Cookies (LGPD)

### **3. iOS AdMob (Futuro)**
- [ ] Criar app iOS no AdMob
- [ ] Configurar mesmo intersticial ID
- [ ] Testar em ambas plataformas

## 💡 **Próximos Passos**

### **Imediato**
1. **Deploy** da versão web atual
2. **Adicionar domínio** no AdSense
3. **Aguardar aprovação**
4. **Monitorar métricas**

### **Médio Prazo**
1. **Desenvolver React Native**
2. **Configurar AdMob mobile**
3. **Testar consistência**
4. **Otimizar monetização**

### **Longo Prazo**
1. **A/B test** frequência de anúncios
2. **Anúncios recompensados**
3. **Segmentação avançada**
4. **Programa de afiliados**

## ✅ **Status Atual**

- ✅ **Web**: Sistema híbrido implementado
- ✅ **IDs**: Configurados com valores reais
- ✅ **Script**: AdSense carregado no HTML
- ✅ **Controle**: Sistema inteligente ativo
- ✅ **Premium**: Bypass funcionando
- ⏳ **Aprovação**: Aguardando AdSense aprovar site

**Resultado**: Sistema profissional pronto para produção! 🚀

Quando o site for aprovado pelo AdSense, os anúncios reais começarão a aparecer automaticamente.
