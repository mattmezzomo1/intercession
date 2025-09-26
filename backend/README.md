# Intercede Together - Backend

Backend API para o aplicativo Intercede Together, uma plataforma de pedidos de oração com suporte a múltiplos idiomas e localização geográfica.

## 🚀 Tecnologias

- **Node.js** com **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - Database ORM
- **MariaDB** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de dados
- **Helmet** - Segurança
- **CORS** - Cross-origin requests
- **Rate Limiting** - Proteção contra spam

## 📋 Funcionalidades

### ✅ Implementadas

- **Autenticação completa** (registro, login, JWT)
- **Gerenciamento de usuários** com localização
- **Sistema de pedidos de oração** com:
  - Suporte a imagens (até 5 por pedido)
  - Níveis de privacidade (público, privado, amigos)
  - Categorização
  - Filtros por idioma e proximidade geográfica
- **Sistema de intercessões** (orar por pedidos)
- **Sistema de comentários**
- **Palavra do Dia** multilíngue
- **Suporte a múltiplos idiomas**
- **Filtros por localização** (distância geográfica)
- **API RESTful completa**

### 🔄 Recursos Avançados

- **Filtro por proximidade**: Pedidos ordenados por distância geográfica
- **Multilíngue**: Usuários podem definir idiomas preferidos
- **Trending**: Pedidos em alta baseados em interações
- **Validação robusta**: Todas as entradas são validadas
- **Tratamento de erros**: Sistema completo de error handling
- **Segurança**: Rate limiting, helmet, CORS configurado

## 🗄️ Banco de Dados

### Tabelas Principais

- **users** - Usuários com localização e idiomas
- **languages** - Idiomas suportados
- **user_languages** - Idiomas do usuário
- **categories** - Categorias de oração
- **prayer_requests** - Pedidos de oração
- **prayer_images** - Imagens dos pedidos
- **intercessions** - Intercessões (orações)
- **comments** - Comentários
- **word_of_day** - Palavra do dia multilíngue

## 🛠️ Instalação

1. **Clone o repositório**
```bash
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar schema ao banco
npx prisma db push

# Popular com dados iniciais
npx tsx prisma/seed.ts
```

5. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📡 API Endpoints

Veja a documentação completa em [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Principais Endpoints

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/prayer-requests` - Listar pedidos
- `POST /api/prayer-requests` - Criar pedido
- `GET /api/word-of-day/today` - Palavra do dia
- `GET /api/languages` - Idiomas disponíveis

## 🌍 Recursos Multilíngue

### Idiomas Suportados

- Português (pt)
- English (en)
- Español (es)
- Français (fr)
- Deutsch (de)
- Italiano (it)
- Русский (ru)
- 中文 (zh)
- 日本語 (ja)
- 한국어 (ko)
- العربية (ar)
- हिन्दी (hi)

### Como Funciona

1. **Usuário define idiomas preferidos** no registro
2. **Pedidos são filtrados** pelos idiomas do usuário
3. **Palavra do Dia** é exibida no idioma preferido
4. **Conteúdo é localizado** automaticamente

## 📍 Sistema de Localização

### Funcionalidades

- **Registro com localização** (latitude, longitude, cidade, país)
- **Filtro por proximidade** (pedidos mais próximos primeiro)
- **Distância máxima** configurável
- **Cálculo de distância** usando fórmula Haversine

### Uso

```javascript
// Buscar pedidos próximos (raio de 50km)
GET /api/prayer-requests?latitude=-23.5505&longitude=-46.6333&maxDistance=50
```

## 🔒 Segurança

- **JWT Authentication** com expiração
- **Password hashing** com bcrypt
- **Rate limiting** (100 requests/15min)
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação de entrada** com Zod
- **SQL injection** prevenido pelo Prisma

## 📊 Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares (auth, errors)
│   ├── routes/          # Definição das rotas
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários (validation, jwt, etc)
│   └── app.ts           # Aplicação principal
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Dados iniciais
├── package.json
└── tsconfig.json
```

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm start        # Servidor de produção
npm run db:push  # Aplicar schema ao banco
npm run db:seed  # Popular banco com dados
```

### Variáveis de Ambiente

```env
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:8081"
```

## 🚀 Deploy

O backend está pronto para deploy em qualquer plataforma que suporte Node.js:

- **Heroku**
- **Vercel**
- **Railway**
- **DigitalOcean**
- **AWS**

## 📈 Próximos Passos

- [ ] WebSocket para notificações em tempo real
- [ ] Sistema de amizades
- [ ] Push notifications
- [ ] Cache com Redis
- [ ] Testes automatizados
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
