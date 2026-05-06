# objectstream — instructions for Claude

A stream-based JSON parser/stringifier. Published to npm as `@sergdudko/objectstream`.

## Stack

- TypeScript (`tsc`), targeting CJS + ESM dual build with type declarations.
- Node `>=16` runtime; CI tests on Node 20 and 22.
- ESLint + Prettier.
- Test runner: `node --test` with `tsx` import (no Jest/Mocha).

## Commands you must know

```bash
npm run lint          # ESLint over src/**/*.ts — must exit 0
npm run build         # Clean + tsc CJS + tsc ESM + tsc types + write package.json shim
                      # (prebuild also runs lint)
npm test              # node --test --import tsx test/**/*.test.ts — primary suite used by autoupdate
npm run cov           # nyc-wrapped npm test; used by PR checks on Node 20/22
```

## Definition of "done" for any change you make

You are NOT done with a code change until **all three** of the following exit 0 in the working tree on the branch you're going to push:

```bash
npm run lint
npm run build
npm test
```

Run these explicitly with the `Bash` tool before your last commit on the branch. Do not assume "the change looks right" is sufficient — `tsc` errors and ESLint errors must be observed as exit code 0, not inferred. If any of them fail, fix the failure and re-run all three from a clean state until they all pass. Only then commit and push.

If `npm install` is needed (e.g. lockfile changed), run it with `--no-audit --no-fund` and ensure it returned 0 before running checks.

## Boundaries

- Do not modify product logic when fixing dependency-compatibility issues. Acceptable edits: type adjustments, renamed exports, breaking-change shims, ESLint-config tweaks for new rule defaults.
- Do not bump the package `version` manually. Versioning is handled by the autoupdate flow / maintainer on release.
- Do not edit `.github/workflows/build-and-deploy.yml` unless explicitly asked — it is the release pipeline.
- Do not push to `main` directly. Always work on the existing branch you were summoned to.

## When you are working on an autoupdate PR

- Branch will be `chore/autoupdate-<run_id>`.
- Goal: bring `npm run lint && npm run build && npm test` to green.
- Push compatibility fixes onto this branch. Each push re-runs `pr-checks.yml` automatically; you don't need to mention checks back to the maintainer until they're green.
- If a fix is impossible without changing product behavior, stop and leave a comment explaining what's blocked rather than guessing.

## CI quirks specific to this repo

- `TOKEN_FOR_WORKFLOW` (PAT) is **not** configured. The autoupdate workflow uses `GITHUB_TOKEN` and explicitly dispatches `pr-checks.yml` after PR creation, because events created via `GITHUB_TOKEN` do not trigger downstream workflows. If you change autoupdate.yml, preserve this dispatch step.
- The release pipeline (`build-and-deploy.yml`) runs on its own triggers; the new autoupdate flow does not invoke it directly — release is gated on PR merge to `main`.
