# Refactor Plan: CQRS → Controllers/Services/Repositories/DTO

## Status
Done (2026-08-22). All 9 modules migrated off CQRS; see docs/adr/0004.
Prisma client relocated to src/generated with @prisma/client alias (74c8dcb).

## Next steps
1. Switch Prisma generator from `prisma-client-js` to `prisma-client` (org baseline for Prisma 7)

See /tmp/refactor_plan_issue.md for full plan.
