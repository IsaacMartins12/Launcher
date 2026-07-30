# Guia de Setup

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose instalados
- Git

---

## Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/IsaacMartins12/Launcher.git
cd Launcher

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env

# 3. (Opcional) Editar credenciais no .env
# nano .env

# 4. Subir os containers
docker compose up --build -d
```

---

## Acessando os Serviços

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3001 | Interface web (React) |
| Backend API | http://localhost:2500 | REST API (Flask) |
| Health Check | http://localhost:2500/health | Status da aplicação |
| MySQL | localhost:3306 | Acesso direto ao banco |

---

## Usuários de Teste

| Matrícula | Senha | Perfil |
|-----------|-------|--------|
| 170819 | 1234 | Aluno |
| 170821 | 1234 | Aluno |
| 170820 | 123 | Admin/Diretor |

> As senhas são migradas automaticamente para bcrypt no primeiro login.

---

## Comandos Úteis

```bash
# Ver logs do backend
docker compose logs backend -f

# Rebuild apenas o backend
docker compose up --build -d backend

# Parar tudo
docker compose down

# Resetar banco (apaga dados)
docker compose down -v
docker compose up --build -d
```

---

## Variáveis de Ambiente

Definidas no `.env` na raiz do projeto:

| Variável | Descrição | Default |
|----------|-----------|---------|
| MYSQL_ROOT_PASSWORD | Senha root do MySQL | root |
| MYSQL_DATABASE | Nome do banco | launch |
| MYSQL_USER | Usuário do banco | root |
| MYSQL_PASSWORD | Senha do usuário | root |
| MYSQL_HOST | Host do MySQL (nome do service) | db |
| FLASK_APP | Entrypoint Flask | flaskr/app.py |
| FLASK_DEBUG | Modo debug | 1 |
| SECRET_KEY | Chave para JWT e sessões | (gerar uma segura em prod) |

---

## Troubleshooting

**Backend não conecta no banco:**
- Verifique se o container `db` está healthy: `docker compose ps`
- O backend espera o healthcheck do MySQL antes de iniciar

**Porta 3000 ocupada:**
- O frontend é mapeado para 3001 (`3001:3000`)
- Se 3001 também estiver ocupada, altere no `docker-compose.yml`

**Senhas não funcionam após resetar o banco:**
- O seed usa senhas plaintext que são migradas para bcrypt no primeiro login
- Se o volume foi removido (`-v`), os dados de seed são reinseridos
