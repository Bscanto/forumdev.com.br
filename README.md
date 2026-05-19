# ForumDev - Plataforma Comunitária de Programação e Tecnologia

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-required-blue.svg)

**Uma plataforma de fórum moderna construída com Next.js, focada em discussões de Programação e Tecnologia.**

[Roadmap](#roadmap) • [Instalação](#instalação) • [Uso](#uso) • [API](#api) • [Arquitetura](#arquitetura)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Documentation](#api-documentation)
- [Arquitetura](#arquitetura)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

**ForumDev** é uma plataforma de comunidade de código aberto destinada a profissionais e entusiastas de tecnologia que desejam compartilhar conhecimento, fazer perguntas e colaborar em discussões sobre programação e tecnologia.

### Objetivos Principais

- Criar um espaço seguro e inclusivo para discussões técnicas
- Facilitar o compartilhamento de conhecimento entre desenvolvedores
- Manter a qualidade das discussões através de moderation e rating systems
- Prover uma experiência mobile-first e acessível

---

## ✨ Features

### Core Features

- ✅ **Autenticação & Autorização** - JWT-based authentication com bcrypt password hashing
- ✅ **Sistema de Usuários** - Profiles customizáveis com reputação e gamification
- ✅ **Categorias & Tópicos** - Organização hierárquica de conteúdo
- ✅ **Posts & Comentários** - Rich text support com markdown
- ✅ **Search** - Busca full-text em posts e comentários
- ✅ **Admin Panel** - Dashboard para gerenciamento de usuários e conteúdo
- ✅ **Rate Limiting** - Proteção contra abuso

### Funcionalidades Planejadas

- 🔄 Notificações em tempo real (WebSocket)
- 🔄 Sistema de reputação avançado
- 🔄 Tags e filtros avançados
- 🔄 Badges e achievements
- 🔄 Integration com GitHub
- 🔄 Analytics para moderadores

---

## 🛠 Tech Stack

### Frontend

- **Next.js 13** - React framework com SSR e SSG
- **React 18** - UI library
- **JavaScript** - Linguagem de programação

### Backend

- **Next.js API Routes** - Serverless functions
- **Node.js** - JavaScript runtime
- **PostgreSQL 16** - Database relacional

### DevOps & Infrastructure

- **Docker & Docker Compose** - Containerização
- **node-pg-migrate** - Database migrations

### Qualidade de Código

- **Jest** - Testing framework
- **Prettier** - Code formatter
- **EditorConfig** - Editor standardization

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de que você possui:

- **Node.js** >= 14.0.0 ([Download](https://nodejs.org/))
- **npm** >= 6.0.0 (incluído com Node.js)
- **Docker** >= 20.10 ([Install Guide](https://docs.docker.com/get-docker/))
- **Docker Compose** >= 1.29 ([Install Guide](https://docs.docker.com/compose/install/))
- **Git** >= 2.25

**Verificar instalações:**

```bash
node --version
npm --version
docker --version
docker-compose --version
git --version
```

---

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/Bscanto/forumdev.com.br.git
cd forumdev.com.br
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.development` e ajuste as variáveis conforme necessário:

```bash
cp .env.development .env.development.local
```

Veja [Variáveis de Ambiente](#variáveis-de-ambiente) para mais detalhes.

### 4. Iniciar Serviços (PostgreSQL)

```bash
npm run services:up
```

Este comando iniciará o container Docker com PostgreSQL.

### 5. Executar Migrations

```bash
npm run migration:up
```

Isso criará as tabelas necessárias no banco de dados.

### 6. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

---

## 💻 Uso

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev                  # Inicia servidor de desenvolvimento com Docker

# Serviços
npm run services:up         # Inicia PostgreSQL via Docker Compose
npm run services:stop       # Para os serviços
npm run services:down       # Remove os serviços e volumes

# Linting & Formatting
npm run lint:check          # Verifica formatação com Prettier
npm run lint:fix            # Formata código automaticamente

# Testes
npm test                    # Executa testes uma única vez
npm run test:watch         # Executa testes em modo watch

# Database Migrations
npm run migration:create    # Cria nova migration (requer nome)
npm run migration:up        # Aplica todas as migrations pendentes
npm run migration:down      # Reverte a última migration

```

### Exemplos de Uso

**Criar uma nova migration:**

```bash
npm run migration:create -- --name create_users_table
```

**Formatar código:**

```bash
npm run lint:fix
```

**Executar testes com cobertura:**

```bash
npm test -- --coverage
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.development` na raiz do projeto:

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=local_user
POSTGRES_DB=local_db
POSTGRES_PASSWORD=12345
DATABASE_URL=postgres://local_user:12345@localhost:5432/local_db

# Authentication
JWT_SECRET=forumdev-secret-change-me

# Application
NODE_ENV=development
```

### Variáveis Importantes

| Variável            | Descrição                  | Exemplo                             |
| ------------------- | -------------------------- | ----------------------------------- |
| `POSTGRES_HOST`     | Host do PostgreSQL         | `localhost`                         |
| `POSTGRES_PORT`     | Porta do PostgreSQL        | `5432`                              |
| `POSTGRES_USER`     | Usuário do PostgreSQL      | `local_user`                        |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL        | `12345`                             |
| `POSTGRES_DB`       | Nome do banco de dados     | `local_db`                          |
| `DATABASE_URL`      | Connection string completa | `postgres://user:pass@host:port/db` |
| `JWT_SECRET`        | Secret para JWT signing    | `your-secret-key`                   |
| `NODE_ENV`          | Ambiente de execução       | `development`, `production`         |

> ⚠️ **NUNCA** commite arquivos `.env` com valores sensíveis. Use `.env.example` para template.

---

## 📁 Estrutura do Projeto

```
forumdev.com.br/
├── infra/                          # Infraestrutura e configurações
│   ├── compose.yaml               # Docker Compose para PostgreSQL
│   ├── database.js                # Configuração de conexão com DB
│   ├── auth.js                    # Configuração de autenticação
│   ├── migrations/                # Database migrations
│   └── seeds/                     # Seed data para desenvolvimento
│
├── lib/                            # Código compartilhado/utilitários
│   └── auth.js                    # Lógica de autenticação reutilizável
│
├── pages/                          # Next.js pages e API routes
│   ├── _app.js                    # App wrapper global
│   ├── index.js                   # Página home
│   ├── login.js                   # Página de login
│   ├── register.js                # Página de registro
│   ├── profile.js                 # Página de perfil de usuário
│   ├── categories.js              # Página de categorias
│   ├── search.js                  # Página de busca
│   ├── admin/                     # Admin panel pages
│   ├── posts/                     # Posts pages
│   │   ├── [id].js               # Página de post individual
│   │   └── ...
│   └── api/                       # API Routes (v1)
│       └── v1/
│           ├── auth/              # Authentication endpoints
│           │   ├── login.js       # POST /api/v1/auth/login
│           │   ├── register.js    # POST /api/v1/auth/register
│           │   └── me.js          # GET /api/v1/auth/me
│           ├── posts/             # Posts management
│           │   ├── index.js       # GET/POST /api/v1/posts
│           │   └── [id].js        # GET/PUT/DELETE /api/v1/posts/:id
│           ├── comments/          # Comments management
│           ├── categories/        # Categories endpoints
│           ├── admin/             # Admin endpoints
│           │   └── users/         # User management
│           ├── status/            # Health check
│           └── migrations/        # Migration runner
│
├── tests/                          # Test files
│   ├── jestGlobalSetup.js         # Jest setup
│   └── jestGlobalTeardown.js      # Jest teardown
│
├── jest.config.js                 # Jest configuration
├── jsconfig.json                  # JavaScript config (paths)
├── .nvmrc                         # Node version specification
├── .prettierignore                # Prettier ignore patterns
├── .editorconfig                  # Editor standardization
├── package.json                   # Project manifest
├── package-lock.json              # Dependency lock file
└── README.md                      # This file

```

---

## 🔗 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### POST `/auth/register`

Registrar novo usuário.

**Request:**

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "securePassword123"
}
```

**Response (201):**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/auth/login`

Fazer login de usuário existente.

**Request:**

```json
{
  "email": "joao@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/auth/me`

Obter informações do usuário autenticado.

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Posts Endpoints

#### GET `/posts`

Listar todos os posts (com paginação).

**Query Parameters:**

- `page` - Número da página (default: 1)
- `limit` - Posts por página (default: 20)
- `category_id` - Filtrar por categoria

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Como começar com React?",
      "content": "...",
      "author": { "id": 1, "name": "João Silva" },
      "created_at": "2024-01-15T10:30:00Z",
      "comments_count": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### POST `/posts`

Criar novo post (requer autenticação).

**Headers:**

```
Authorization: Bearer {token}
```

**Request:**

```json
{
  "title": "Como começar com React?",
  "content": "Neste post vou explicar os primeiros passos...",
  "category_id": 1
}
```

#### GET `/posts/:id`

Obter detalhes de um post específico.

**Response (200):**

```json
{
  "id": 1,
  "title": "Como começar com React?",
  "content": "...",
  "author": { "id": 1, "name": "João Silva" },
  "comments": [
    {
      "id": 1,
      "content": "Ótimo post!",
      "author": { "id": 2, "name": "Maria" },
      "created_at": "2024-01-15T11:00:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### PUT `/posts/:id`

Atualizar um post (apenas o autor).

#### DELETE `/posts/:id`

Deletar um post (apenas o autor ou admin).

### Categories Endpoints

#### GET `/categories`

Listar todas as categorias.

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "Frontend",
    "description": "Discussões sobre Frontend",
    "posts_count": 42
  },
  {
    "id": 2,
    "name": "Backend",
    "description": "Discussões sobre Backend",
    "posts_count": 38
  }
]
```

### Comments Endpoints

#### POST `/comments`

Criar novo comentário (requer autenticação).

**Headers:**

```
Authorization: Bearer {token}
```

**Request:**

```json
{
  "post_id": 1,
  "content": "Ótimo post, muito útil!"
}
```

### Status Endpoint

#### GET `/status`

Verificar saúde da aplicação.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected"
}
```

---

## 🏗 Arquitetura

### Padrão de Projeto

```
Request Flow:
Browser → Next.js Page → API Route → Database

           ┌─────────────────┐
           │   Next.js App   │
           └────────┬────────┘
                    │
           ┌────────v────────┐
           │   Pages (UI)    │
           └────────┬────────┘
                    │
           ┌────────v────────────┐
           │   API Routes (v1)   │
           ├────────┬────────────┤
           │ Auth   │ Middleware │
           └────────┬────────────┘
                    │
           ┌────────v─────────┐
           │  Database (PG)   │
           └──────────────────┘
```

### Layers

1. **Presentation Layer** (pages/)
   - React components
   - Page layout e UI logic

2. **API Layer** (pages/api/)
   - Next.js API routes
   - Request validation
   - Response formatting

3. **Business Logic** (lib/)
   - Autenticação
   - Utilitários compartilhados

4. **Data Layer** (infra/database.js)
   - Conexão com PostgreSQL
   - Query execution
   - Transaction handling

### Authentication Flow

```
1. User -> Register/Login (POST /api/v1/auth/register ou login)
2. Server -> Hash password (bcryptjs) + Generate JWT
3. Client -> Store JWT in localStorage/cookie
4. Subsequent Requests -> Include "Authorization: Bearer {token}"
5. Middleware -> Verify JWT signature using JWT_SECRET
6. Route Handler -> Access decoded user info
```

---

## 👨‍💻 Desenvolvimento

### Setup Inicial Completo

```bash
# 1. Clonar e instalar
git clone https://github.com/Bscanto/forumdev.com.br.git
cd forumdev.com.br
npm install

# 2. Iniciar infraestrutura
npm run services:up

# 3. Esperar PostgreSQL estar pronto (cerca de 5 segundos)
sleep 5

# 4. Executar migrations
npm run migration:up

# 5. Iniciar dev server
npm run dev
```

A aplicação estará em: `http://localhost:3000`

### Workflow de Desenvolvimento

```bash
# 1. Criar feature branch
git checkout -b feature/minha-feature

# 2. Fazer mudanças e verificar formatação
npm run lint:check

# 3. Formatar código se necessário
npm run lint:fix

# 4. Executar testes localmente
npm test

# 5. Commit e push
git add .
git commit -m "feat: descrição da feature"
git push origin feature/minha-feature

# 6. Criar Pull Request
```

### Best Practices

- **Commits Atômicos** - Um commit = uma funcionalidade pequena
- **Mensagens Clara** - Descrever o que foi feito
- **Código Formatado** - Sempre executar `npm run lint:fix`
- **Testes** - Adicionar testes para novas features
- **Code Review** - Pedir review antes de mergear

---

## 🧪 Testes

### Executar Testes

```bash
# Testes uma única vez
npm test

# Testes em modo watch (reexecuta ao salvar arquivos)
npm run test:watch

# Testes com cobertura
npm test -- --coverage

# Testes de um arquivo específico
npm test -- filename.test.js

# Testes matching a pattern
npm test -- --testNamePattern="should create"
```

### Estrutura de Testes

```
tests/
├── jestGlobalSetup.js      # Setup executado uma vez antes de todos testes
├── jestGlobalTeardown.js   # Cleanup executado uma vez após todos testes
├── unit/                   # Testes unitários (libs, utils)
├── integration/            # Testes de integração (API routes)
└── fixtures/               # Mock data
```

### Escrevendo Testes

**Exemplo - Teste de API:**

```javascript
// pages/api/v1/auth/register.test.js
describe("POST /api/v1/auth/register", () => {
  it("should create new user", async () => {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.token).toBeDefined();
  });
});
```

---

## 🚢 Deploy

### Preparação para Produção

```bash
# 1. Variáveis de ambiente produção
# Configurar .env.production com valores reais

# 2. Build da aplicação
npm run build

# 3. Verificar se build foi sucesso
npm run start

# 4. Teste de smoke
curl http://localhost:3000/api/v1/status
```

### Docker Build

```bash
# Build da imagem
docker build -t forumdev:latest .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://user:pass@db:5432/forumdev \
  -e JWT_SECRET=your-secret \
  forumdev:latest
```

### Deployment Platforms

**Vercel (Recomendado para Next.js)**

```bash
npm install -g vercel
vercel deploy
```

**Railway**

```bash
# Conectar GitHub repo e deployar via dashboard
```

**DigitalOcean App Platform**

- Conectar repositório GitHub
- Selecionar branch main
- Configurar variáveis de ambiente
- Deploy automático

---

## 🔧 Troubleshooting

### PostgreSQL não conecta

```bash
# Verificar se container está rodando
docker ps

# Ver logs do container
docker logs <container_id>

# Reiniciar serviços
npm run services:down
npm run services:up
sleep 5
```

### Jest tests falhando

```bash
# Limpar cache do Jest
npm test -- --clearCache

# Rodar com debug
npm test -- --verbose

# Verificar variáveis de ambiente
cat .env.development
```

### Porta 3000 já em uso

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo (substituir PID)
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run dev
```

### Migrations com erro

```bash
# Verificar status das migrations
npm run migration:up -- --dry-run

# Reverter última migration
npm run migration:down

# Verificar arquivo de migration em infra/migrations/
```

### Errors de permissão

```bash
# Se você não tem permissão em infra/
chmod -R 755 infra/

# Para macOS com M1/M2
# Usar Docker com arquitetura correta
docker run --platform linux/amd64 postgres:16
```

---

## 📖 Documentação Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/) - JWT explanation
- [Bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [Docker Compose Guide](https://docs.docker.com/compose/)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estes passos:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request
6. Descreva suas mudanças claramente no PR

### Diretrizes para Contribuidores

- Seguir o style guide (Prettier + EditorConfig)
- Adicionar testes para novas funcionalidades
- Atualizar documentação conforme necessário
- Não commitar arquivos `.env` com valores sensíveis
- Usar commit messages descritivas

---

## 📝 Roadmap

### v1.1.0 (Próximo)

- [ ] Notificações em tempo real (WebSocket)
- [ ] Sistema de reputação avançado
- [ ] Tags e filtros por tecnologia
- [ ] Badges e achievements para usuários

### v1.2.0

- [ ] Integration com GitHub OAuth
- [ ] Syntax highlighting para code snippets
- [ ] Busca avançada com Elasticsearch
- [ ] Analytics dashboard para admin

### v2.0.0 (Futuro)

- [ ] Mobile app (React Native)
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Real-time collaboration features

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Suporte & Comunidade

- 📧 **Email**: support@forumdev.com.br
- 🐛 **Issues**: [GitHub Issues](https://github.com/Bscanto/forumdev.com.br/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Bscanto/forumdev.com.br/discussions)
- 🐦 **Twitter**: [@forumdevbr](https://twitter.com/forumdevbr)

---

## 🎓 Autor

Desenvolvido com ❤️ pela comunidade ForumDev

**Última atualização:** Janeiro de 2024

---

<div align="center">

**Se este projeto foi útil para você, considere dar uma ⭐ no GitHub!**

[⬆ Voltar ao topo](#forumdev---plataforma-comunitária-de-programação-e-tecnologia)

</div>
