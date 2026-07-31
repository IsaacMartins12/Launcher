# 📚 Sistema de Horas Complementares

Sistema full-stack para gestão de atividades complementares acadêmicas. Alunos submetem certificados, diretores aprovam/rejeitam, e o sistema controla limites, pesos e progresso automaticamente.

## 🛠 Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python, Flask, SQLAlchemy, Marshmallow, JWT |
| Frontend | React, Ant Design |
| Banco | MySQL 8.0 |
| Infra | Docker, Docker Compose |

## ✨ Funcionalidades

### Aluno
- Envio de atividades com comprovante obrigatório
- Categorias com limites e pesos configuráveis
- Reenvio de atividades rejeitadas
- Acompanhamento de progresso (horas aprovadas vs meta)
- Notificações em tempo real (aprovação/rejeição)
- Busca e filtros por título e status

### Diretor/Admin
- Aprovação/rejeição com motivo
- Reversão de decisões
- Gestão de categorias (CRUD com limites e pesos)
- Dashboard com métricas agregadas
- Notificações de novos envios
- Busca por nome, matrícula, título e categoria
- Filtros por status e turma

### Técnico
- Autenticação JWT com bcrypt (migração automática de plaintext)
- Soft delete com `deleted_at`
- Paginação server-side
- Validação com Marshmallow schemas
- Error handlers globais (resposta sempre JSON)
- Structured logging
- Health check endpoint
- Proteção de rotas por role (frontend)

## 🚀 Como Rodar

### Pré-requisitos
- Docker e Docker Compose instalados

### Setup

```bash
# Clonar
git clone https://github.com/IsaacMartins12/Launcher.git
cd Launcher

# Configurar variáveis de ambiente
cp .env.example .env

# Subir tudo
docker compose up -d

# Acessar
# Frontend: http://localhost:3001
# Backend:  http://localhost:2500
# Health:   http://localhost:2500/health
```

### Credenciais de desenvolvimento

| Tipo | Matrícula | Senha |
|------|-----------|-------|
| Admin | 170820 | 123 |
| Aluno | 170819 | 1234 |
| Aluno | 170821 | 1234 |

### Comandos úteis

```bash
# Resetar banco (limpa dados)
docker compose down -v
docker compose up -d

# Ver logs do backend
docker compose logs backend --tail 50

# Rebuild após mudanças
docker compose build
docker compose up -d
```

## 📁 Estrutura do Projeto

```
├── launch-backend/
│   └── flaskr/
│       ├── __init__.py          # Application factory
│       ├── config.py            # Configurações por ambiente
│       ├── extensions.py        # SQLAlchemy, JWT, CORS
│       ├── schemas.py           # Validação Marshmallow
│       ├── schema.sql           # DDL + seeds
│       ├── models/
│       │   ├── user.py          # User com bcrypt
│       │   ├── registro.py      # Submissão com soft delete
│       │   ├── category.py      # Categorias com peso/limite
│       │   └── notification.py  # Notificações in-app
│       └── routes/
│           ├── auth.py          # Login/logout
│           ├── student.py       # CRUD submissões do aluno
│           ├── admin.py         # Aprovação + categorias
│           ├── dashboard.py     # Métricas agregadas
│           ├── notification.py  # Listar/marcar como lida
│           ├── profile.py       # Perfil do usuário
│           └── health.py        # Health check
├── autofront/
│   └── src/
│       ├── App.js               # Router + route guards
│       ├── components/
│       │   ├── Login.js         # Tela de login
│       │   └── components_additionalH/
│       │       ├── Alunos/      # Painel do aluno
│       │       └── Instituição/ # Painel do admin
├── docker-compose.yml
├── .env.example
└── docs/
    ├── API.md                   # Documentação completa da API
    ├── BUSINESS_RULES.md        # Regras de negócio
    ├── ARCHITECTURE.md          # Decisões arquiteturais
    ├── SETUP.md                 # Guia de instalação
    └── CONTRIBUTING.md          # Guia de contribuição
```

## 📊 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /login | Autenticação |
| GET | /health | Health check |
| GET | /aluno | Listar submissões (filtros + paginação) |
| POST | /files | Criar submissão |
| PUT | /aluno/:id | Editar submissão |
| DELETE | /aluno/:id | Soft delete |
| POST | /aluno/:id/resubmit | Reenviar rejeitado |
| GET | /inst | Listar todas (admin, filtros) |
| PUT | /inst | Aprovar/rejeitar/reverter |
| GET/POST/PUT/DELETE | /categories | CRUD categorias |
| GET | /notifications | Listar notificações |
| PUT | /notifications/read-all | Marcar todas como lidas |
| GET | /dashboard/admin | Métricas do admin |
| GET | /dashboard/student | Progresso do aluno |
| GET/PUT | /perfil | Perfil do usuário |

Documentação completa em [`docs/API.md`](docs/API.md)

## 📋 Regras de Negócio

- Comprovante obrigatório em toda submissão
- Categorias com limite de horas (bloqueia envio quando atingido)
- Pesos aplicados por categoria (ex: Monitoria 1.5x)
- Aluno pode reenviar atividades rejeitadas
- Admin pode reverter decisões
- Notificações bidirecionais (aluno ↔ admin)

Detalhes em [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md)

## 🔒 Segurança

- Senhas com bcrypt (custo 12)
- JWT com expiração (8h dev / 4h prod)
- Proteção de rotas por role no frontend
- Validação de entrada com Marshmallow
- CORS configurável
- Credenciais em `.env` (não versionado)

## 📝 Licença

MIT
