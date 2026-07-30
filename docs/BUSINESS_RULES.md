# Regras de Negócio

## Visão Geral

O sistema de Horas Complementares permite que alunos registrem atividades extracurriculares e a instituição (diretor/coordenador) aprove ou rejeite essas solicitações.

---

## Perfis de Usuário

### Aluno
- Pode enviar solicitações de horas complementares (com comprovante obrigatório)
- Pode editar ou excluir solicitações **apenas enquanto estiverem com status "Em Análise"**
- Pode **reenviar** solicitações rejeitadas (reseta status para "Em Análise")
- Visualiza o histórico completo de envios com status (aprovado, rejeitado, pendente)
- Pode editar seu perfil (nome, turma)
- Recebe justificativa quando uma solicitação é rejeitada

### Diretor/Admin
- Visualiza todas as solicitações de todos os alunos
- Pode aprovar ou rejeitar solicitações pendentes
- Deve informar motivo ao rejeitar uma solicitação
- Pode **reverter** uma decisão (voltar registro para "Em Análise") caso tenha errado
- Gerencia as categorias de atividade (criar, editar, remover)
- Tem acesso ao dashboard com métricas gerais

---

## Fluxo de Submissão

```
Aluno adiciona atividade(s) com comprovante
        ↓
Aluno envia para análise → Status: "Em Análise"
        ↓
Diretor visualiza na área institucional
        ↓
    ┌───────────┐
    │  Aprovar  │ → Status: "Aprovado" ───────────────────────┐
    └───────────┘                                              │
    ┌───────────┐                                              │
    │  Rejeitar │ → Status: "Rejeitado" + motivo               │
    └─────┬─────┘                                              │
          │                                                    │
          ▼                                                    ▼
    ┌────────────┐                                   ┌─────────────────┐
    │  Reenviar  │ → Aluno corrige e reenvia         │ Reverter (admin)│
    │  (aluno)   │   Status volta: "Em Análise"      │ volta p/ Análise│
    └────────────┘                                   └─────────────────┘
```

---

## Regras de Submissão

| Regra | Descrição |
|-------|-----------|
| Campos obrigatórios | Título, tipo de atividade, carga horária, comprovante |
| Comprovante | Obrigatório (imagem, PDF ou qualquer prova da atividade) |
| Horas | Deve ser um número positivo, máximo 500h por registro |
| Categoria | Opcional — se informada, valida limite de horas por tipo |
| Limite por categoria | Total de horas do aluno na categoria (excluindo rejeitados) não pode exceder `max_hours` |
| Edição | Só permitida enquanto status = "Em Análise" |
| Exclusão | Soft delete — registro permanece no banco com `deleted_at` preenchido |
| Reenvio | Aluno pode reenviar registros **rejeitados** (reseta para "Em Análise") |

---

## Regras de Aprovação/Rejeição

| Regra | Descrição |
|-------|-----------|
| Permissão | Apenas usuários com `is_admin = true` |
| Status válidos | "Aprovado", "Rejeitado" ou "Em Análise" (reversão) |
| Motivo de rejeição | Opcional, mas recomendado (campo `rejection_reason`, max 500 chars) |
| Reversão | Admin pode reverter para "Em Análise" caso tenha errado a decisão |

---

## Autenticação

| Regra | Descrição |
|-------|-----------|
| Método | JWT (Bearer token no header Authorization) |
| Expiração | 8 horas (development) / 4 horas (production) |
| Hash de senha | bcrypt com migração automática de plaintext |
| Logout | Stateless — cliente descarta o token |

---

## Categorias de Atividade

O admin gerencia categorias com limites e pesos. Cada categoria define:

| Atributo | Descrição |
|----------|-----------|
| `name` | Nome único (ex: Curso, Palestra, Monitoria) |
| `max_hours` | Máximo de horas que um aluno pode submeter nesta categoria |
| `weight` | Multiplicador aplicado às horas (ex: 1.5 = hora vale 50% a mais) |
| `description` | Descrição opcional da categoria |

### Categorias padrão (seed)

| Categoria | Limite (h) | Peso | Descrição |
|-----------|:----------:|:----:|-----------|
| Curso | 80 | 1.0 | Cursos livres, online ou presenciais |
| Palestra | 40 | 0.8 | Participação como ouvinte em palestras |
| Workshop | 60 | 1.0 | Oficinas práticas e workshops |
| Evento | 40 | 0.8 | Participação em eventos acadêmicos |
| Monitoria | 100 | 1.5 | Atuação como monitor em disciplinas |
| Projeto de Extensão | 120 | 1.5 | Participação em projetos de extensão |
| Voluntariado | 60 | 1.2 | Atividades voluntárias comprovadas |

### Regras de categorias

- Admin pode criar, editar e deletar categorias
- Não é possível excluir uma categoria com registros vinculados
- O peso é aplicado como `weighted_hours = hours × weight`
- Submissões sem categoria são aceitas (campo livre no `type`)

---

## Horas Ponderadas (weighted_hours)

- Cada submissão calcula `weighted_hours = hours × category.weight`
- Se não houver categoria vinculada, `weighted_hours = hours` (peso 1.0)
- O progresso do aluno pode considerar horas ponderadas para bonificação

---

## Meta de Horas

- Meta padrão: **200 horas** (configurado no frontend)
- Apenas horas com status "Aprovado" contam para o progresso
