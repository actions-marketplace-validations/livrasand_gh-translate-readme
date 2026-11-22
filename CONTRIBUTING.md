# Contributing

## Quick start

```bash
npm ci
npm run verify   # lint + tests con cobertura + comprobación de dist/
```

Requires Node.js 20 or newer. `npm run verify` is exactly what CI checks, so if it passes
locally it should pass in the pull request.

## Commands

| Command | What it does |
| --- | --- |
| `npm test` | Runs the unit/integration suite with the built-in Node test runner. No network or remote git operations (one test uses a throwaway local repo). |
| `npm run test:coverage` | Same tests plus coverage. Fails below 90% lines/functions/statements and 85% branches. |
| `npm run lint` | ESLint over source, tests and config. |
| `npm run build` | Rebuilds `dist/index.js` with `ncc`. **Always run this before committing source changes.** |
| `npm run check:dist` | Rebuilds into a temporary copy and compares hashes with committed `dist/`. |
| `npm run verify` | All of the above checks in the right order. |

CI runs lint and coverage on Node 20 and 22, and separately verifies that `dist/` matches
the source. GitHub Actions executes `dist/index.js`, not `index.js`, so a missing rebuild
is the most common way to ship a change that "works locally".

## Layout

- `index.js` — entrypoint; only calls `run()` when executed directly.
- `src/runner.js` — orchestration and dependency wiring. Every external dependency is
  injectable, which is what makes the tests hermetic.
- `src/config.js` — `LANG` validation.
- `src/readme.js` — README discovery, reading and parsing.
- `src/markdown.js` — AST helpers; code/HTML/frontmatter are never translated.
- `src/translator.js` — bounded-concurrency translation with retries.
- `src/git.js` — commit/push only the translated file.
- `src/git-client.js` — compatibility adapter for simple-git v3/v4.
- `src/errors.js` / `src/logger.js` — contextual errors and step-prefixed logs.
- `scripts/check-dist.js` — hash comparison that catches a forgotten rebuild.
- `tests/` — one file per module, plus end-to-end and metadata checks.

## Diagnosing a failure

Action logs are prefixed with the current step, for example:

```
[translate-readme:read] README parsed {"file":"README.md","textNodes":42}
[translate-readme:commit] Translation pushed {"outputFile":"README.fr.md"}
::error::[TRANSLATION_FAILED@translate] Could not translate text node #7 to "fr": ...
```

The failing message follows `[CODE@step]`:

| Code | Step | Meaning |
| --- | --- | --- |
| `INVALID_LANGUAGE` | `config` | `LANG` is empty, malformed or could escape the output filename. |
| `DIRECTORY_READ_FAILED` | `read` | The working directory cannot be listed. |
| `README_NOT_FOUND` | `read` | No `readme.md`, `README.md` or `Readme.md` in the workspace. |
| `README_READ_FAILED` | `read` | The README exists but cannot be read. |
| `README_EMPTY` | `read` | The README has no content. |
| `README_NO_TEXT` | `read` | The README has no translatable text (only code/HTML). |
| `TRANSLATION_FAILED` | `translate` | The translation API failed after all retries. Details include node index, AST path and original text. |
| `WRITE_FAILED` | `write` | The translated file could not be written. |
| `GIT_FAILED` | `commit` | `git status/add/commit/push` failed. Details include the git message. |
| `*_FAILED` / `UNEXPECTED_ERROR` | any | Unexpected exception in that step; the original error is kept as `cause`. |

Errors are reported with `core.setFailed()` (a GitHub annotation plus a non-zero exit code),
never with `process.exit()`, so logs are flushed and tests can assert the exact message.

If a translated node is wrong, its `path` (for example `root.children[3].children[1]`) points
to the exact location in the markdown AST. Add a regression test in the matching `tests/*.test.js`
file before fixing it.

## Writing tests

- Use `node:test` and `node:assert/strict`.
- Inject fakes via `createDeps()` from `tests/helpers.js`; never call the translation API,
  git or a real remote in a unit test.
- Assert behaviour and error codes, not implementation details.
- Test the unhappy path too: every error code above should have a test that produces it.
