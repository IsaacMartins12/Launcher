# Guia de Contribuição

## Estrutura de Branches

- `main` — branch principal, código estável
- Features e fixes são commitados diretamente em `main`

---

## Padrão de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <descrição curta>
```

**Tipos:**
| Tipo | Uso |
|------|-----|
| feat | Nova funcionalidade |
| fix | Correção de bug |
| refactor | Refatoração sem mudança de comportamento |
| chore | Configuração, dependências, CI |
| docs | Documentação |
| style | Formatação (sem mudança de lógica) |
| test | Adição/correção de testes |

**Exemplos:**
```
feat: adicionar paginacao na rota /aluno
fix: corrigir formato de data no frontend
refactor: backend com blueprints e factory pattern
chore: extrair credenciais para .env
```

---

## Padrões de Código

### Backend (Python)
- Python 3.11+
- Line length: 100 chars
- Docstrings em todas as funções públicas
- Type hints quando possível
- Linter: Ruff (config em `pyproject.toml`)

### Frontend (JavaScript)
- React 18 com hooks
- Ant Design como UI library
- Componentes funcionais (sem classes)
- Variáveis de ambiente via `REACT_APP_*`

---

## Adicionando uma Nova Rota (Backend)

1. Criar o arquivo em `flaskr/routes/`
2. Definir o blueprint
3. Registrar no `flaskr/routes/__init__.py`
4. Importar no `flaskr/__init__.py` (`_register_blueprints`)
5. Adicionar schema de validação em `flaskr/schemas.py` se necessário
6. Documentar em `docs/API.md`

---

## Adicionando um Novo Model

1. Criar arquivo em `flaskr/models/`
2. Exportar no `flaskr/models/__init__.py`
3. Incluir `to_dict()` para serialização
4. Atualizar `schema.sql` se necessário para seed
