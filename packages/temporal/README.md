# @jalalits/temporal

Explicit conversion functions between JalaliTS values and Temporal-shaped values. It has no Temporal runtime import and does not install a global polyfill. Supply an implementation when converting _to_ Temporal:

```ts
import { Temporal } from '@js-temporal/polyfill'; // optional, or use native globalThis.Temporal
import { fromTemporalInstant, toTemporalInstant } from '@jalalits/temporal';

const date = fromTemporalInstant(
  Temporal.Instant.from('2026-11-10T12:30:45.123456789Z'),
  'Asia/Tehran',
);
const instant = toTemporalInstant(date, Temporal);
```

Instant adapters preserve nanoseconds. Plain date-time values are local wall time and require an explicit timezone when converted to JalaliTS; nonexistent local times are rejected by the core. Only the ISO calendar is accepted. For older runtimes, install `@js-temporal/polyfill` yourself and pass its `Temporal` namespace. The package peer is optional.
