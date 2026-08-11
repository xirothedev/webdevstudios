# Blog seed content lives in TypeScript data files

Blog post content is authored as TypeScript modules in `apps/api/data/blog-posts/*.ts` and loaded into the database by `prisma/blog.seed.ts` (and pushed by `scripts/upload-blog-content.ts`); the API serves posts only from the database. Keeping content in code gives type-checked front-matter and reviewable diffs, while the DB stays the source of truth at runtime. An admin-edited post diverges from its seed copy — the seed is a bootstrap, not a store.
