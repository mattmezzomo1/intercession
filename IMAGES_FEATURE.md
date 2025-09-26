# Funcionalidade de Imagens nos Pedidos de Oração

## Visão Geral

Foi implementado suporte completo para imagens nos pedidos de oração. Os usuários agora podem:

- Adicionar até 5 imagens por pedido de oração
- Visualizar imagens em todos os feeds (Feed principal, Meus Pedidos, Em Alta, Perfil)
- Visualizar imagens em modal com navegação
- Upload via drag & drop ou seleção de arquivos

## Componentes Criados

### 1. ImageUpload (`src/components/ui/image-upload.tsx`)

Componente para upload de imagens com as seguintes funcionalidades:
- Suporte a drag & drop
- Seleção múltipla de arquivos
- Preview das imagens selecionadas
- Remoção individual de imagens
- Limite configurável (padrão: 5 imagens)
- Validação de tipos de arquivo (apenas imagens)

**Props:**
- `images: string[]` - Array de URLs das imagens
- `onImagesChange: (images: string[]) => void` - Callback para mudanças
- `maxImages?: number` - Limite máximo (padrão: 5)
- `className?: string` - Classes CSS adicionais

### 2. ImageGallery (`src/components/ui/image-gallery.tsx`)

Componente para exibição de imagens com diferentes layouts:
- **1 imagem**: Layout de imagem única em aspect ratio 16:9
- **2 imagens**: Grid 2x1 com imagens quadradas
- **3+ imagens**: Layout otimizado com primeira imagem maior e indicador "+X" para imagens extras

**Funcionalidades:**
- Modal para visualização em tamanho completo
- Navegação entre imagens no modal
- Contador de imagens
- Layout responsivo

**Props:**
- `images: string[]` - Array de URLs das imagens
- `className?: string` - Classes CSS adicionais

## Páginas Atualizadas

### 1. Publish (`src/pages/Publish.tsx`)
- Adicionado campo de upload de imagens
- Estado `images` para gerenciar imagens selecionadas
- Seção dedicada com título "Imagens (opcional)"

### 2. Feed (`src/pages/Feed.tsx`)
- Interface `PrayerRequest` atualizada com campo `images?: string[]`
- Exibição de imagens após o conteúdo da oração
- Dados mock atualizados com imagens de exemplo

### 3. MyRequests (`src/pages/MyRequests.tsx`)
- Interface `MyPrayerRequest` atualizada com campo `images?: string[]`
- Exibição de imagens nos cards dos pedidos
- Dados mock com imagens de exemplo

### 4. Trending (`src/pages/Trending.tsx`)
- Interface `TrendingPrayer` atualizada com campo `images?: string[]`
- Exibição de imagens nos cards em alta
- Dados mock com imagens de exemplo

### 5. Profile (`src/pages/Profile.tsx`)
- Dados mock atualizados com imagens
- Exibição de imagens nos pedidos do perfil

## Dados Mock

Foram adicionadas imagens de exemplo do Unsplash nos dados mock:
- Imagens relacionadas a saúde, família, trabalho e gratidão
- URLs otimizadas com parâmetros de crop (400x300)
- Diferentes quantidades de imagens por pedido para testar layouts

## Como Usar

### Para Desenvolvedores

1. **Adicionar upload de imagens em um formulário:**
```tsx
import { ImageUpload } from "@/components/ui/image-upload";

const [images, setImages] = useState<string[]>([]);

<ImageUpload
  images={images}
  onImagesChange={setImages}
  maxImages={5}
/>
```

2. **Exibir imagens em um card:**
```tsx
import { ImageGallery } from "@/components/ui/image-gallery";

{prayer.images && prayer.images.length > 0 && (
  <ImageGallery images={prayer.images} />
)}
```

### Para Usuários

1. **Adicionar imagens a um pedido:**
   - Vá para a página "Compartilhar Pedido"
   - Role até a seção "Imagens (opcional)"
   - Clique na área de upload ou arraste imagens
   - Selecione até 5 imagens
   - Use o botão "X" para remover imagens indesejadas

2. **Visualizar imagens:**
   - Clique em qualquer imagem para abrir o modal
   - Use as setas para navegar entre imagens
   - Clique no "X" ou fora do modal para fechar

## Considerações Técnicas

- As imagens são armazenadas como Data URLs (base64) no frontend
- Para produção, seria necessário implementar upload para um serviço de armazenamento
- Os componentes são totalmente responsivos
- Suporte a temas claro/escuro
- Acessibilidade com navegação por teclado no modal

## Próximos Passos

Para uma implementação completa em produção:

1. **Backend Integration:**
   - Endpoint para upload de imagens
   - Armazenamento em cloud (AWS S3, Cloudinary, etc.)
   - Otimização e redimensionamento automático

2. **Melhorias de UX:**
   - Indicador de progresso durante upload
   - Compressão de imagens no cliente
   - Suporte a mais formatos de arquivo

3. **Performance:**
   - Lazy loading das imagens
   - Cache de imagens
   - Otimização de tamanhos para diferentes dispositivos
