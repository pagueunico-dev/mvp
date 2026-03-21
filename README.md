# MVP Pague Unico

Web app para consolidar contas e gerar boleto unico (mock).

## Stack

- Frontend: React (Vite)
- Backend: NestJS + TypeORM + JWT
- DB: PostgreSQL

## URLs apos `docker compose up --build`

| O que | URL | Observacao |
|-------|-----|------------|
| **Interface (use esta)** | http://localhost:5173 | Tela de login; depois o painel com token |
| **API REST** | http://localhost:3000 | Nao e pagina HTML: e JSON |
| Health | http://localhost:3000/health | `{"status":"ok"}` |
| Raiz da API | http://localhost:3000/ | JSON com dicas |
| Mock publico | http://localhost:3000/payments/mock | Sem login |

Se abrir so a porta **3000** no navegador, voce vera JSON (ou mensagem de erro se a API ainda nao subiu). O fluxo correto e: **5173** -> login -> painel.

## Login inicial (seed)

- Usuario: `admin`
- Senha: `admin`
- Perfil: `admin` (acesso total no MVP; rotas protegidas por JWT)

O backend cria esse usuario e contas de exemplo na primeira subida (volume novo do Postgres).

## Docker

```bash
docker compose up --build
```

Opcional: copie `.env.example` para `.env` e ajuste `POSTGRES_*` e `JWT_SECRET`.

O servico **web** so sobe depois que a API passa no **healthcheck** (`/health`), para o proxy `/api` nao falhar na primeira carga.

### Erro `bcrypt_lib.node: Exec format error` na API

O backend usa **bcryptjs** (sem binario nativo) para funcionar no Docker no Windows com bind mount. Se ainda vir erro antigo do bcrypt, recrie os containers: `docker compose down` e `docker compose up --build`.

### Problemas apos mudar o modelo de dados (login / schema)

Se voce ja tinha um volume antigo do Postgres (antes do login JWT), pode faltar colunas ou ficar usuario antigo sem `admin`. Nesse caso, apague o volume e suba de novo:

```bash
docker compose down -v
docker compose up --build
```

## Desenvolvimento local (sem Docker)

1. Postgres acessivel; defina `DATABASE_URL` e `JWT_SECRET` (veja `.env.example`).
2. Backend: `cd backend && npm install && npm run start:dev`
3. Frontend: `cd frontend && npm install && npm run dev`

O Vite encaminha `/api` para `http://localhost:3000` (ou `VITE_PROXY_TARGET` no Docker).

## Documentacao em `regras/`

- `plano_de_trabalho.md`
- `mocks_e_proximas_versoes.md`
