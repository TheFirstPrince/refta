# Refta — Назначение времени заявочникам по тендерам

Production-ready full-stack приложение для планирования тендерных слотов.

## Стек

- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn-style UI components
- **State:** TanStack Query + Zustand
- **Backend:** NestJS REST API
- **DB:** PostgreSQL + Prisma
- **Auth:** JWT (login/password), роли `admin | manager | assignee`
- **Infra:** Docker Compose

## Структура

```text
.
├─ backend/
│  ├─ src/
│  │  ├─ auth/ users/ companies/ contacts/ tenders/ slots/ export/ common/ prisma/
│  │  ├─ app.module.ts
│  │  └─ main.ts
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  ├─ seed.ts
│  │  └─ migrations/202602180001_init/migration.sql
│  ├─ test/slots.integration.spec.ts
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ api/ components/ pages/ store/ types/ lib/
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  └─ Dockerfile
└─ docker-compose.yml
```

## Быстрый старт (Docker)

```bash
docker compose up --build
```

Открыть:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api

## Локальный запуск без Docker

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Тесты

```bash
cd backend
npm test
```

- Unit: `src/slots/overlap.spec.ts`
- Integration: `test/slots.integration.spec.ts`

## Тестовые пользователи

Пароль у всех: `Password123!`

- admin@refta.local (admin)
- manager@refta.local (manager)
- assignee1@refta.local ... assignee4@refta.local (assignee)

## Важная бизнес-логика

- Сервер проверяет пересечения по формуле `(startA < endB) && (startB < endA)`.
- Сервер запрещает создание слота в прошлом для ролей `manager` и `assignee`.
- `durationMin`: 5..480 (шаг 5)
- `startTime`: кратно 5 минутам
- При конфликте API возвращает **409 Conflict**.
