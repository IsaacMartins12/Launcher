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
├── autofront/           # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes (Login, Aluno, Instituição)
│   │   └── components_css/
│   ├── Dockerfile
│   └── package.json
├── launch-backend/      # Backend Flask
│   ├── flaskr/
│   │   ├── app.py      # Rotas da API
│   │   └── schema.sql  # Schema do banco
│   ├── Dockerfile
│   └── requirements.txt
└── docker-compose.yml   # Orquestração dos 3 serviços
```

## API

| Método | Rota     | Descrição                        | Auth  |
|--------|----------|----------------------------------|-------|
| POST   | /login   | Autenticação (retorna JWT)       | Não   |
| POST   | /logout  | Logout                           | Não   |
| GET    | /aluno   | Listar registros do aluno logado | JWT   |
| POST   | /files   | Enviar atividades complementares | JWT   |
| GET    | /inst    | Listar todas as submissões       | JWT   |
| PUT    | /inst    | Aprovar/Rejeitar submissão       | JWT   |

## Status do projeto

- [x] Login/autenticação JWT
- [x] Área do aluno (enviar certificados, ver status)
- [x] Docker Compose (MySQL + Backend + Frontend)
- [x] Layout responsivo (mobile + desktop)
- [ ] Área do diretor (aprovar/rejeitar)
- [ ] Upload real de arquivos (PDF/imagem)
- [ ] Hash de senhas (atualmente plaintext)
