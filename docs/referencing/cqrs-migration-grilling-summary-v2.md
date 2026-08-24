# CQRS → Services/Repositories Grilling Summary v2

## Latest decisions

- Prisma alias: remove @generated alias entirely; migrate imports to @prisma/client
- Repos: pure data access, query building allowed in repo
- Domain events: keep events via NestJS EventEmitter
- Prisma adapter stays in PrismaService
- Event publishing: service after commit
- Types: Prisma types used directly, no domain type mapping
- Module path: keep flat src/orders/, no modules/ folder
- Schema: keep split prisma files
- Controller-service: direct injection, no application layer
- Migration strategy: big bang
- Testing: all tests type → unit + integration + contract

## Consolidated decisions

- Scope: all modules
- Remove CQRS completely
- Repo per module, service owns transaction
- Prisma client via @prisma/client, PrismaService wrapper renamed
- DTOs stay in dto/ folder
- Services return Prisma types directly
- Authorization via guards only
- Domain events kept, published after commit
- Flat module structure, no modules/ folder

## Next steps
1. Prisma v7 migration plan
2. Codemod for import paths
3. Pilot module refactor
