# Guidance for AI coding agents (project-specific)

This file gives concise, actionable knowledge an AI agent needs to be immediately productive in this repository.

## Big picture
- Architecture: Clean Architecture / layered design — `domain` (entities, interfaces), `usercase` (use-cases), `infra` (concrete implementations), `presentation` (controllers/routes). See [src/app.ts](src/app.ts) and README for the flow.
- Runtime: Express + TypeScript. App is bootstrapped in [src/app.ts](src/app.ts) and started in [src/server.ts](src/server.ts) (note dynamic import pattern).
- Database: Prisma (MySQL). Schema is at [prisma/schema.prisma](prisma/schema.prisma); seeds at [prisma/seed.ts](prisma/seed.ts).

## Important integration points
- Prisma: `PrismaClient` is used across the codebase; factories expect an initialized client (see [src/app.ts](src/app.ts) where `WhatsAppFactory.initialize(prisma)` is called).
- Messaging/WhatsApp: Messaging/WhatsApp logic lives under `infra/messaging`, `infra/whatsapp` and factories under `infra/factories/whatsapp`. Changes here affect scheduled/sent message flow and the DB tables `messaging_instances`, `messaging_messages`, `whatsapp_instances`.
- Kafka: `kafkajs` is a dependency and infra/kafka contains integration points — be cautious modifying producers/consumers.
- Scheduler: Scheduled jobs use `node-cron` with infra/scheduler and scheduled models in Prisma (`scheduled_messages`, `scheduled_tasks`).

## Developer workflows & commands (exact)
- Start in dev (uses `ts-node`): `npm run dev` (runs `ts-node src/server.ts`).
- Debug: `npm run debug` (runs node with `--inspect` and `ts-node/register`).
- Tests: `npm test` (vitest), `npm run test:watch`, `npm run test:coverage`.
- Prisma: `npm run prisma:generate`, `npm run prisma:migrate`, `npm run prisma:studio`. Seeding is configured in `package.json` via `prisma.seed` (runs `ts-node prisma/seed.ts`).

## Project-specific conventions & patterns
- Factory pattern: Concrete infra implementations are exposed via `*Factory` classes. Initialize shared resources (e.g., `WhatsAppFactory.initialize(prisma)`) early in app lifecycle ([src/app.ts](src/app.ts)).
- Repository pattern + interfaces: Look for `ports` and `domain/*/repositories` for interface contracts — implement in `infra/repositories`.
- Routes & middleware: App wiring happens with `initMiddleware(app)` and `initRoutes(app)` (see [src/app.ts](src/app.ts) and [src/middlewares/index.ts](src/middlewares/index.ts)). Add new endpoints by following the README "Add New Endpoint" checklist (domain model → repository interface → infra implementation → use-case → controller → factory → routes).
- Env/config: Environment values live in [src/config/enviroments.ts](src/config/enviroments.ts). DB connection string comes from `DATABASE_URL` in `.env`.

## What to change where (quick reference)
- Add DB models: modify [prisma/schema.prisma](prisma/schema.prisma) → `prisma migrate dev` → update repository implementations under `infra/repositories`.
- Add API endpoint: follow sequence in README; register route in `presentation/routes/initRoutes`.
- Add async background tasks: implement in `infra/scheduler` and use Prisma models (`scheduled_tasks` / `scheduled_messages`).

## Safety and common gotchas
- Avoid changing Prisma client initialization pattern — multiple factories expect a single initialized `PrismaClient` instance (see [src/app.ts](src/app.ts)).
- Kafka and messaging changes can affect production delivery pipelines; search `infra/kafka` and any `producer`/`consumer` uses before refactors.
- Tests run with Vitest — if adding global setup, check `vitest.config.ts`.

## Files to open first when onboarding
- [src/app.ts](src/app.ts)
- [src/server.ts](src/server.ts)
- [src/config/enviroments.ts](src/config/enviroments.ts)
- [src/presentation/routes/initRoutes](src/presentation/routes/initRoutes)
- [infra/factories/whatsapp/WhatsAppFactory](infra/factories/whatsapp/WhatsAppFactory)
- [prisma/schema.prisma](prisma/schema.prisma)
- [package.json](package.json) (scripts)

## Example quick tasks (how-to snippets)
- Run migrations after schema change:

  npm run prisma:migrate

- Start development server with inspector:

  npm run debug

If anything here is unclear or you want a different focus (tests, infra, or onboarding checklist), tell me which section to expand.  
