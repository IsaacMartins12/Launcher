# Arquitetura do Sistema

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + Ant Design | 18.x |
| Backend | Flask (Python) | 3.0 |
| Banco de Dados | MySQL | 8.0 |
| Infraestrutura | Docker Compose | - |
| Autenticação | JWT (Flask-JWT-Extended) | 4.6 |

---

## Diagrama de Containers

```
┌─────────────────────────────────────────────────┐
│                   Docker Host                    │
│                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Frontend  │  │  Backend  │  │   MySQL   │  │
│  │ React     │  │  Flask    │  │   8.0     │  │
│  │ :3001     │──│  :2500    │──│  :3306    │  │
│  └───────────┘  └───────────┘  └───────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Backend — Estrutura

O backend segue o **Application Factory Pattern** com **Blueprints**:

```
launch-backend/
├── flaskr/
│   ├── __init__.py         # Factory (create_app)
│   ├── app.py              # Entrypoint
│   ├── config.py           # Configurações por ambiente
│   ├── extensions.py       # SQLAlchemy, JWT, CORS
│   ├── schemas.py          # Validação (Marshmallow)
│   ├── models/
│   │   ├── user.py         # Model User (bcrypt)
│   │   └── registro.py     # Model Registro (soft delete)
│   ├── routes/
│   │   ├── auth.py         # Login/Logout
│   │   ├── student.py      # CRUD aluno
│   │   ├── admin.py        # Aprovação/Rejeição
│   │   ├── profile.py      # Perfil do usuário
│   │   └── health.py       # Health check
│   └── schema.sql          # Seed de dados
├── requirements.txt
├── pyproject.toml
└── Dockerfile
```

### Padrões aplicados:
- **Application Factory** — App criada via `create_app()`, facilita testes
- **Blueprints** — Separação de rotas por domínio
- **Repository Pattern (leve)** — Models com `to_dict()` e `active()` classmethod
- **Schema Validation** — Marshmallow para validar payloads de entrada
- **Soft Delete** — Registros não são removidos, ganham `deleted_at`
- **Error Handlers** — Respostas sempre em JSON, mesmo em 404/500
- **Password Migration** — Senhas legadas migram para bcrypt no primeiro login

---

## Frontend — Estrutura

```
autofront/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── components_additionalH/
│   │   │   ├── Alunos/
│   │   │   │   ├── Alunos.js        # Área do aluno
│   │   │   │   ├── ActivityForm.js   # Formulário de atividade
│   │   │   │   └── CertificateList.js
│   │   │   └── Instituição/
│   │   │       └── Inst.js           # Área do diretor
│   │   └── components_autonote/      # (legacy)
│   ├── components_css/
│   └── App.js                        # Router
├── Dockerfile
└── package.json
```

### Padrões aplicados:
- **Ant Design** como design system
- **Layout responsivo** com Sider + Content
- **Filtros por status** com Radio.Group
- **Dashboard** com cards de estatísticas
- **JWT armazenado** em localStorage

---

## Comunicação Frontend ↔ Backend

- Protocolo: HTTP REST
- Content-Type: `application/json`
- Autenticação: `Authorization: Bearer <token>`
- CORS habilitado para todas as origens (dev)

---

## Banco de Dados

### Tabela `users`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT PK | Auto increment |
| name | VARCHAR(80) | Nome completo |
| turma | VARCHAR(80) | Turma do aluno |
| username | VARCHAR(80) UNIQUE | Matrícula |
| password | VARCHAR(255) | Hash bcrypt |
| is_admin | BOOL | Perfil admin |

### Tabela `registros`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT PK | Auto increment |
| user_id | INT FK | Referência ao aluno |
| title | VARCHAR(100) | Título da atividade |
| type | VARCHAR(30) | Tipo (curso, palestra...) |
| hours | INT | Carga horária |
| certificate | VARCHAR(200) | Nome do arquivo |
| status | VARCHAR(50) | Em Análise / Aprovado / Rejeitado |
| rejection_reason | VARCHAR(500) | Motivo da rejeição |
| created_at | DATETIME | Data de criação |
| updated_at | DATETIME | Data de atualização |
| deleted_at | DATETIME | Soft delete |
