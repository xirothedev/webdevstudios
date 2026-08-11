# Bun is the single package manager and lockfile

The repository was migrated to bun (root `packageManager: bun@1.3.14`) and keeps `bun.lock` as the only lockfile. `yarn.lock` and `package-lock.json` were never re-added. Multiple lockfiles let dependency sets drift apart and split supply-chain auditing; one package manager keeps installs reproducible.
