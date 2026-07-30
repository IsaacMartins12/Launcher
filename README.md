# Lançador de Horas Complementares

Sistema web para upload e gerenciamento de horas complementares. Alunos enviam certificados e a instituição aprova ou rejeita as solicitações.

## Stack

- **Frontend**: React 18, Ant Design, React Router
- **Backend**: Flask 3, Flask-JWT-Extended, SQLAlchemy
- **Banco de dados**: MySQL 8
- **Infraestrutura**: Docker Compose

## Como rodar

```bash
docker compose up --build -d
```

| Serviço   | URL                     |
|-----------|-------------------------|
| Frontend  | http://localhost:3001    |
| Backend   | http://localhost:2500    |
| MySQL     | localhost:3306           |

## Usuários de teste

| Usuário | Senha | Perfil  |
|---------|-------|---------|
| 170819  | 1234  | Aluno   |
| 170821  | 1234  | Aluno   |
| 170820  | 123   | Admin   |

## Estrutura do projeto

```
├── autofront/                  # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes (Login, Aluno, Instituição)
│   │   └── components_css/
│   ├── Dockerfile
│   └── package.json
├── launch-backend/             # Backend Flask
│   ├── flaskr/
│   │   ├── __init__.py         # Application factory (create_app)
│   │   ├── app.py              # Entrypoint (Flask CLI)
│   │   ├── config.py           # Configurações (Dev/Prod)
│   │   ├── extensions.py       # SQLAlchemy, JWT, CORS
│   │   ├── models/
│   │   │   ├── user.py         # Model User
│   │   │   └── registro.py     # Model Registro
│   │   ├── routes/
│   │   │   ├── auth.py         # Blueprint: login/logout
│   │   │   ├── student.py      # Blueprint: área do aluno
│   │   │   ├── admin.py        # Blueprint: área do diretor
│   │   │   └── profile.py      # Blueprint: perfil do usuário
│   │   └── schema.sql          # Seed de dados (docker-entrypoint)
│   ├── Dockerfile
│   └── requirements.txt
└── docker-compose.yml          # Orquestração dos 3 serviços
```

## Arquitetura do Backend

O backend segue o **Application Factory Pattern** com **Blueprints** para separação de responsabilidades:

- **Factory** (`__init__.py`): Cria e configura a app, inicializa extensões e registra blueprints
- **Config** (`config.py`): Classes de configuração por ambiente (Development/Production)
- **Extensions** (`extensions.py`): Instâncias das extensões Flask desacopladas da app
- **Models**: SQLAlchemy models com métodos `to_dict()` para serialização
- **Routes**: Blueprints isolados por domínio (auth, student, admin, profile)

## API

| Método | Rota     | Descrição                        | Auth  | Blueprint |
|--------|----------|----------------------------------|-------|-----------|
| POST   | /login   | Autenticação (retorna JWT)       | Não   | auth      |
| POST   | /logout  | Logout                           | Não   | auth      |
| GET    | /aluno   | Listar registros do aluno logado | JWT   | student   |
| POST   | /files   | Enviar atividades complementares | JWT   | student   |
| GET    | /inst    | Listar todas as submissões       | JWT   | admin     |
| PUT    | /inst    | Aprovar/Rejeitar submissão       | JWT   | admin     |
| GET    | /perfil  | Dados do perfil do usuário       | JWT   | profile   |
| PUT    | /perfil  | Atualizar nome/turma             | JWT   | profile   |

## Status do projeto

- [x] Login/autenticação JWT
- [x] Área do aluno (enviar certificados, ver status, editar/excluir)
- [x] Área do diretor (aprovar/rejeitar com motivo)
- [x] Perfil do usuário (avatar, edição de dados)
- [x] Docker Compose (MySQL + Backend + Frontend)
- [x] Layout responsivo (mobile + desktop)
- [x] Backend com Blueprints e Application Factory Pattern
- [x] Filtros por status (Pendentes/Aprovados/Rejeitados)
- [x] Dashboard com cards de resumo
- [ ] Upload real de arquivos (PDF/imagem)
- [ ] Hash de senhas (atualmente plaintext)
- [ ] Testes automatizados
