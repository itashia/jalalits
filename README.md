# JalaliTS

**JalaliTS** is a modern, powerful, zero-dependency Persian (Jalali) date and time library built with TypeScript. The `jalalits` core provides immutable calendar and date-time primitives, with separate integrations for React, Zod, Temporal, and framework-neutral API boundaries.

```ts
import { jalali, JalaliDateTime } from 'jalalits';

const nowruz = jalali('1405/01/01', 'Asia/Tehran');
nowruz.addMonths(1).format('l j F Y');
const typedValue = JalaliDateTime.parse('1405/01/01', 'Asia/Tehran');
```

The calendar follows the Borkowski break-year model (Jalali years 1–3177). See [architecture](./docs/architecture.md), [core API](./docs/en/api.md), and [Persian API notes](./docs/fa/api.md).

| Package              | Purpose                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `jalalits`           | Calendar, immutable date-time, parsing, formatting, arithmetic, comparison, and timezone behavior |
| `@jalalits/react`    | Headless React 19 hooks                                                                           |
| `@jalalits/zod`      | Zod 4 validation and transformation schemas                                                       |
| `@jalalits/temporal` | Explicit adapters for Temporal values                                                             |
| `@jalalits/api`      | Framework-neutral request parsing and response serialization                                      |

The [VitePress documentation](./apps/docs/site/index.md) and runnable examples are in the workspace. Ranges, recurrence, business-calendar data, and natural-language parsing are not included in this release.

## Installation

```sh
npm install jalalits
```

Install integration packages separately as needed.

## Development

Requires Node.js 22+ and pnpm 10. Run `pnpm install`, then `pnpm build`, `pnpm test`, `pnpm lint`, and `pnpm typecheck`. No package is published by CI. Public package names are verified separately before any release.

Contributions should use conventional commit messages such as `feat(core): add range comparison` and include a Changesets entry for user-facing changes.
