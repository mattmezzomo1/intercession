# 🚀 Guia de Deploy - Intercede Together

## 📋 Pré-requisitos

- ✅ Servidor com Node.js 18+ instalado
- ✅ Servidor web (Apache/Nginx) configurado
- ✅ Domínio `luminews.com.br` apontando para o servidor
- ✅ SSL/HTTPS configurado
- ✅ Banco MySQL configurado e acessível
- ✅ Chaves de API configuradas (OpenAI, Stripe, Cloudflare R2)

## 🔑 Configuração das Chaves de API

Antes do deploy, você precisa configurar suas chaves de API:

```bash
# 1. Copie o arquivo de exemplo
cp backend/.env.production.example backend/.env.production

# 2. Edite o arquivo com suas chaves reais
# DATABASE_URL="mysql://seu_usuario:sua_senha@seu_host:3306/seu_banco"
# JWT_SECRET="sua-chave-jwt-super-secreta"
# OPENAI_API_KEY="sk-proj-sua-chave-openai"
# STRIPE_SECRET_KEY="sk_live_sua-chave-stripe"
# STRIPE_WEBHOOK_SECRET="whsec_seu-webhook-secret"
# CLOUDFLARE_ACCOUNT_ID="seu-account-id"
# CLOUDFLARE_R2_ACCESS_KEY_ID="sua-access-key"
# CLOUDFLARE_R2_SECRET_ACCESS_KEY="sua-secret-key"
```

**⚠️ IMPORTANTE**: Nunca commite arquivos `.env` com chaves reais no Git!

## 🔧 Configuração Rápida

### 1. Build Automático
```bash
# Execute o script de deploy
./deploy.ps1
```

### 2. Deploy Manual

#### Frontend
```bash
# Build para produção
npm run build:prod

# Upload da pasta 'dist' para o servidor web
# Exemplo: /var/www/luminews.com.br/
```

#### Backend
```bash
cd backend

# Build do TypeScript
npm run build

# Instalar dependências de produção
npm ci --only=production

# Configurar ambiente (configure suas chaves de API primeiro!)
cp .env.production.example .env.production
# IMPORTANTE: Edite .env.production com suas chaves reais
# Depois copie para .env
cp .env.production .env

# Gerar cliente Prisma
npm run db:generate

# Aplicar migrações (se necessário)
npm run db:migrate:deploy

# Iniciar servidor
npm start
```

## 🌐 Configuração do Servidor Web

### Nginx (Recomendado)
```nginx
server {
    listen 443 ssl;
    server_name luminews.com.br;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend (React)
    location / {
        root /var/www/luminews.com.br/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name luminews.com.br;
    return 301 https://$server_name$request_uri;
}
```

### Apache
```apache
<VirtualHost *:443>
    ServerName luminews.com.br
    DocumentRoot /var/www/luminews.com.br/dist
    
    # SSL configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Frontend
    <Directory "/var/www/luminews.com.br/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend API Proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
</VirtualHost>
```

## 🔄 Process Manager (PM2)

### Instalação
```bash
npm install -g pm2
```

### Configuração
```bash
# Criar arquivo ecosystem.config.js no backend/
cd backend
```

### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'intercede-together-api',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Comandos PM2
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar
pm2 restart intercede-together-api

# Parar
pm2 stop intercede-together-api

# Auto-start no boot
pm2 startup
pm2 save
```

## ✅ Verificação Pós-Deploy

### 1. Testar Endpoints
```bash
# Health check
curl https://luminews.com.br/api/health

# Categories
curl https://luminews.com.br/api/categories
```

### 2. Verificar Frontend
- Acesse `https://luminews.com.br`
- Teste login/registro
- Verifique se não há erros 403

### 3. Monitorar Logs
```bash
# Backend logs
pm2 logs intercede-together-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔧 Troubleshooting

### Erro 403 - Permission Error
- ✅ Verificar CORS no backend (.env FRONTEND_URL)
- ✅ Verificar SSL/HTTPS
- ✅ Verificar proxy reverso

### Erro 502 - Bad Gateway
- ✅ Verificar se backend está rodando (pm2 status)
- ✅ Verificar porta 3001
- ✅ Verificar configuração do proxy

### Erro de Banco de Dados
- ✅ Verificar DATABASE_URL
- ✅ Verificar conectividade
- ✅ Executar migrações

## 📊 Monitoramento

### Logs Importantes
```bash
# Backend
tail -f backend/logs/combined.log

# Sistema
htop
df -h
free -m
```

### Métricas
- CPU usage
- Memory usage
- Disk space
- Response times
- Error rates

## 🔄 Atualizações Futuras

```bash
# 1. Pull do código
git pull origin main

# 2. Build
./deploy.ps1

# 3. Restart
pm2 restart intercede-together-api
```
