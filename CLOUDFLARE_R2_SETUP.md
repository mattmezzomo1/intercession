# Configuração do Cloudflare R2 para Upload de Imagens

Este documento explica como configurar o Cloudflare R2 para armazenar as imagens dos usuários (pedidos de oração e fotos de perfil).

## 📋 Pré-requisitos

1. Conta no Cloudflare
2. Bucket R2 criado
3. Token de API configurado

## 🔧 Configuração no Cloudflare

### 1. Criar um Bucket R2

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá para **R2 Object Storage**
3. Clique em **Create bucket**
4. Nome do bucket: `intercession` (ou o nome que preferir)
5. Escolha a região mais próxima dos seus usuários

### 2. Configurar Token de API

1. No dashboard do Cloudflare, vá para **My Profile** > **API Tokens**
2. Clique em **Create Token**
3. Use o template **R2 Token** ou **Custom token**
4. Configure as permissões:
   - **Account**: Inclua sua conta
   - **Zone Resources**: Não necessário para R2
   - **Account Resources**: Inclua `Cloudflare R2:Edit`
5. Salve o token gerado

### 3. Obter as Credenciais

Você precisará das seguintes informações:

- **Account ID**: Encontrado no dashboard principal do Cloudflare
- **Access Key ID**: Gerado junto com o token R2
- **Secret Access Key**: Gerado junto com o token R2
- **Bucket Name**: Nome do bucket criado
- **Public URL**: URL pública do bucket

## 🔐 Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID="seu-account-id-aqui"
CLOUDFLARE_R2_ACCESS_KEY_ID="sua-access-key-aqui"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="sua-secret-key-aqui"
CLOUDFLARE_R2_BUCKET_NAME="intercession"
CLOUDFLARE_R2_PUBLIC_URL="https://f0e77f9a6928416640d2192934fb64d7.r2.cloudflarestorage.com/intercession"
```

### Como obter cada variável:

1. **CLOUDFLARE_ACCOUNT_ID**: 
   - Dashboard do Cloudflare > Sidebar direita > Account ID

2. **CLOUDFLARE_R2_ACCESS_KEY_ID** e **CLOUDFLARE_R2_SECRET_ACCESS_KEY**:
   - R2 Object Storage > Manage R2 API tokens > Create API token
   - Ou use as credenciais fornecidas quando criou o token

3. **CLOUDFLARE_R2_BUCKET_NAME**:
   - Nome do bucket que você criou

4. **CLOUDFLARE_R2_PUBLIC_URL**:
   - R2 Object Storage > Seu bucket > Settings > Public URL
   - Ou use o formato: `https://<subdomain>.r2.cloudflarestorage.com/<bucket-name>`

## 🚀 Como Funciona

### Upload de Imagens

1. **Frontend**: O usuário seleciona imagens através do componente `ImageUpload`
2. **Upload**: As imagens são enviadas para `/api/upload/prayer-images` ou `/api/upload/avatar`
3. **Processamento**: O backend processa as imagens com Sharp (redimensiona e otimiza)
4. **Armazenamento**: As imagens são enviadas para o Cloudflare R2
5. **Resposta**: O backend retorna as URLs públicas das imagens
6. **Banco de Dados**: As URLs são salvas no banco de dados

### Estrutura de Pastas no R2

```
intercession/
├── prayer-requests/
│   ├── uuid1.jpg
│   ├── uuid2.jpg
│   └── ...
└── avatars/
    ├── uuid3.jpg
    ├── uuid4.jpg
    └── ...
```

### Otimizações Aplicadas

- **Avatars**: Redimensionados para 400x400px
- **Imagens de Pedidos**: Redimensionadas para máximo 1200px de largura
- **Compressão**: JPEG com qualidade 85%
- **Cache**: Headers de cache de 1 ano
- **Nomes únicos**: UUIDs para evitar conflitos

## 🔄 Migração de Dados Existentes

Se você já tem imagens armazenadas como base64 no banco de dados, pode usar o endpoint de compatibilidade:

```javascript
// Upload de imagens base64 existentes
POST /api/upload/base64/images
{
  "images": ["data:image/jpeg;base64,/9j/4AAQ..."],
  "type": "prayer-requests"
}
```

## 🧪 Testando a Configuração

1. **Health Check**: 
   ```bash
   GET /api/upload/health
   ```

2. **Upload de Teste**:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "images=@test-image.jpg" \
     http://localhost:3001/api/upload/prayer-images
   ```

## 🔧 Troubleshooting

### Erro: "Missing required Cloudflare R2 environment variables"
- Verifique se todas as variáveis de ambiente estão configuradas
- Reinicie o servidor após adicionar as variáveis

### Erro: "SignatureDoesNotMatch"
- Verifique se o Access Key ID e Secret Access Key estão corretos
- Certifique-se de que o token tem as permissões corretas

### Erro: "NoSuchBucket"
- Verifique se o nome do bucket está correto
- Certifique-se de que o bucket existe na conta correta

### Imagens não aparecem
- Verifique se a URL pública está correta
- Certifique-se de que o bucket tem as configurações de acesso público corretas

## 📊 Monitoramento

- **Logs**: Verifique os logs do servidor para erros de upload
- **R2 Dashboard**: Monitore o uso de armazenamento e transferência
- **Health Check**: Use `/api/upload/health` para verificar se o serviço está funcionando

## 💰 Custos

O Cloudflare R2 tem preços competitivos:
- **Armazenamento**: $0.015 por GB/mês
- **Operações Classe A**: $4.50 por milhão (PUT, COPY, POST, LIST)
- **Operações Classe B**: $0.36 por milhão (GET, HEAD)
- **Transferência de saída**: Gratuita até 10GB/mês

Para uma aplicação de oração com uploads moderados, os custos devem ser muito baixos.
