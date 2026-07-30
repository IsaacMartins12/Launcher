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
      "weighted_hours": 40.0,
      "certificate": "cert.pdf",
      "status": "Aprovado",
      "rejection_reason": null,
      "category_id": 1,
      "category": "Curso",
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
    "certificate": "docker-cert.pdf",
    "category_id": 3
  }
]
```

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| title | ✅ | Título da atividade (max 100 chars) |
| type | ✅ | Tipo da atividade (max 30 chars) |
| hours | ✅ | Carga horária (inteiro positivo, max 500) |
| certificate | ✅ | Comprovante (path do arquivo ou URL) |
| category_id | ❌ | ID da categoria (valida limite de horas) |

**Validação de limite:** Se `category_id` for informado, o sistema verifica se o total de horas do aluno naquela categoria (excluindo rejeitados) não ultrapassa `max_hours`.

**Response 201:**
```json
{ "mensagem": "Dados salvos com sucesso!" }
```

**Response 400 (limite excedido):**
```json
{ "error": "Limite excedido para 'Curso': máximo 80h, você já tem 30h, restam 50h" }
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

### POST /aluno/:id/resubmit

Reenvia uma submissão rejeitada (reseta status para "Em Análise").

**Regras:**
- Apenas o próprio aluno pode reenviar
- Só funciona se status atual = "Rejeitado"
- Remove o motivo de rejeição anterior

**Response 200:**
```json
{
  "mensagem": "Reenviado para análise",
  "registro": { ... }
}
```

**Response 400:**
```json
{ "error": "Só é possível reenviar registros rejeitados" }
```

---

### GET /categories

Lista todas as categorias de atividade (qualquer usuário autenticado).

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Curso",
    "max_hours": 80,
    "weight": 1.0,
    "description": "Cursos livres, online ou presenciais"
  },
  {
    "id": 5,
    "name": "Monitoria",
    "max_hours": 100,
    "weight": 1.5,
    "description": "Atuação como monitor em disciplinas"
  }
]
```

---

### POST /categories

Cria uma nova categoria (admin only).

**Request:**
```json
{
  "name": "Estágio",
  "max_hours": 200,
  "weight": 2.0,
  "description": "Estágio supervisionado"
}
```

**Response 201:**
```json
{
  "mensagem": "Categoria criada",
  "category": { ... }
}
```

**Response 409:**
```json
{ "error": "Categoria 'Estágio' já existe" }
```

---

### PUT /categories/:id

Atualiza uma categoria existente (admin only). Aceita atualização parcial.

**Request:**
```json
{
  "max_hours": 150,
  "weight": 1.8
}
```

**Response 200:**
```json
{
  "mensagem": "Categoria atualizada",
  "category": { ... }
}
```

---

### DELETE /categories/:id

Remove uma categoria (admin only). Falha se houver registros vinculados.

**Response 200:**
```json
{ "mensagem": "Categoria removida" }
```

**Response 409:**
```json
{ "error": "Não é possível excluir: 5 registro(s) vinculado(s)" }
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

Aprova, rejeita ou reverte uma submissão (admin only).

**Request:**
```json
{
  "id_certificate": 1,
  "status": "Rejeitado",
  "rejection_reason": "Certificado ilegível"
}
```

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| id_certificate | ✅ | ID do registro |
| status | ✅ | "Aprovado", "Rejeitado" ou "Em Análise" |
| rejection_reason | ❌ | Motivo (max 500 chars, preenchido na rejeição) |

**Reversão de status:** O admin pode enviar `"status": "Em Análise"` para reverter uma decisão anterior (caso tenha aprovado/rejeitado por engano).

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
