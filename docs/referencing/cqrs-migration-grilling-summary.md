# CQRS → Services/Repositories Grilling Summary

**Session:** /grilling with /domain-modeling
**Date:** 2026-08-12
**Target:** Migrate apps/api from CQRS commands/queries to TaxEasy-Platform style services/repositories

## Decisions captured

### Scope & structure
- All modules in `apps/api/src` are in scope
- Remove CQRS completely; collapse commands/queries into services
- Module shape: `modules/<domain>/{repo,services,controllers,dto,types}`
- Repo per module, service owns transaction boundary
- Types: `*.types.ts` at module root, no `types/` folder
- Prisma: migrate `@generated/prisma` alias to standard `@prisma/client`
- Generate in `apps/api` only, keep schema split files

### Transaction & invariants
- Transaction boundary owned by service, not repo
- Service method is the atomic unit, e.g., `OrderService.createOrder`
- Authorization enforced by guards; service assumes authorized context
- Query building lives in repo; service passes params, repo builds where/pagination

### Prisma & alias
- Rename `PrismaInfraService` → `PrismaService`
- Export PrismaModule globally for injection
- Keep `omit` config for sensitive fields in Prisma client wrapper
- Return Prisma types directly from services; no mapper layer
- DTOs remain in `dto/` folder

### Naming & migration
- Rename Command/Query classes to DTO/Service names
- Keep DTO validation, drop Command/Query buses
- Scheduler jobs call service methods directly

## Open questions
- Exact Prisma v7 migration steps for `@generated/prisma` → `@prisma/client`
- Migration order per module; pilot module recommendation
- Tests: contract tests before refactoring

## ADRs
- `docs/adr/0004-cqrs-to-services-repositories-migration.md`
