# 🕹️ Teste Técnico – API de Games com NestJS

## Descrição

API desenvolvida em NestJS para pesquisar, listar e armazenar informações de jogos utilizando a API pública RAWG. Inclui autenticação JWT, cache com Redis, persistência em PostgreSQL e está pronta para uso com Docker.

---

## 🚀 Funcionalidades

- **Pesquisar jogo:**`GET /games/search?title=nome_do_jogo`Busca informações do jogo pelo título na RAWG API, armazena no banco e retorna ao usuário. Usa cache para acelerar buscas repetidas.
- **Listar jogos:**`GET /games`Lista todos os jogos salvos no banco, com filtros opcionais por nome e plataforma, além de paginação.
- **Autenticação:**

  - Registro de usuário
  - Login com JWT
  - Refresh token

---

## 🗃️ Estrutura dos Dados

### Game

- `id`: string (UUID)
- `title`: string
- `description`: string
- `platforms`: string[]
- `releaseDate`: Date
- `rating`: number
- `imageUrl`: string

### User

- `id`: string (UUID)
- `username`: string
- `email`: string
- `password`: string (hash)

---

## 🛠️ Instalação e Execução

### 1. Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para rodar localmente sem Docker)
- Yarn (opcional)

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

```bash
cp .env.example .env
```

Adicione sua chave da RAWG API:

```
RAWG_API_KEY=suachaveaqui
```

### 3. Subindo com Docker

```bash
docker-compose -f docker-compose.yml up --build
```

Para desenvolvimento (hot reload, pgadmin):

```bash
docker-compose -f docker-compose-dev.yml up --build
```

A API estará disponível em `http://localhost`.

### 4. Rodando localmente (sem Docker)

1. Instale dependências:
   ```bash
   yarn install
   ```
2. Suba o PostgreSQL e Redis (pode usar Docker para isso).
3. Rode as migrations:
   ```bash
   yarn typeorm migration:run
   ```
4. Inicie a aplicação:
   ```bash
   yarn start:dev
   ```

---

## 🔐 Autenticação

- **Registro:** `POST /auth/register`
- **Login:** `POST /auth/login`
- **Refresh Token:** `POST /auth/refresh-token`

Inclua o token JWT no header `Authorization: Bearer <token>` para acessar endpoints protegidos.

---

## 📚 Exemplos de Uso

### Buscar jogo

```http
GET /games/search?title=minecraft
Authorization: Bearer <token>
```

### Listar jogos (com filtros e paginação)

```http
GET /games?name=zelda&platform=pc&page=1&limit=10
Authorization: Bearer <token>
```

---

## 🧪 Testes

Execute os testes unitários:

```bash
yarn test
```

---

## 📝 Observações

- O cache dos jogos expira em 1 hora.
- O endpoint `/games/search` só busca na RAWG se o jogo não estiver no banco/cache.
- O endpoint `/games` permite filtros por nome e plataforma, além de paginação.
- O projeto já está pronto para deploy em produção com Docker e Nginx.

---

## 📖 Documentação Swagger

Acesse a documentação interativa em:
`http://localhost/api`

---

## 🏗️ Tecnologias

- NestJS
- TypeORM
- PostgreSQL
- Redis
- Docker
- JWT Auth

---

## 👤 Autor

Luis Gustavo Marioto
[linkedin](https://www.linkedin.com/in/lgsanchezmarioto/) [github](https://github.com/kuroshid)
