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

## 📞 Contato

Em caso de dúvidas sobre segurança, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.