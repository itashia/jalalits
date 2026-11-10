# Core API contract

`JalaliDateTime` is an immutable value representing an instant plus an explicit IANA timezone used for calendar fields. `create` accepts Jalali components; `parse` accepts exactly `YYYY/MM/DD`. Parsing accepts ASCII, Persian, and Arabic-Indic numerals. Invalid dates, unsupported years (1–3177), time fields, timezone identifiers, and format tokens raise `InvalidDateError`.

The calendar uses the Borkowski break-year model from the Laravel reference. Gregorian conversion is proleptic Gregorian. Calendar day arithmetic advances local calendar dates; hour/minute/second arithmetic advances elapsed UTC time. Month arithmetic clamps to the final day in the destination month. Comparison uses the instant. `dayOfWeek()` is Saturday=0; `format` supports the Jalali tokens `Y m n d j F l z t L`, supported time tokens, escaped literals, and optional Persian digits.

Timezone creation rejects a nonexistent local wall time. `toTimeZone` preserves the instant. JavaScript `Date` interoperability has millisecond precision; an additional microsecond remainder is preserved when explicitly supplied, but `Date` cannot carry that remainder. The core has no runtime dependencies and reads no process-global locale or timezone settings.
