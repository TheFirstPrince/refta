# Закупки — внутренняя mini-CRM для тендерных закупок

Next.js 15 + Prisma + PostgreSQL приложение для работы с карточками закупок, товарами, поставщиками, историей цен, документами и AI-extract (mock provider).

## 1) Tree проекта

```text
.
├─ app/
│  ├─ (auth)/login/page.tsx
│  ├─ (app)/procurements/page.tsx
│  ├─ (app)/procurements/[id]/page.tsx
│  ├─ (app)/products/page.tsx
│  ├─ (app)/suppliers/page.tsx
│  ├─ (app)/documents-ai/page.tsx
│  ├─ api/... (route handlers)
│  └─ layout.tsx
├─ components/
│  ├─ layout/AppShell.tsx, Sidebar.tsx
│  ├─ procurements/ProcurementForm.tsx, ItemsTable.tsx, AddItemDialog.tsx
│  └─ suggestions/SuggestionPanel.tsx
├─ lib/
│  ├─ normalize.ts, money.ts, suggestions.ts
│  ├─ prisma.ts, auth.ts, rbac.ts
│  └─ ai-provider.ts
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.ts
│  └─ migrations/202602181200_init/migration.sql
├─ tests/
│  ├─ normalize.test.ts
│  └─ suggestions.test.ts
├─ docker-compose.yml
└─ .env.example
```

## 2) Запуск

```bash
docker compose up -d
npm i
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## 3) Логины сидов

- admin@example.com / admin123
- buyer1@example.com / buyer123

## 4) Что реализовано

- Карточки закупок с расчетами: `totalItemsCost`, `totalCost`, ручная поправка `purchaseCostManual`.
- Позиции в закупке с `source: manual|history|ai`.
- Автопредложения по товару из истории цен (latest/frequent/min).
- Автозапись PriceHistory при создании позиции + антидубликат 24 часа.
- Экспорт CSV по закупке.
- Загрузка документов и AI extract/draft через провайдер-интерфейс (mock).
- Auth (NextAuth Credentials) + RBAC.
- zod-валидации API.

## 5) Тесты

```bash
npm run test
```

- normalizeKey() — `tests/normalize.test.ts`
- buildPriceSuggestions() — `tests/suggestions.test.ts`
