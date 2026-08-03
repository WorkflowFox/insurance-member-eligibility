# Local Tooling and Environment Pitfalls

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference documents two environment-level (not code-level) issues
that can silently block or corrupt LWC Jest validation. Neither is
specific to any project's business domain — both are properties of the
local machine and the installed tooling versions, and both are worth
checking *before* concluding that a Jest hang or failure is a defect in
the generated component.

---

## `sfdx-lwc-jest` / `@lwc/engine-dom` ESM-CJS Resolution Failures

Recent `@lwc/engine-dom` releases (9.x) declare `"type": "module"` with
`"main"` pointing at an ESM build (`dist/index.js`). Some versions of
`@salesforce/sfdx-lwc-jest`'s bundled Jest resolver map the bare `lwc`
specifier used in test files (`import { createElement } from 'lwc'`) via
`require.resolve('@lwc/engine-dom')` — which now resolves to that ESM
`main` entry instead of the package's CommonJS build
(`dist/index.cjs`). Because Jest's default `transformIgnorePatterns`
excludes `node_modules`, the ESM file fails to parse:

```text
SyntaxError: Unexpected token 'export'
    at .../node_modules/@lwc/engine-dom/dist/index.js:...
```

**Fix**: add a `moduleNameMapper` entry to the project's `jest.config.js`
that points the bare `lwc` specifier directly at the package's CommonJS
build, bypassing the broken resolver special-case:

```js
const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        ...(jestConfig.moduleNameMapper || {}),
        '^lwc$': require.resolve('@lwc/engine-dom/dist/index.cjs')
    }
};
```

Before assuming a Jest parse failure is a defect in the generated
component or test, check whether the failing file is inside
`node_modules/@lwc/` — if so, this resolution mismatch is the likely
cause, not the component under test.

---

## Base-Component Jest Stub Return Values

`sfdx-lwc-jest`'s bundled `lightning-*` stubs are intentionally minimal —
they are not spec-accurate mocks of the real base components. Notably,
the `lightning-input` stub implements validation methods as no-ops that
return `undefined`:

```js
@api reportValidity() {}   // always returns undefined under test
```

Component code that gates on falsy return values —
`if (!inputField.reportValidity()) { return; }` — will silently treat
every test run as "invalid" and never reach the code being tested (e.g.,
an Apex call is never invoked, and the test assertion that expects it to
have been called fails with zero recorded calls). This is easy to
misdiagnose as a broken mock rather than a component bug, because the
real `lightning-input.reportValidity()` does return a proper boolean in a
live org.

**Fix**: gate only on an explicit `false`, which is correct both under
the stub (`undefined !== false`, so execution proceeds) and against the
real component (which does return actual booleans):

```js
// Wrong under the Jest stub: undefined is falsy, so this always blocks.
if (inputField && !inputField.reportValidity()) { return; }

// Correct: only blocks on an explicit false.
if (inputField && inputField.reportValidity() === false) { return; }
```

Apply the same `=== false` (or `=== true`) discipline to any other
base-component validation method used as a gate (`checkValidity()`, etc.)
if its stub behavior is unverified.

---

## Cloud-Synced Project Directories Hang Jest (and Other File-Heavy Tools)

If a project's working directory lives inside an actively-synchronized
cloud storage folder (for example, macOS iCloud Drive —
`~/Library/Mobile Documents/com~apple~CloudDocs/...` — or an equivalent
OneDrive/Dropbox-synced path), Jest test runs can hang indefinitely with
**no output at all**, even with `--forceExit` and even when `--runInBand`
is used to eliminate worker-process complexity.

Symptoms that point at this cause rather than a code defect:
- The Jest process shows near-zero CPU usage (it is blocked, not
  looping) when inspected (e.g., `ps aux`, or a stack sample via macOS's
  `sample <pid> 3`) — the dominant blocked call is typically a
  synchronous `read`/`pread` syscall.
- A completely unrelated command that queries the sync daemon itself
  (on macOS, `brctl status`) also hangs in the same environment — this is
  strong confirmation the sync daemon, not Jest or the test code, is the
  bottleneck.
- The same test suite runs quickly and cleanly (sub-second to a few
  seconds) once copied to a genuinely local, non-synced path.

**Do not** spend extended effort tuning Jest flags or rewriting tests to
chase this kind of hang — it is an environment property, not a defect.

**Recommended workaround**: if a clean local test run is needed as
validation evidence and the project's actual location is inside a
cloud-synced directory, copy the LWC/Apex source plus `package.json` and
`jest.config.js` (and `sfdx-project.json`, which `sfdx-lwc-jest` requires
to locate the project root) to a local, non-synced scratch path, run
`npm install` and the test command there, capture the real pass/fail
output, and then delete the scratch copy. The two files that matter for
the deliverable (`jest.config.js`'s moduleNameMapper fix, and any
component fix like the `reportValidity()` change above) must still be
committed in the project's actual source tree — the scratch copy is only
a validation aid, never a place where the deliverable itself lives.

For ongoing local development in such an environment, recommend the user
either move the project (or at minimum its `node_modules`) outside the
cloud-synced folder, or verify once per environment whether Jest hangs
there before relying on it for iterative development.
