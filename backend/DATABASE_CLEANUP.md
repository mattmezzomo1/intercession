# Database Cleanup Scripts

Este documento descreve os scripts criados para limpar o banco de dados antes do lançamento em produção, mantendo apenas os dados do usuário Mateus Mezzomo.

## Scripts Disponíveis

### 1. `clean:prayers` - Limpeza de Pedidos de Oração

```bash
npm run clean:prayers
```

**Função:** Remove todos os pedidos de oração que não pertencem ao usuário Mateus Mezzomo.

**O que é removido:**
- Pedidos de oração de outros usuários
- Imagens associadas aos pedidos (via cascade)
- Comentários nos pedidos (via cascade)
- Intercessões nos pedidos (via cascade)
- Logs de oração dos pedidos (via cascade)

**O que é preservado:**
- Todos os pedidos de oração do Mateus Mezzomo
- Dados relacionados aos pedidos do Mateus

### 2. `clean:orphaned` - Limpeza de Dados Órfãos

```bash
npm run clean:orphaned
```

**Função:** Remove dados órfãos e outros usuários, mantendo apenas o Mateus Mezzomo.

**O que é removido:**
- Outros usuários (exceto Mateus Mezzomo)
- Comentários de outros usuários
- Intercessões de outros usuários
- Logs de oração de outros usuários
- Idiomas de usuários órfãos
- Lembretes de oração órfãos
- Assinaturas órfãs
- Pagamentos órfãos
- Conteúdo compartilhado órfão

**O que é preservado:**
- Usuário Mateus Mezzomo
- Todos os dados relacionados ao Mateus

### 3. `reset:production` - Reset Completo para Produção

```bash
npm run reset:production
```

**Função:** Script completo que combina todas as operações de limpeza com relatórios detalhados.

**Características:**
- Relatório completo antes e depois da limpeza
- Verificação de segurança para ambiente de produção
- Estatísticas detalhadas de todos os dados
- Processo passo-a-passo com logs informativos

## Segurança em Produção

Para executar os scripts em ambiente de produção, é necessário definir variáveis de ambiente de confirmação:

```bash
# Para o script de reset completo
export CONFIRM_PRODUCTION_RESET=true
npm run reset:production
```

## Dados Preservados

Após a execução dos scripts, o banco de dados conterá apenas:

### Usuário
- **Nome:** Mateus Mezzomo
- **Email:** m@m.com
- **ID:** cmfyni2j70000bwvbo5lhnx3o

### Dados Relacionados ao Mateus
- Pedidos de oração criados por ele
- Comentários feitos por ele
- Intercessões feitas por ele
- Logs de oração dele
- Configurações de idioma dele
- Lembretes de oração dele
- Assinaturas dele (se houver)
- Pagamentos dele (se houver)
- Conteúdo compartilhado por ele

### Dados do Sistema (Preservados)
- Idiomas disponíveis
- Categorias de oração
- Palavra do dia (Word of Day)

## Dados Removidos

### Usuários de Teste
- Todos os outros usuários criados durante desenvolvimento
- Dados de teste e demonstração

### Conteúdo de Teste
- Pedidos de oração de teste
- Comentários de teste
- Intercessões de teste
- Qualquer conteúdo não relacionado ao Mateus

## Como Usar

### Desenvolvimento Local
```bash
# Navegar para o diretório backend
cd backend

# Executar limpeza completa
npm run reset:production
```

### Produção
```bash
# Definir confirmação de produção
export CONFIRM_PRODUCTION_RESET=true

# Executar reset
npm run reset:production
```

## Verificação Pós-Limpeza

Após executar os scripts, você pode verificar o estado do banco usando:

```bash
# Abrir Prisma Studio para visualizar os dados
npm run db:studio
```

## Backup de Segurança

**IMPORTANTE:** Sempre faça backup do banco de dados antes de executar os scripts de limpeza:

```bash
# Exemplo de backup MySQL
mysqldump -u username -p database_name > backup_before_cleanup.sql
```

## Logs e Monitoramento

Os scripts fornecem logs detalhados incluindo:
- ✅ Operações bem-sucedidas
- ❌ Erros encontrados
- 📊 Estatísticas antes e depois
- 🔍 Informações de identificação do usuário
- 🗑️ Contadores de dados removidos

## Troubleshooting

### Usuário Não Encontrado
Se o script não encontrar o usuário Mateus Mezzomo:
1. Verifique se o usuário existe no banco
2. Confirme o nome exato no banco de dados
3. Ajuste os critérios de busca no script se necessário

### Erro de Permissões
Se houver erros de permissão:
1. Verifique as credenciais do banco de dados
2. Confirme que o usuário tem permissões de DELETE
3. Verifique a string de conexão DATABASE_URL

### Dados Não Removidos
Se alguns dados não foram removidos:
1. Verifique constraints de foreign key
2. Execute os scripts na ordem correta
3. Considere executar `clean:orphaned` após `clean:prayers`

## Contato

Para dúvidas ou problemas com os scripts de limpeza, entre em contato com o desenvolvedor.
