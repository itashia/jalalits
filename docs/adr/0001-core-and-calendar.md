# ADR 0001: Dependency-free immutable core

Status: accepted

## Decision

Publish the calendar primitives as `jalalits`, with no runtime dependencies. Represent values as instants plus an explicit time zone. Keep adapters in independent packages only when they have their own implementation and tests. Use the Borkowski break-year model and document its 1–3177 range.

## Rationale

This matches the reference’s immutable instant model and avoids leaking Laravel/Carbon concepts into browser and Node consumers. IANA timezone behavior is delegated to the standard `Intl` implementation. Explicit per-value timezone and per-call digit localization avoid mutable global configuration.

## Consequences

JavaScript `Date` and ISO string interop are millisecond-precision; core values retain nanoseconds and expose them as `epochNanoseconds`. Calendar compatibility must be judged against the documented Borkowski model, not an unspecified astronomical calendar. Integrations depend on the public core export, and unsupported feature areas remain explicitly undocumented as APIs.
