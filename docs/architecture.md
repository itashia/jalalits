# Architecture

The workspace contains five independently published packages: `jalalits`, `@jalalits/react`, `@jalalits/zod`, `@jalalits/temporal`, and `@jalalits/api`. Optional integrations import only the public `jalalits` entry point. The dependency direction is:

```text
types ← calendar ← datetime ← public index
             errors/localization ↗
  jalalits → React / Zod / Temporal / API adapters
```

Calendar conversion is pure. `JalaliDateTime` is immutable and binds an instant to an explicit timezone. Internal helpers are not re-exported as implementation details except intentionally public calendar and digit helpers. Core has no runtime dependencies. Optional package peers remain optional or peer dependencies. Build output is generated as ESM, CommonJS, declarations, and source maps; package `exports` define stable entry points.

Run `pnpm build`, `pnpm test`, `pnpm lint`, and `pnpm typecheck`. Use a Changesets entry for each public package change. CI validates the workspace and packed package contents but does not publish artifacts. Ranges, recurrence, business calendars, and natural-language parsing are intentionally outside the current package inventory.
