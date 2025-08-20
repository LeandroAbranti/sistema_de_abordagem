# 🚔 Sistema de Registro de Abordagens de Trânsito

Sistema completo para gerenciamento de blitz de trânsito e registro de abordagens, desenvolvido com React, Node.js e Express.

## ✨ Funcionalidades

- **Sistema de Login Seguro**: Autenticação com matrícula e senha
- **Controle de Acesso**: Apenas administradores podem criar usuários e blitz
- **Gerenciamento de Blitz**: Criação, visualização e encerramento de operações
- **Registro de Abordagens**: Formulário completo para abordagens de trânsito
- **Relatórios em PDF**: Geração automática de relatórios
- **Interface Moderna**: Design responsivo e intuitivo
- **Segurança**: Senhas criptografadas, JWT tokens, rate limiting


## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd sistema-abordagens-transito
```

### 2. Instale as dependências

```bash
# Instalar todas as dependências (backend + frontend)
npm run install-all

# Ou instalar separadamente:
npm install                    # Dependências principais
cd server && npm install      # Dependências do backend
cd ../client && npm install   # Dependências do frontend
```

### 3. Configure as variáveis de ambiente

```bash
cd server
cp config.env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
```

### 4. Inicialize o banco de dados

O sistema usa um banco em memória que é inicializado automaticamente com o usuário administrador.

### 5. Execute o sistema

```bash
# Desenvolvimento (backend + frontend simultaneamente)
npm run dev

# Ou executar separadamente:
npm run server    # Backend na porta 5000
npm run client    # Frontend na porta 3000
```

## 📱 Como Usar


### 2. Criação de Blitz

1. Acesse "Administração" → "Criar Blitz"
2. Preencha: Local, Data, Hora
3. Selecione as matrículas dos participantes
4. Clique em "Criar Blitz"

### 3. Registro de Abordagens

1. Acesse "Blitz" → Selecione uma blitz ativa
2. Clique em "Registrar Abordagem"
3. Preencha os dados:
   - Placa do veículo
   - CPF ou CNH do condutor
   - Teste de etilômetro
   - Veículo removido
   - Autuações e artigos aplicados
   - Observações
4. Clique em "Salvar Abordagem"

### 4. Encerramento de Blitz

1. Acesse "Administração" → "Gerenciar Blitz"
2. Selecione a blitz ativa
3. Clique em "Encerrar Blitz"
4. Gere relatório em PDF

## 🏗️ Estrutura do Projeto

```
projeto_abordagem/
├── server/                 # Backend Node.js
│   ├── routes/            # Rotas da API
│   ├── utils/             # Utilitários (auth, PDF)
│   ├── data/              # Banco de dados em memória
│   └── index.js           # Servidor principal
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos (Auth)
│   │   └── App.js         # Aplicação principal
│   └── public/            # Arquivos públicos
└── package.json           # Scripts principais
```

## 🔧 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express**
- **JWT** para autenticação
- **bcryptjs** para criptografia
- **PDFKit** para geração de relatórios
- **Helmet** + **Rate Limiting** para segurança

### Frontend
- **React 18** com Hooks
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações

## 🛡️ Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ JWT tokens com expiração
- ✅ Rate limiting para prevenir ataques
- ✅ Headers de segurança com Helmet
- ✅ Validação de entrada em todas as rotas
- ✅ Controle de acesso baseado em roles

## 📊 Funcionalidades por Tipo de Usuário

### Usuário Comum
- Visualizar blitz ativas
- Registrar abordagens
- Visualizar próprias abordagens
- Acessar relatórios das blitz

### Administrador
- Todas as funcionalidades do usuário comum
- Criar e gerenciar usuários
- Criar e encerrar blitz
- Gerar relatórios completos
- Acesso ao painel administrativo

## 🚨 Considerações de Produção

1. **Banco de Dados**: Migre para PostgreSQL, MySQL ou MongoDB
2. **JWT Secret**: Use uma chave secreta forte e única
3. **HTTPS**: Configure SSL/TLS em produção
4. **Variáveis de Ambiente**: Nunca commite arquivos .env
5. **Logs**: Implemente sistema de logs robusto
6. **Backup**: Configure backup automático dos dados
7. **Monitoramento**: Implemente health checks e métricas

## 🐛 Solução de Problemas

### Erro de CORS
- Verifique se o backend está rodando na porta 5000
- Confirme as configurações de CORS no servidor

### Erro de Autenticação
- Verifique se o token JWT está sendo enviado
- Confirme se o JWT_SECRET está configurado

### Erro de Dependências
- Delete node_modules e package-lock.json
- Execute `npm install` novamente

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a administração.

## 📄 Licença

Este projeto é desenvolvido para uso interno do sistema de abordagens de trânsito.

---

**Desenvolvido com ❤️ para melhorar a gestão de operações de trânsito**
