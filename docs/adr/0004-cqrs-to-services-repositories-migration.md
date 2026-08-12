# Migrate from CQRS to Services/Repositories with TaxEasy structure

We are migrating the API from NestJS CQRS commands/queries to a module-first Services/Repositories structure aligned with TaxEasy-Platform. All modules will be reorganized to `modules/<domain>/{repo,services,controllers,dto,types}`. CQRS command/query handlers are removed; business logic moves to services with explicit transaction boundaries owned by services. Prisma client usage moves from `@generated/prisma` alias to standard `@prisma/client` with an `infra/prisma` wrapper. Repo per module pattern is adopted.

Status: proposed
