# Pin Effect 4.0.0-rc.112 exactly

Effect v4 is only available as a fast-moving release candidate (rc.112 at project start; breaking changes land weekly, e.g. schema-aware RPC serialization). We pin `effect` and its `@effect/platform-*` packages to exact `4.0.0-rc.112` — no `^` — so the Mirror builds reproducibly; upgrades are deliberate, verified bumps.

## Considered Options

- Floating `^4.0.0-rc.x`: weekly surprise breakage mid-build. Rejected.
- Staying on Effect v3: not the point of this Mirror.
