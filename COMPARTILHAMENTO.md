# Sistema de Compartilhamento - Luminews

## Visão Geral

O sistema de compartilhamento permite que usuários compartilhem:
- **Palavra do Dia** - Estudos bíblicos diários
- **Pedidos de Oração** - Pedidos específicos da comunidade

Os links compartilhados levam para páginas públicas (não protegidas) com CTAs para "Faça parte da nossa comunidade".

## Funcionalidades Implementadas

### Backend

#### 1. Banco de Dados
- **Nova tabela**: `SharedContent`
  - `id`: Identificador único
  - `shareId`: ID público para compartilhamento (único)
  - `contentType`: Tipo do conteúdo (`WORD_OF_DAY` ou `PRAYER_REQUEST`)
  - `contentId`: ID do conteúdo original
  - `userId`: Usuário que compartilhou (opcional)
  - `isActive`: Status do link
  - `expiresAt`: Data de expiração (opcional)
  - `createdAt/updatedAt`: Timestamps

#### 2. API Endpoints
- `POST /api/share` - Criar link de compartilhamento
- `GET /api/share/:shareId` - Visualizar conteúdo compartilhado (público)
- `GET /api/share/user/content` - Listar compartilhamentos do usuário
- `DELETE /api/share/:shareId` - Desativar link de compartilhamento

#### 3. Controller de Compartilhamento
- Validação de acesso ao conteúdo
- Verificação de privacidade para pedidos de oração
- Reutilização de links existentes
- Controle de expiração

### Frontend

#### 1. Página de Conteúdo Compartilhado (`/shared/:shareId`)
- **Página pública** (não requer autenticação)
- Exibe palavra do dia ou pedido de oração
- Mostra informações do usuário que compartilhou
- **CTA prominente** para "Faça parte da nossa comunidade"
- Botão de compartilhamento adicional
- Design responsivo e atrativo

#### 2. Funcionalidades de Compartilhamento

##### No Diário (`/diary`)
- **Botão de compartilhar** na palavra do dia (header)
- **Botões de compartilhar** em cada pedido de oração nos cards
- Compartilhamento via Web Share API ou clipboard

##### No Feed (`/feed`)
- **Botão de compartilhar** nos cards de pedidos de oração
- Integrado com as estatísticas do card

#### 3. Hooks e Serviços
- `useCreateShare` - Hook para criar compartilhamentos
- `useGetSharedContent` - Hook para buscar conteúdo compartilhado
- `useUserSharedContent` - Hook para listar compartilhamentos do usuário
- `useDeleteShare` - Hook para remover compartilhamentos
- Integração completa com `apiService`

## Como Usar

### Para Usuários

#### Compartilhar Palavra do Dia
1. Acesse o **Diário** (`/diary`)
2. Clique no botão de **compartilhar** (ícone Share2) no header
3. O sistema criará um link único
4. Use o Web Share API ou copie o link

#### Compartilhar Pedido de Oração
1. No **Diário** ou **Feed**
2. Encontre o pedido de oração desejado
3. Clique no botão **"Compartilhar"** no card
4. O sistema criará um link único
5. Use o Web Share API ou copie o link

#### Visualizar Conteúdo Compartilhado
1. Acesse o link compartilhado (`/shared/:shareId`)
2. Visualize o conteúdo sem precisar de conta
3. Use os CTAs para criar conta ou fazer login

### Para Desenvolvedores

#### Criar Novo Compartilhamento
```typescript
const createShareMutation = useCreateShare();

await createShareMutation.mutateAsync({
  contentType: 'WORD_OF_DAY', // ou 'PRAYER_REQUEST'
  contentId: 'id-do-conteudo',
  expiresAt: '2024-12-31T23:59:59Z' // opcional
});
```

#### Buscar Conteúdo Compartilhado
```typescript
const { data } = useGetSharedContent(shareId);
```

## Estrutura de URLs

- **Compartilhamento**: `/shared/:shareId`
- **API Base**: `/api/share`
- **Exemplos**:
  - `https://luminews.com/shared/clx123abc456`
  - `http://localhost:8081/shared/clx123abc456`

## Segurança e Privacidade

### Controles de Acesso
- **Pedidos Privados**: Só podem ser compartilhados pelo próprio autor
- **Pedidos Públicos**: Podem ser compartilhados por qualquer usuário
- **Palavra do Dia**: Sempre pública, pode ser compartilhada por qualquer usuário

### Validações
- Verificação de existência do conteúdo
- Controle de permissões de compartilhamento
- Validação de expiração de links
- Prevenção de links duplicados (reutilização)

## CTAs de Conversão

### Página de Conteúdo Compartilhado
- **Seção destacada** com ícone e mensagem atrativa
- **Dois botões**:
  - "Criar conta gratuita" (primário)
  - "Já tenho conta" (secundário)
- **Mensagem**: "Junte-se a milhares de pessoas que oram umas pelas outras todos os dias"

### Design
- **Gradiente atrativo** (azul para índigo)
- **Ícone de estrela** (✨)
- **Layout responsivo**
- **Cores contrastantes** para destacar os CTAs

## Próximos Passos

### Melhorias Futuras
1. **Analytics de compartilhamento**
   - Tracking de cliques
   - Conversões de compartilhamentos
   - Métricas de engajamento

2. **Compartilhamento social**
   - Meta tags para redes sociais
   - Imagens de preview personalizadas
   - Integração com WhatsApp, Facebook, etc.

3. **Personalização**
   - Templates de compartilhamento
   - Mensagens personalizadas
   - Branding customizado

4. **Gamificação**
   - Pontos por compartilhamentos
   - Badges para compartilhadores ativos
   - Ranking de compartilhamentos

## Testes

### Cenários de Teste
1. **Compartilhar palavra do dia**
2. **Compartilhar pedido público**
3. **Tentar compartilhar pedido privado** (deve falhar se não for o autor)
4. **Acessar link compartilhado** sem estar logado
5. **Usar CTAs** para criar conta/login
6. **Compartilhar novamente** o mesmo conteúdo (deve reutilizar link)

### URLs de Teste
- Frontend: `http://localhost:8081`
- Backend: `http://localhost:3001`
- Exemplo de compartilhamento: `http://localhost:8081/shared/[shareId]`

## Conclusão

O sistema de compartilhamento está completamente implementado e funcional, proporcionando:
- **Experiência fluida** para compartilhar conteúdo
- **Páginas públicas atrativas** para não-usuários
- **CTAs eficazes** para conversão
- **Segurança robusta** com controles de privacidade
- **Integração completa** com o sistema existente

O sistema está pronto para uso e pode ser facilmente expandido com as melhorias futuras sugeridas.
