# Regras de Negócio

## Visão Geral

O sistema de Horas Complementares permite que alunos registrem atividades extracurriculares e a instituição (diretor/coordenador) aprove ou rejeite essas solicitações.

---

## Perfis de Usuário

### Aluno
- Pode enviar solicitações de horas complementares
- Pode editar ou excluir solicitações **apenas enquanto estiverem com status "Em Análise"**
- Visualiza o histórico completo de envios com status (aprovado, rejeitado, pendente)
- Pode editar seu perfil (nome, turma)
- Recebe justificativa quando uma solicitação é rejeitada

### Diretor/Admin
- Visualiza todas as solicitações de todos os alunos
- Pode aprovar ou rejeitar solicitações pendentes
- Deve informar motivo ao rejeitar uma solicitação
- Tem acesso ao dashboard com métricas gerais

---

## Fluxo de Submissão

```
Aluno adiciona atividade(s)
        ↓
Aluno envia para análise → Status: "Em Análise"
        ↓
Diretor visualiza na área institucional
        ↓
    ┌───────────┐
    │  Aprovar  │ → Status: "Aprovado"
    └───────────┘
    ┌───────────┐
    │  Rejeitar │ → Status: "Rejeitado" + motivo
    └───────────┘
```

---

## Regras de Submissão

| Regra | Descrição |
|-------|-----------|
| Campos obrigatórios | Título, tipo de atividade, carga horária |
| Horas | Deve ser um número positivo, máximo 500h por registro |
| Edição | Só permitida enquanto status = "Em Análise" |
| Exclusão | Soft delete — registro permanece no banco com `deleted_at` preenchido |
| Reenvio | Não implementado — aluno deve criar nova submissão |

---

## Regras de Aprovação/Rejeição

| Regra | Descrição |
|-------|-----------|
| Permissão | Apenas usuários com `is_admin = true` |
| Status válidos | "Aprovado" ou "Rejeitado" |
| Motivo de rejeição | Opcional, mas recomendado (campo `rejection_reason`) |
| Reversão | Não implementada — uma vez aprovado/rejeitado, não pode ser alterado |

---

## Autenticação

| Regra | Descrição |
|-------|-----------|
| Método | JWT (Bearer token no header Authorization) |
| Expiração | 8 horas (development) / 4 horas (production) |
| Hash de senha | bcrypt com migração automática de plaintext |
| Logout | Stateless — cliente descarta o token |

---

## Tipos de Atividade Aceitos

Não há restrição no backend (campo livre). Exemplos comuns:
- Curso
- Palestra
- Evento
- Workshop
- Monitoria
- Projeto de extensão
- Voluntariado

---

## Meta de Horas

- Meta padrão: **200 horas** (configurado no frontend)
- Apenas horas com status "Aprovado" contam para o progresso
