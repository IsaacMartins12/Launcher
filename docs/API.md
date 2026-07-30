# Documentação da API

Base URL: `http://localhost:2500`

---

## Autenticação

Todas as rotas (exceto `/login`, `/logout` e `/health`) exigem:

```
Authorization: Bearer <token>
```

---

## Endpoints

### POST /login

Autentica o usuário e retorna um JWT.

**Request:**
```json
{
  "username": "170820",
  "password": "123"
}
```

**Response 200:**
```json
{
  "is_Logged": true,
  "is_Admin": true,
  "token": "eyJhbGciOi..."
}
```

**Response 401:**
```json
{
  "is_Logged": false,
  "is_Admin": false,
  "token": ""
}
```

---

### POST /logout

Endpoint stateless (cliente descarta o token).

**Response 200:**
```json
{ "logout": true }
```

---

### GET /health

Verifica saúde da aplicação e conexão com banco.

**Response 200:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

### GET /aluno

Lista as submissões do aluno autenticado (paginado).

**Query params:** `?page=1&per_page=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Curso de Python",
      "type": "Curso",
      "hours": 40,
      "certificate": "cert.pdf",
      "status": "Aprovado",
      "rejection_reason": null,
      "created_at": "2026-07-29T21:10:41"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 3,
    "pages": 1
  }
}
```

---

### POST /files

Cria uma ou mais submissões de horas complementares.

**Request (array ou objeto):**
```json
[
  {
    "title": "Workshop Docker",
    "type": "Workshop",
    "hours": 8,
    "certificate": "docker-cert.pdf"
  }
]
```

**Response 201:**
```json
{ "mensagem": "Dados salvos com sucesso!" }
```

---

### PUT /aluno/:id

Edita uma submissão (apenas se status = "Em Análise").

**Request:**
```json
{
  "title": "Workshop Docker Avançado",
  "type": "Workshop",
  "hours": 16,
  "certificate": "docker-adv.pdf"
}
```

**Response 200:**
```json
{
  "mensagem": "Registro atualizado",
  "registro": { ... }
}
```

---

### DELETE /aluno/:id

Soft-delete de uma submissão (apenas se status = "Em Análise").

**Response 200:**
```json
{ "mensagem": "Registro removido com sucesso" }
```

---

### GET /inst

Lista todas as submissões ativas (admin only, paginado).

**Query params:** `?page=1&per_page=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Curso de Python",
      "type": "Curso",
      "hours": 40,
      "aluno": "Fulano de Tal",
      "turma": "3BE",
      "status": "Em Análise",
      "rejection_reason": null,
      "created_at": "2026-07-29T21:10:41"
    }
  ],
  "pagination": { ... }
}
```

---

### PUT /inst

Aprova ou rejeita uma submissão (admin only).

**Request:**
```json
{
  "id_certificate": 1,
  "status": "Rejeitado",
  "rejection_reason": "Certificado ilegível"
}
```

**Response 200:**
```json
{
  "status": "Atualizado",
  "registro": { ... }
}
```

---

### GET /perfil

Retorna os dados do usuário autenticado.

**Response 200:**
```json
{
  "id": 1,
  "name": "Fulano de Tal",
  "turma": "3BE",
  "username": "170819",
  "is_admin": false
}
```

---

### PUT /perfil

Atualiza nome e/ou turma do usuário.

**Request:**
```json
{
  "name": "Fulano Atualizado",
  "turma": "3CE"
}
```

**Response 200:**
```json
{
  "mensagem": "Perfil atualizado com sucesso!",
  "user": { ... }
}
```

---

## Códigos de Erro Padrão

| Código | Significado |
|--------|-------------|
| 400 | Payload inválido ou campos obrigatórios ausentes |
| 401 | Token ausente, expirado ou credenciais inválidas |
| 403 | Sem permissão (rota admin acessada por aluno) |
| 404 | Recurso não encontrado |
| 422 | Dados não processáveis |
| 500 | Erro interno (resposta sempre em JSON) |
