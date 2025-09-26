# Sistema de Upload de Imagens - Cloudflare R2

## 📋 Visão Geral

O sistema de upload foi completamente integrado com o Cloudflare R2 para armazenar imagens de forma eficiente e escalável. Suporta:

- ✅ Upload de imagens para pedidos de oração (até 5 imagens)
- ✅ Upload de fotos de perfil (avatars)
- ✅ Otimização automática de imagens (redimensionamento e compressão)
- ✅ Compatibilidade com uploads base64 (para migração)
- ✅ Interface drag & drop intuitiva
- ✅ Indicadores de progresso e feedback visual

## 🏗️ Arquitetura

### Backend

```
backend/src/
├── services/
│   └── r2Service.ts          # Serviço principal do Cloudflare R2
├── middleware/
│   └── upload.ts             # Middleware do Multer e validações
├── controllers/
│   └── uploadController.ts   # Controllers para upload
├── routes/
│   └── upload.ts             # Rotas de upload
└── scripts/
    └── testR2Upload.ts       # Script de teste
```

### Frontend

```
src/
├── hooks/
│   └── useImageUpload.ts     # Hook personalizado para uploads
├── components/ui/
│   ├── image-upload.tsx      # Componente para múltiplas imagens
│   └── avatar-upload.tsx     # Componente para avatar
└── components/
    └── EditProfileModal.tsx  # Modal atualizado com novo upload
```

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` e configure:

```env
CLOUDFLARE_ACCOUNT_ID="seu-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="sua-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="sua-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="intercession"
CLOUDFLARE_R2_PUBLIC_URL="https://sua-url-publica.r2.cloudflarestorage.com/intercession"
```

### 2. Testar a Configuração

```bash
cd backend
npm run test:r2-upload
```

### 3. Iniciar o Servidor

```bash
cd backend
npm run dev
```

## 📡 API Endpoints

### Upload de Imagens para Pedidos de Oração

```http
POST /api/upload/prayer-images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- images: File[] (até 5 arquivos)
```

### Upload de Avatar

```http
POST /api/upload/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- image: File
```

### Upload Base64 (Compatibilidade)

```http
POST /api/upload/base64/images
Content-Type: application/json
Authorization: Bearer <token>

{
  "images": ["data:image/jpeg;base64,..."],
  "type": "prayer-requests"
}
```

### Health Check

```http
GET /api/upload/health
```

## 🎨 Componentes Frontend

### ImageUpload

```tsx
import { ImageUpload } from "@/components/ui/image-upload";

function MyComponent() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUpload
      images={images}
      onImagesChange={setImages}
      maxImages={5}
      useR2Upload={true}
    />
  );
}
```

### AvatarUpload

```tsx
import { AvatarUpload } from "@/components/ui/avatar-upload";

function ProfileComponent() {
  const [avatar, setAvatar] = useState<string>("");

  return (
    <AvatarUpload
      currentAvatar={avatar}
      onAvatarChange={setAvatar}
      size="lg"
      useR2Upload={true}
    />
  );
}
```

### Hook useImageUpload

```tsx
import { useImageUpload } from "@/hooks/useImageUpload";

function CustomUpload() {
  const { uploadImages, uploadAvatar, isUploading } = useImageUpload();

  const handleUpload = async (files: File[]) => {
    try {
      const urls = await uploadImages(files);
      console.log('Uploaded URLs:', urls);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {isUploading && <p>Uploading...</p>}
      {/* Your upload UI */}
    </div>
  );
}
```

## 🔧 Otimizações Aplicadas

### Processamento de Imagens

- **Avatars**: Redimensionados para 400x400px (quadrado)
- **Pedidos de Oração**: Redimensionados para máximo 1200px de largura
- **Formato**: Convertido para JPEG com qualidade 85%
- **Cache**: Headers de cache de 1 ano

### Performance

- **Upload Paralelo**: Múltiplas imagens são enviadas simultaneamente
- **Feedback Visual**: Indicadores de progresso e estados de loading
- **Validação**: Apenas arquivos de imagem são aceitos
- **Limite de Tamanho**: 10MB por arquivo

## 🔄 Migração de Dados Existentes

Para migrar imagens base64 existentes no banco de dados:

1. **Identificar registros com base64**:
```sql
SELECT id, images FROM prayer_images WHERE url LIKE 'data:image%';
```

2. **Usar endpoint de migração**:
```javascript
const migrateImages = async (base64Images) => {
  const response = await fetch('/api/upload/base64/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      images: base64Images,
      type: 'prayer-requests'
    })
  });
  
  const result = await response.json();
  return result.data.images; // URLs do R2
};
```

## 🐛 Troubleshooting

### Erro: "Missing required Cloudflare R2 environment variables"
- Verifique se todas as variáveis estão no `.env`
- Reinicie o servidor após adicionar variáveis

### Erro: "SignatureDoesNotMatch"
- Verifique Access Key ID e Secret Access Key
- Confirme se o token tem permissões corretas

### Erro: "NoSuchBucket"
- Verifique o nome do bucket
- Confirme se o bucket existe na conta correta

### Upload falha silenciosamente
- Verifique os logs do servidor
- Teste com `npm run test:r2-upload`
- Verifique se o arquivo não excede 10MB

### Imagens não aparecem
- Verifique se a URL pública está correta
- Confirme se o bucket tem acesso público configurado
- Teste acessando a URL diretamente no navegador

## 📊 Monitoramento

### Logs do Servidor
```bash
# Logs de upload bem-sucedido
✅ Image uploaded successfully: https://...

# Logs de erro
❌ Error uploading image to R2: ...
```

### Health Check
```bash
curl http://localhost:3001/api/upload/health
```

### Dashboard do Cloudflare
- Monitore uso de armazenamento
- Acompanhe transferência de dados
- Verifique operações por minuto

## 🔐 Segurança

- ✅ Autenticação obrigatória para uploads
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho por arquivo (10MB)
- ✅ Limite de quantidade (5 imagens por pedido)
- ✅ Nomes de arquivo únicos (UUID)
- ✅ Sanitização de uploads

## 💡 Próximos Passos

1. **Implementar compressão WebP** para navegadores compatíveis
2. **Adicionar thumbnails** para visualização rápida
3. **Implementar upload progressivo** com chunks
4. **Adicionar watermark** nas imagens (opcional)
5. **Implementar CDN** para melhor performance global
