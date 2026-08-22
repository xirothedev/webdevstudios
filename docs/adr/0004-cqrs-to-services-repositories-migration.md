# Migrate from CQRS to Services/Repositories with TaxEasy structure

We are migrating the API from NestJS CQRS commands/queries to a module-first Services/Repositories structure aligned with TaxEasy-Platform. All modules will be reorganized to `modules/<domain>/{repo,services,controllers,dto,types}`. CQRS command/query handlers are removed; business logic moves to services with explicit transaction boundaries owned by services. Prisma client usage moves from `@generated/prisma` alias to standard `@prisma/client` with an `infra/prisma` wrapper. Repo per module pattern is adopted.

Status: accepted (2026-08-22)

Amendment during implementation: modules keep the flat `src/<module>/` layout
(v2 grilling summary) instead of `modules/<domain>/`; layer folders inside each
module are `repo/`, `services/`, `dto/`, with row shapes in `<module>.types.ts`.
Repos are named `<Entity>Repo` (class-as-contract, no interfaces) per the org
NestJS rules.
