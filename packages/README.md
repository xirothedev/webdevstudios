# Packages

Every package here is a **deep module**: a lot of behaviour behind a small interface.

## Layout

```
packages/
  <name>/
    index.ts        ← an entry point (public). Import this from outside.
    client.ts       ← another entry point. Packages may expose SEVERAL.
    lib/            ← implementation: hidden from outside, free to import each other.
    tests/          ← co-located tests + fixtures (a subfolder, so private).
```

## The one rule

**Import only through a package's entry points (its root files).** Anything in a subfolder (`lib/`, `tests/`, or any other) is private — not even the package's own tests may reach its internals. This is enforced by dependency-cruiser, so a deep import fails the check rather than the review.

The four enforced rules: entry-point boundary (outside code imports only root files), intra-package freedom (a package's own files import each other freely), tests through the entry points (tests may import any package's entry points and their own `tests/` fixtures, never internals), and no cycles.

**No barrel files.** Don't funnel a whole subtree through one `index.ts`. The public surface is every root file — expose several small entry points (`index.ts`, `client.ts`, `server.ts`) and hide implementation in subfolders.

## Check

```bash
bun run lint:boundaries   # depcruise packages
```

Copy `packages/example/` to start a new package, or delete it.
