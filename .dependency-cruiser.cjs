// @ts-check
// Deep-module enforcement for dependency-cruiser.
//
// Two enforcement zones:
//   1. PACKAGES — original package boundary rules (packages/*)
//   2. APP MODULES — ADR-0004 rules for apps/api/src domain modules
//
// Each package under the packages root is a DEEP MODULE: a lot of behaviour
// behind a small interface. A package's PUBLIC SURFACE is its ENTRY POINTS —
// the files at the package root. Implementation lives in SUBFOLDERS and is
// private — by convention `lib/` for implementation and `tests/` for tests,
// though any subfolder is private.
//
// Each domain module under apps/api/src/ follows ADR-0004: a single domain
// unit (orders, payments, products, reviews, redis, storage, auth, etc.)
// with internal layer folders (repo/, services/, dto/). The module's PUBLIC
// SURFACE is its root files (index.ts barrel, *.module.ts, *.controller.ts).
// Subfolder files (repo/, services/, dto/) are private internals — importable
// only from within the same module.

/** Where packages live. One immediate child dir per package (flat, no nesting). */
const PACKAGES_ROOT = 'packages';

/** Where app source lives. Each immediate child dir is a domain module. */
const APP_ROOT = 'apps/api/src';

// --- derived patterns (no need to edit) -------------------------------------
const R = PACKAGES_ROOT;
/**
 * A package's private internals: anything nested inside a package subfolder.
 * The package's root files are its entry points and are NOT matched here —
 * they stay importable from outside.
 */
const PACKAGE_INTERNALS = `^${R}/[^/]+/[^/]+/`;

const A = APP_ROOT;
/**
 * An app module's private internals: anything nested inside a module subfolder.
 * The module's root files (index.ts, *.module.ts, *.controller.ts, etc.) are
 * its public surface and stay importable from outside.
 */
const APP_MODULE_INTERNALS = `^${A}/([^/]+)/([^/]+)/`;

/**
 * Shared modules that any module may import freely — exempt from cross-module
 * boundary and layering rules.
 */
const SHARED = ['common', 'types', 'prisma'];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // =====================================================================
    //  PACKAGE RULES (original)
    // =====================================================================
    {
      name: 'entrypoint-boundary-from-app',
      comment:
        "App/root code may import a package's entry points (its root files), but nothing inside its subfolders.",
      severity: 'error',
      from: { pathNot: `^${R}/` },
      to: { path: PACKAGE_INTERNALS },
    },
    {
      name: 'entrypoint-boundary-across-packages',
      comment:
        "A package's own files import each other freely, but may reach OTHER packages only through their entry points — never their internals.",
      severity: 'error',
      from: { path: `^${R}/([^/]+)/`, pathNot: `^${R}/[^/]+/tests/` },
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/`,
      },
    },
    {
      name: 'tests-through-entrypoints',
      comment:
        "A package's tests exercise it through its entry points like everyone else: they may import any package's entry points and their own tests/ fixtures, but never any package's internals — not even their own.",
      severity: 'error',
      from: { path: `^${R}/([^/]+)/tests/` },
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/tests/`,
      },
    },
    {
      name: 'tests-folder-is-private',
      comment:
        "A package's tests/ folder is reachable only from tests — nothing else may import fixtures.",
      severity: 'error',
      from: { pathNot: `^${R}/[^/]+/tests/` },
      to: { path: `^${R}/[^/]+/tests/` },
    },

    // =====================================================================
    //  APP MODULE RULES (ADR-0004)
    // =====================================================================

    // --- Boundary: cross-module imports go through entry points only ------
    {
      name: 'app-module-boundary-cross',
      comment:
        'A module may reach OTHER modules only through their root entry points (index.ts, *.module.ts, etc.) — never their internal subfolders (repo/, services/, dto/).',
      severity: 'error',
      from: { path: `^${A}/([^/]+)/` },
      to: {
        path: APP_MODULE_INTERNALS,
        // same module → intra-module freedom; shared modules → always allowed
        pathNot: `^${A}/($1|${SHARED.join('|')})/`,
      },
    },
    {
      name: 'app-module-boundary-from-root',
      comment:
        'Root-level app files (app.module.ts, main.ts, etc.) may import module entry points, but not module internals. Shared modules (common, types, prisma) are always accessible.',
      severity: 'error',
      from: { pathNot: `^${A}/([^/]+)/` },
      to: {
        path: APP_MODULE_INTERNALS,
        pathNot: `^${A}/(${SHARED.join('|')})/`,
      },
    },

    // --- Layering within a module -----------------------------------------
    {
      name: 'app-layering-repos-no-services',
      comment:
        "A module's repos layer cannot import its own services layer. Services may import repos, not the reverse.",
      severity: 'error',
      from: { path: `^${A}/([^/]+)/repo/` },
      to: { path: `^${A}/$1/services/` },
    },
    {
      name: 'app-layering-dto-isolation',
      comment:
        "A module's DTO layer is a pure data boundary — it must not import its own repos or services.",
      severity: 'error',
      from: { path: `^${A}/([^/]+)/dto/` },
      to: { path: `^${A}/$1/(repo|services)/` },
    },

    // =====================================================================
    //  SHARED RULES
    // =====================================================================
    {
      name: 'no-circular',
      comment: 'No dependency cycles.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  },
};
