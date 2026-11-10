# Benchmark methodology

Run `pnpm build` followed by `pnpm bench [iterations]`. The default run performs 5,000 warm-up operations per case, then five sequential batches of 30,000 operations and reports each case's median throughput. Inputs are fixed and representative: one supported Jalali date, its Gregorian equivalent, date parsing, formatting, month arithmetic, and object construction. Results include Node, OS, architecture, CPU, comparison library versions, package entry sizes, and post-run heap deltas.

Comparisons include `jalaali-js` conversion and Day.js with Jalaliday for parsing/calendar selection, formatting, and month arithmetic. Their APIs do not have identical validation or semantic guarantees, so these measurements show relative cost for these inputs only. Heap deltas are observational, include garbage collection effects, and are not allocation benchmarks. Do not infer a general speed ranking from one run. Repeat on the target runtime and hardware before making a performance claim.

The runner emits JSON so the full output can be archived alongside its environment details. No performance claim is made in the package documentation.

## Recorded sample (2026-11-10)

One local run used Node v26.5.0 on an Intel Core i5-13420H with 10,000 operations per batch, five batches, and 5,000 warm-up operations per case. The measured ops/s were: conversion 5.93M (JalaliTS) / 7.93M (`jalaali-js`); strict parse 266.6K (JalaliTS) / 1.44M (Day.js + Jalaliday); formatting 232.9K (JalaliTS) / 3.23M (Day.js + Jalaliday); month arithmetic 63.6K (JalaliTS) / 126.0K (Day.js + Jalaliday); object creation 256.9K (JalaliTS). These are this machine's measurements only and expose optimization opportunities; they do not establish a general ranking.

Built ESM entry sizes from the same run (raw / gzip): core 19.2 / 5.6 kB, API 3.3 / 1.2 kB, React 4.9 / 1.7 kB, Temporal 2.2 / 0.7 kB, and Zod 4.3 / 1.5 kB. These are JavaScript entry sizes, not complete dependency-inclusive application bundles.
