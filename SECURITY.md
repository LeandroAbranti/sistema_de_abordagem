# Guia de Segurança para Git

## ✅ Arquivos SEGUROS para incluir no GitHub

### Código Fonte
- `client/` - Todo o código React (componentes, páginas, estilos)
- `server/routes/` - Todas as rotas da API
- `server/utils/` - Utilitários e helpers
- `server/index.js` - Arquivo principal do servidor
- `server/init.js` - Script de inicialização
- `server/data/database.js` - Funções de acesso ao banco (sem dados)
- `server/data/migrations.js` - Schema do banco de dados
- `server/data/sqlite.js` - Configuração de conexão SQLite

### Configuração
- `package.json` e `package-lock.json` - Dependências do projeto
- `tailwind.config.js` - Configuração do Tailwind CSS
- `.gitignore` - Lista de arquivos a serem ignorados
- `README.md` - Documentação do projeto
- `start.sh` e `start.bat` - Scripts de inicialização
- `server/config.env.example` - Exemplo de configuração (sem valores reais)

## ❌ Arquivos que NÃO devem ir para o GitHub

### Dados Sensíveis
- `server/.env` - **NUNCA INCLUIR** - Contém chaves secretas e configurações sensíveis
- `server/data/*.db` - **NUNCA INCLUIR** - Banco de dados com dados reais
- `*.sqlite`, `*.sqlite3` - **NUNCA INCLUIR** - Arquivos de banco de dados

### Arquivos Temporários
- `node_modules/` - Dependências (podem ser reinstaladas)
- `build/`, `dist/` - Arquivos compilados
- `*.log` - Arquivos de log
- `.cache/` - Cache de ferramentas

## 🔒 Informações Sensíveis no Código

### O que está protegido:
- **JWT_SECRET**: Usado apenas via variável de ambiente
- **Configurações de banco**: Não há credenciais hardcoded
- **Dados de usuários**: Armazenados apenas no banco local

### Credenciais padrão (podem ser públicas):
- Usuário admin padrão: `admin` / `admin123`
- Estas são credenciais de desenvolvimento que devem ser alteradas em produção

## 📋 Checklist antes do commit

- [ ] Verificar se não há arquivos `.env` sendo commitados
- [ ] Confirmar que arquivos `.db` estão no `.gitignore`
- [ ] Remover qualquer log ou comentário com dados sensíveis
- [ ] Verificar se não há chaves API ou tokens hardcoded
- [ ] Confirmar que `node_modules/` está sendo ignorado

## 🚀 Comandos seguros para Git

```bash
# Verificar status antes do commit
git status

# Adicionar apenas arquivos específicos (mais seguro)
git add client/ server/routes/ server/utils/ server/index.js server/init.js
git add server/data/database.js server/data/migrations.js server/data/sqlite.js
git add package.json README.md .gitignore

# Ou adicionar tudo (o .gitignore protegerá os arquivos sensíveis)
git add .

# Commit com mensagem descritiva
git commit -m "feat: implementar banco de dados SQLite persistente"

# Push para o repositório
git push origin main
```

## ⚠️ Em caso de commit acidental de dados sensíveis

1. **NÃO FAÇA PUSH** se ainda não enviou
2. Use `git reset --soft HEAD~1` para desfazer o commit
3. Remova os arquivos sensíveis e refaça o commit
4. Se já fez push, considere:
   - Alterar todas as chaves/senhas expostas
   - Usar `git filter-branch` ou BFG Repo-Cleaner
   - Em casos extremos, recriar o repositório

## 🔒 Medidas de Segurança Implementadas

### Autenticação e Autorização
- ✅ Sistema de login com JWT tokens
- ✅ Middleware de autenticação em todas as rotas protegidas
- ✅ Controle de acesso baseado em roles (admin/usuário)
- ✅ Tokens com expiração de 24 horas
- ✅ Senhas criptografadas com bcrypt (salt rounds: 12)
- ✅ Rate limiting específico para login (5 tentativas/15min)

### Proteção contra Ataques
- ✅ Helmet.js para headers de segurança
- ✅ Rate limiting global (100 req/15min) + específico para login
- ✅ CORS configurado adequadamente
- ✅ Validação robusta de entrada em todas as rotas
- ✅ Sanitização de dados do usuário
- ✅ Validação de formato de placas, CPF e CNH
- ✅ Limitação de tamanho de campos de texto
- ✅ Remoção de tags HTML maliciosas

