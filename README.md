# 💑 Couple Challenge API

> Uma API gamificada para casais competirem através de desafios e tarefas pontuadas

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-lightgrey)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

---

## 📋 Sobre o Projeto

Couple Challenge é uma aplicação backend que permite casais criarem desafios com tarefas pontuadas, competirem de forma saudável e acompanharem o progresso através de um sistema de gamificação.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação** - Sistema completo com JWT
- 💑 **Gestão de Casais** - Convites, aceitar, recusar, sair
- 🎯 **Desafios** - Criar desafios com períodos personalizados
- ✅ **Tarefas** - CRUD completo de tarefas pontuadas
- 🏆 **Pontuação** - Sistema de completions com cálculo automático de vencedor
- 📊 **Histórico** - Acompanhe todos os desafios completados

---

## 🚀 Demo

**Status:** MVP Backend 100% Completo  
**Deploy:** Em breve (Fase 3 do roadmap)

---

## 🛠️ Tecnologias

### Core
- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem com tipagem estática
- **Express 5** - Framework web minimalista

### Database
- **PostgreSQL 16** - Banco de dados relacional
- **Knex.js** - Query builder e migrations
- **Docker** - PostgreSQL containerizado

### Autenticação & Segurança
- **bcrypt** - Hash de senhas
- **jsonwebtoken** - Tokens JWT
- **Prepared Statements** - Proteção contra SQL Injection

### Desenvolvimento
- **ts-node** - Execução TypeScript em desenvolvimento
- **nodemon** - Hot reload automático
- **dotenv** - Gerenciamento de variáveis de ambiente

---

## 📁 Estrutura do Projeto

```
couple-challenge-api/
├── src/
│   ├── config/           # Configurações (env, etc)
│   ├── database/         # Knex, migrations
│   ├── models/           # Interfaces TypeScript (DB models)
│   ├── dtos/             # Data Transfer Objects
│   ├── types/            # Type extensions
│   ├── errors/           # Custom error classes
│   ├── repositories/     # Acesso ao banco (SQL raw)
│   ├── services/         # Lógica de negócio
│   ├── controllers/      # HTTP handlers
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # Definição de endpoints
│   └── index.ts          # Entry point
├── .env.example          # Template de variáveis
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/signup` | Criar conta |
| POST | `/api/auth/login` | Autenticar usuário |

### Usuário

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/user/profile` | Ver perfil | ✅ |
| PUT | `/api/user/profile` | Atualizar perfil | ✅ |

### Casais

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/couples` | Criar casal (enviar convite) | ✅ |
| GET | `/api/couples/invites` | Listar convites recebidos | ✅ |
| GET | `/api/couples/me` | Ver dados do casal | ✅ |
| GET | `/api/couples/me/pending` | Ver convite pendente enviado | ✅ |
| PUT | `/api/couples/:id/accept` | Aceitar convite | ✅ |
| PUT | `/api/couples/:id/decline` | Recusar convite | ✅ |
| DELETE | `/api/couples/:id` | Cancelar convite | ✅ |
| DELETE | `/api/couples/me` | Sair do casal | ✅ |

### Desafios

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/challenges` | Criar desafio | ✅ |
| GET | `/api/challenges` | Listar desafios | ✅ |
| GET | `/api/challenges/active` | Ver desafio ativo | ✅ |
| GET | `/api/challenges/:id/score` | Ver pontuação atual do desafio | ✅ |
| PUT | `/api/challenges/:id/finish` | Finalizar desafio | ✅ |

### Tasks

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/tasks` | Criar task | ✅ |
| GET | `/api/challenges/:id/tasks` | Listar tasks do desafio | ✅ |
| PUT | `/api/tasks/:id` | Atualizar task | ✅ |
| DELETE | `/api/tasks/:id` | Deletar task | ✅ |

### Completions

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/task-completions` | Completar task | ✅ |

---

## 🏗️ Arquitetura

### Padrão de Camadas

```
HTTP Request → Routes → Middleware → Controller → Service → Repository → Database
                  ↓                                                           ↓
            Error Handler ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### Separação de Responsabilidades

- **Routes:** Definição de endpoints e middlewares
- **Middlewares:** Autenticação, error handling
- **Controllers:** Extração de dados HTTP, chamada de services
- **Services:** Lógica de negócio, validações, orquestração
- **Repositories:** Acesso ao banco de dados (SQL raw)

---

## 🔐 Segurança

### Implementado ✅
- ✅ Hash de senhas com bcrypt (10 salt rounds)
- ✅ JWT tokens (expiração 30 dias)
- ✅ Prepared statements (proteção SQL Injection)
- ✅ Validação de ownership (autorização)
- ✅ Mensagens de erro genéricas
- ✅ TypeScript strict mode

### Planejado ⏳
- ⏳ Refresh tokens
- ⏳ Rate limiting
- ⏳ 2FA
- ⏳ CORS configurado
- ⏳ Helmet.js

---

## 🗺️ Roadmap

### ✅ Fase 1 - MVP Backend (COMPLETO)
- [x] Auth Feature
- [x] User Feature
- [x] Couples Feature (7 endpoints)
- [x] Challenges Feature (4 endpoints)
- [x] Tasks Feature (4 endpoints)
- [x] Task Completions Feature

### 🔄 Fase 2 - MVP Frontend
- [ ] Setup React + Design System
- [ ] Autenticação UI
- [ ] Gestão de Casais
- [ ] Desafios e Tasks
- [ ] Dashboard

### 🚀 Fase 3 - Deploy Beta
- [ ] Deploy Backend (Railway/Heroku)
- [ ] Deploy Frontend (Vercel)
- [ ] Banco em nuvem
- [ ] Monitoramento básico

### ⚡ Fase 4 - Features Avançadas
- [ ] Upload de imagens (S3/Cloudinary)
- [ ] Gamificação (badges, níveis)
- [ ] Notificações
- [ ] Timeline/Histórico

### 🧪 Fase 5+ - Qualidade & Escala
- [ ] Testes automatizados
- [ ] CI/CD
- [ ] Logs estruturados
- [ ] Kubernetes (se necessário)


### Padrão de Commits (Gitmoji)

- `✨ ` - Nova funcionalidade
- `🐛 ` - Correção de bug
- `📝 ` - Documentação
- `♻️ ` - Refatoração
- `🔧 ` - Configuração/manutenção

---

## 👨‍💻 Autor

**Gabriel Freire**

- GitHub: [@gafreire](https://github.com/gafreire)
- LinkedIn: [Gabriel Freire](https://www.linkedin.com/in/gabriel-freire-fumes/)

---

<p align="center">
  Feito com ❤️ por Gabriel Freire
</p>
