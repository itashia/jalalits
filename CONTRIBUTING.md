# Contributing

Use conventional commits (`feat(core): ...`, `fix(core): ...`, `docs: ...`). Add or update tests for behavioral changes and run build, test, lint, typecheck, and formatting checks. Add a Changesets file for every user-facing change. Keep `packages/core` runtime-dependency-free and avoid importing integrations from it. Calendar behavior must cite the chosen model and include boundary tests. Do not claim external accuracy from round-trip tests alone.