### Configurações de Banco de Dados
- ✅ Prepared statements para prevenir SQL injection
- ✅ Validação de tipos de dados
- ✅ Controle de acesso ao banco

## 🏭 Configurações de Produção Implementadas

### HTTPS e Segurança de Transporte
- ✅ Redirecionamento automático HTTP → HTTPS em produção
- ✅ Headers HSTS (HTTP Strict Transport Security)
- ✅ Content Security Policy (CSP) configurado
- ✅ Configuração de certificados SSL via variáveis de ambiente

### Sistema de Logs e Monitoramento
- ✅ Sistema completo de logging de segurança
- ✅ Logs estruturados em JSON para análise
- ✅ Monitoramento de tentativas de login (sucesso/falha)
- ✅ Detecção de violações de rate limit
- ✅ Logs de violações de CORS
- ✅ Rastreamento de ações administrativas
- ✅ Rotação automática de logs
- ✅ Logs separados para eventos de segurança

### Sistema de Backup Automático
- ✅ Backup automático do banco SQLite a cada 6 horas
- ✅ Limpeza automática de backups antigos (mantém últimos 10)
- ✅ Rotas administrativas para backup manual
- ✅ Funcionalidade de restauração de backup
- ✅ Logs de todas as operações de backup

### Validação de Ambiente de Produção
- ✅ Validação automática de configurações obrigatórias
- ✅ Verificação de senhas padrão (impede inicialização)
- ✅ Validação de força de JWT_SECRET
- ✅ Relatório de nível de segurança na inicialização
- ✅ Parada automática se configurações críticas estão ausentes

### CORS Aprimorado
- ✅ Configuração dinâmica via ALLOWED_ORIGINS
- ✅ Validação de origem em tempo real
- ✅ Suporte a múltiplos domínios
- ✅ Logs de tentativas de acesso não autorizadas
- ✅ Cache de preflight requests (24h)

### Rotas Administrativas de Segurança
- ✅ `/api/admin/backups` - Gerenciamento de backups
- ✅ `/api/admin/security/stats` - Estatísticas de segurança
- ✅ `/api/admin/security/report` - Relatório completo de configuração
- ✅ Logs de todas as ações administrativas

## 🔧 Configuração para Produção

### Variáveis de Ambiente Obrigatórias
```bash
# Segurança
JWT_SECRET=sua_chave_muito_segura_com_pelo_menos_32_caracteres
ADMIN_PASSWORD=SuaSenhaSegura123!

# CORS
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com

# Ambiente
NODE_ENV=production
PORT=5000
```

### Variáveis Opcionais (Recomendadas)
```bash
# HTTPS
SSL_KEY_PATH=/caminho/para/private.key
SSL_CERT_PATH=/caminho/para/certificate.crt

# Email
EMAIL_HOST=smtp.seu-provedor.com
EMAIL_USER=sistema@seu-dominio.com
EMAIL_PASS=senha_do_email
```

### Checklist de Produção
- [ ] Alterar JWT_SECRET (mínimo 32 caracteres)
- [ ] Alterar ADMIN_PASSWORD (mínimo 8 caracteres)
- [ ] Configurar ALLOWED_ORIGINS com domínios reais
- [ ] Configurar certificados SSL
- [ ] Verificar logs de segurança regularmente
- [ ] Monitorar backups automáticos
- [ ] Testar restauração de backup
- [ ] Configurar monitoramento de servidor

## 📊 Monitoramento de Segurança

### Arquivos de Log
- `server/logs/app.log` - Logs gerais da aplicação
- `server/logs/security.log` - Eventos de segurança específicos
- `server/logs/app.log.YYYY-MM-DD` - Logs rotacionados

### Eventos Monitorados
- Tentativas de login (sucesso/falha)
- Violações de rate limit
- Tentativas de acesso CORS não autorizadas
- Ações administrativas
- Erros de servidor
- Operações de backup
- Atividades suspeitas

### Alertas Recomendados
- Múltiplas tentativas de login falhadas do mesmo IP
- Tentativas de acesso a rotas administrativas
- Falhas no sistema de backup
- Erros críticos de configuração

## 📞 Contato

Em caso de dúvidas sobre segurança, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.