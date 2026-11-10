# Migration from Laravel Jalali, troubleshooting, and FAQ

## Migration from Laravel Jalali

The calendar model and common contracts are based on `itashia/laravel-jalali`: Jalali years 1–3177, strict `YYYY/MM/DD` parsing, Persian digit scripts, immutable values, Saturday-first weeks, clamped month arithmetic, and explicit timezone handling. Laravel facades, Carbon, Eloquent casts, validation rules, and global helper functions are framework-specific and are not included in TypeScript packages.

Use `JalaliDateTime.parse` for Jalali strings, `fromDate` for JavaScript `Date` instants, and `fromEpochNanoseconds` when precision matters. The TypeScript implementation has not demonstrated full behavioral compatibility with every method in the PHP package.

## Troubleshooting

- **InvalidDateError on parsing:** keep the exact `YYYY/MM/DD` shape and verify the target date exists.
- **Timezone mismatch:** pass the same IANA timezone at each wall-time boundary. Do not rely on the host default.
- **DST gap:** local wall times skipped by a timezone transition are rejected.
- **Nanoseconds disappear:** `Date` and `toISOString()` are millisecond-only. Use `epochNanoseconds` or `@jalalits/temporal` for lossless instant interchange.
- **React hydration differences:** use explicit dates/months and pass the same `initialNow` snapshot to countdowns on server and client.

## FAQ

**Does JalaliTS use astronomy for every year?** No. It implements the documented Borkowski break-year model.

**Can I change a process-wide locale or timezone?** No. Pass timezone per value and digit choice per format call.

**Are Laravel, recurrence, holidays, and natural-language APIs included?** No. See [feature status](/guide/feature-status).
