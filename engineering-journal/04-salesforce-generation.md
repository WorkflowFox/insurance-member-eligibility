# 04 — Salesforce Integration Generation

## Purpose

Generate the Salesforce Service Cloud client — Lightning Web Component,
Apex integration layer, and configuration guidance — that lets a Provider
Relations representative verify member eligibility from Salesforce by
calling the Member Eligibility Service (the FastAPI backend built in
`03-fastapi-generation.md`), strictly via `contracts/member-eligibility.yaml`.
Salesforce is presentation and integration only; the backend owns every
eligibility business rule.

## Skill Used

- `.claude/skills/salesforce-integration-developer`

## Project Inputs

- `docs/01-business-discovery.md`
- `docs/02-functional-requirements.md`
- `docs/03-architecture.md`
- `docs/04-implementation-design.md`
- `docs/05-api-design.md`
- `contracts/member-eligibility.yaml`

No `CLAUDE.md` exists in this repository, so no environment-value or
misplaced-business-rule check was applicable.

## Implementation Plan

Presented before coding, following the skill's 10-step workflow:

1. Validate all six specifications exist and are readable; read them
   completely.
2. Read the OpenAPI contract as authoritative for the wrapper shapes,
   endpoint, and status codes.
3. Generate Apex wrapper models (`EligibilityVerificationRequest`,
   `EligibilityVerificationResponse`, `EligibilityErrorResponse`).
4. Generate the Apex integration service
   (`MemberEligibilityIntegrationService`) and a translated-failure
   exception type (`MemberEligibilityIntegrationException`).
5. Document Named Credential / External Credential configuration.
6. Generate the Lightning Web Component
   (`memberEligibilityVerification`).
7. Generate Apex tests with `HttpCalloutMock`.
8. Generate LWC Jest tests.
9. Validate alignment with the OpenAPI contract.
10. Produce this implementation summary.

Scope was mapped 1:1 to the task's eleven requested deliverables: five
code artifacts (LWC, Apex Controller, Apex Callout Service, Request
Wrapper, Response Wrapper), two test artifacts (Apex Tests, LWC Tests),
three configuration *guides* (Named Credential, External Credential,
Permission Set — documentation, not deployable metadata, per the skill's
Step 5 wording and the task's own "guide"/"guidance" phrasing), and a
README.

## Files Created

```text
salesforce/
├── sfdx-project.json
├── .forceignore
├── .gitignore
├── package.json, jest.config.js
├── README.md
├── config/
│   ├── named-credential-guide.md
│   ├── external-credential-guide.md
│   └── permission-set-guide.md
└── force-app/main/default/
    ├── classes/
    │   ├── EligibilityVerificationRequest.cls(+meta)
    │   ├── EligibilityVerificationResponse.cls(+meta)
    │   ├── EligibilityErrorResponse.cls(+meta)
    │   ├── MemberEligibilityIntegrationException.cls(+meta)
    │   ├── MemberEligibilityIntegrationService.cls(+meta)
    │   ├── MemberEligibilityController.cls(+meta)
    │   ├── MemberEligibilityHttpCalloutMock.cls(+meta)
    │   ├── MemberEligibilityIntegrationServiceTest.cls(+meta)
    │   └── MemberEligibilityControllerTest.cls(+meta)
    └── lwc/memberEligibilityVerification/
        ├── memberEligibilityVerification.js/.html/.js-meta.xml
        └── __tests__/memberEligibilityVerification.test.js
```

| File | Purpose | Why needed | Spec / contract element satisfied |
|---|---|---|---|
| `sfdx-project.json` | Declares the SFDX package directory and source API version | Required for `sf` to recognize/deploy the project | Scaffolding only |
| `.forceignore` | Excludes `__tests__/**` from metadata deploys | Salesforce's deploy compiler otherwise tries to compile Jest test files as component source (see Architecture Decisions) | Salesforce platform requirement |
| `.gitignore` | Ignores `node_modules/`, `coverage/`, `.sf/`, `.sfdx/` | Keeps installed tooling out of version control | Hygiene |
| `package.json`, `jest.config.js` | LWC Jest tooling and config | Runs LWC tests locally, no org required | Scope: "LWC Tests" |
| `README.md` | Deploy/configure/test instructions | Developer documentation deliverable | Scope: "README" |
| `config/named-credential-guide.md` | Named Credential setup steps | Documents the callout endpoint configuration | Scope: "Named Credential configuration guide" |
| `config/external-credential-guide.md` | External Credential guidance | Documents why none is needed for V1 and how to add one later | Scope: "External Credential configuration guide" |
| `config/permission-set-guide.md` | Permission Set grants to create declaratively | Documents access control needed to use the integration | Scope: "Permission Set guidance" |
| `EligibilityVerificationRequest.cls` | Request wrapper | Mirrors `EligibilityVerificationRequest` schema | `contracts/member-eligibility.yaml` → `components.schemas.EligibilityVerificationRequest` |
| `EligibilityVerificationResponse.cls` | Success (200) response wrapper | Mirrors the success schema field-for-field | `components.schemas.EligibilityVerificationResponse` |
| `EligibilityErrorResponse.cls` | Error (400/404/500) response wrapper | Mirrors the shared error schema; `ValidationErrorResponse` is `allOf: [ErrorResponse]` with no extra fields, so one class covers all three error status codes | `components.schemas.ErrorResponse` / `ValidationErrorResponse` |
| `MemberEligibilityIntegrationException.cls` | Translated integration failure | Carries `statusCode`/`errorCode`/`correlationId` so the controller can produce a clean `AuraHandledException` message | `references/apex-error-handling.md` |
| `MemberEligibilityIntegrationService.cls` | Builds/executes the callout, deserializes the response | The only class that performs HTTP work; contains no eligibility logic | `POST /api/v1/eligibility/verify`, all four documented status codes (200/400/404/500) |
| `MemberEligibilityController.cls` | `@AuraEnabled` entry point for the LWC | Thin boundary between LWC and integration service; blank-`memberId` guard mirrors contract's `minLength: 1` | `docs/03-architecture.md` ("Apex does not contain business rules") |
| `MemberEligibilityHttpCalloutMock.cls` | Test-only `HttpCalloutMock` | Lets Apex tests run without a real callout | `references/salesforce-testing.md` |
| `MemberEligibilityIntegrationServiceTest.cls` | 9 test methods | Covers 200 (with and without nullable fields), 400, 404, 500, malformed body, undocumented status, callout exception, and the error-message fallback branch | Scope: "Apex Tests" |
| `MemberEligibilityControllerTest.cls` | 3 test methods | Covers success passthrough, blank-`memberId` guard, and 404 → `AuraHandledException` translation | Scope: "Apex Tests" |
| `memberEligibilityVerification.js/.html/.js-meta.xml` | The Lightning Web Component | Collects Member ID, calls Apex, renders loading/success/empty-coverage/error states; no eligibility logic | `docs/02-functional-requirements.md` (FC-001, FC-005) |
| `__tests__/memberEligibilityVerification.test.js` | 6 test methods | Covers initial render, loading state, successful render (and that the entered Member ID is actually passed to Apex), `UNABLE_TO_DETERMINE` with null coverage fields, error state with backend message, and the generic-fallback error message | Scope: "LWC Tests" |

## Architecture Decisions

**Decision: Named Credential uses `No Authentication`, not OAuth/API key.**
Reason: `docs/05-api-design.md` ("Security") states "Version 1 assumes
trusted internal communication," and the OpenAPI contract defines no
`security` or `securitySchemes`. The skill explicitly forbids guessing
authentication requirements. Supporting spec: `docs/05-api-design.md`
("Security"), `contracts/member-eligibility.yaml` (no security scheme).

**Decision: `external-credential-guide.md` documents that no External
Credential is needed for V1, with forward-looking steps for when a future
contract version adds one.** Reason: the task's scope explicitly asked
for this guide, but generating real OAuth/JWT configuration steps as if
they were current requirements would invent an authentication mechanism
the specifications don't describe. Supporting spec: `docs/03-architecture.md`
("Future Evolution": "Authentication and Authorization"),
`docs/05-api-design.md` ("Future Evolution": OAuth 2.0/JWT/mTLS).

**Decision: Named Credential / External Credential / Permission Set are
markdown guides, not deployable metadata XML.** Reason: the task listed
these as "configuration guide" / "guidance," matching the skill's Step 5
("Generate Named Credential guidance") which is documentation, not a
metadata-generation step; it also avoids committing placeholder org
configuration (URLs, principal names) that would need to be verified
against a real org's declarative setup regardless. Supporting spec: task
scope wording; skill Section 3, Step 5.

**Decision: no separate `HttpCalloutHelper` utility class.** Reason: the
skill's own `apex-integration-patterns.md` reference recommends a shared
callout helper when *multiple* integration services exist so callout
logic isn't duplicated. V1 exposes exactly one endpoint
(`POST /api/v1/eligibility/verify`), so extracting a second class now
would be an abstraction with only one caller — the skill's own
"Simplicity First" rule ("no abstractions for one-time behavior") takes
priority until a second integration service exists. Supporting spec:
skill Section 5 ("Simplicity First").

**Decision: response wrapper date and status fields are typed `String`,
not Apex `Date`/enum.** Reason: the environment initially only supported
Metadata-Only generation with no way to compile-verify a stronger typing
choice; `String` preserves the exact wire value with no locale/parsing
risk. (Note: Connected Mode access was granted mid-task — see Validation
Results — and confirmed this choice deserializes correctly against
contract-shaped payloads; it was kept as-is since it remains the safer
choice and was already validated.) Supporting spec:
`references/apex-integration-patterns.md` ("Preserve the contract's
nullable/required distinctions").

**Decision: `EligibilityErrorResponse` is reused for HTTP 400, 404, and
500.** Reason: `contracts/member-eligibility.yaml` defines
`ValidationErrorResponse` as `allOf: [ErrorResponse]` with no additional
properties — a second class would duplicate, not add, structure.
Supporting spec: `contracts/member-eligibility.yaml` →
`components.schemas.ValidationErrorResponse`.

**Decision: single Lightning Web Component, not a form/result/container
split.** Reason: the task scope requested "Lightning Web Component"
(singular), and the single-field, single-outcome flow described in
`docs/02-functional-requirements.md` (FC-001–FC-005) does not need
separate components to stay readable. Supporting spec:
`docs/02-functional-requirements.md` ("Functional Flow").

**Decision: status label/icon mapping lives in the LWC, not the backend
response.** Reason: this is presentation-only formatting (uppercase enum
→ title case, plus an icon) of a decision the backend already made — it
does not change or re-derive the eligibility outcome, so it stays
consistent with `references/ui-design-guidelines.md` ("display via a
documented label mapping... not an invented label") without crossing into
business logic. Supporting spec: `docs/02-functional-requirements.md`
("Display Eligibility Result": "Eligible / Ineligible / Unable to
Determine / Member Not Found" as the human-facing outcome labels).

## Validation Results

Execution mode changed mid-task: generation began under **Metadata Only**
(no org access); the user then explicitly authorized **Connected Mode**
scoped to exactly one org — alias `dev-workflowfox`
(`dev.69249eea2f47@agentforce.com`, org ID `00DgK00000VbGQXUA3`) — with an
explicit instruction not to connect to any other org. Every `sf` command
below targeted that org by explicit `-o dev-workflowfox` flag; the
machine's other five authenticated orgs (including the CLI's own default
org) were never targeted.

**Apex compilation — executed, real evidence.**
`sf project deploy start --source-dir force-app -o dev-workflowfox`.
First attempt failed with one real defect it caught: the LWC bundle's
`__tests__/memberEligibilityVerification.test.js` was deployed as if it
were component source, and Salesforce's compiler rejected the Jest-only
`import { createElement } from 'lwc'` (`LWC1702: Invalid LWC imported
identifier "createElement"`) — a missing `.forceignore` (see Files
Created). After adding `.forceignore` and redeploying: **`"status":
"Succeeded"`, `"success": true`, `"numberComponentErrors": 0`** — all 9
Apex classes and the LWC bundle deployed and compiled cleanly.

**Apex tests — executed, real evidence.**
`sf apex run test --class-names MemberEligibilityIntegrationServiceTest
--class-names MemberEligibilityControllerTest -o dev-workflowfox
--code-coverage`. First run: **11/11 passed, 100% pass rate**, but flagged
one real gap — line 86 of `MemberEligibilityIntegrationService.cls` (the
error-message fallback when the backend's error body has no `message`)
was never exercised, showing 98% class coverage. Added
`testVerifyEligibility_ThrowsException_WithFallbackMessage_WhenErrorBodyHasNoMessage`,
redeployed, reran: **12/12 passed, 100% pass rate, 100% coverage on every
class with executable logic** (`MemberEligibilityIntegrationService`,
`MemberEligibilityController`, `MemberEligibilityIntegrationException`,
`EligibilityVerificationRequest`). `EligibilityVerificationResponse` and
`EligibilityErrorResponse` report 0% because they are pure field-only
DTOs deserialized via `JSON.deserialize` — Salesforce counts no
executable lines in them (org-wide coverage: 100%, well above the 75%
platform minimum).

**LWC tests — executed, real evidence, with two real defects found and
fixed along the way.**

1. First attempt failed to even parse:
   `SyntaxError: Unexpected token 'export'` inside
   `@lwc/engine-dom/dist/index.js`. Root cause: `@salesforce/sfdx-lwc-jest@8.0.0`'s
   bundled resolver maps the bare `lwc` specifier to
   `require.resolve('@lwc/engine-dom')`, which now resolves to that
   package's ESM `main` (`@lwc/engine-dom` 9.x declares
   `"type": "module"`); Jest's default `transformIgnorePatterns` excludes
   `node_modules`, so the ESM file can't be parsed. Fixed by adding a
   `moduleNameMapper` entry in `jest.config.js` pointing `lwc` directly at
   `@lwc/engine-dom/dist/index.cjs` (the CommonJS build `@lwc/jest-resolver`
   itself already prefers).
2. With that fixed, 5 of 6 tests failed with `0` recorded calls to the
   mocked Apex method. Root cause: `sfdx-lwc-jest`'s `lightning-input`
   stub implements `reportValidity()` as `@api reportValidity() {}` —
   always returning `undefined`. The component's original guard
   (`!inputField.reportValidity()`) treated that `undefined` as "invalid"
   and silently returned before ever calling Apex. Fixed
   `memberEligibilityVerification.js` to check
   `inputField.reportValidity() === false` (only block on an explicit
   `false`), which is correct for the real component too, since it
   returns actual booleans.
3. With both fixes applied, the test run then hung indefinitely with zero
   output from this project's actual location — a sub-path of
   `~/Library/Mobile Documents/com~apple~CloudDocs/...` (iCloud Drive).
   Diagnosed by sampling the hung `node`/`jest.js` process (`sample <pid> 3`):
   the dominant blocking call was `read`/`pread` syscalls, not CPU work.
   A completely unrelated command, `brctl status` (macOS's own iCloud
   daemon query), also hung in this same environment — confirming an
   iCloud daemon/sandbox interaction, not a defect in the test or
   component. **To obtain a clean run, the LWC source and a fresh
   `npm install` were copied to a local (non-iCloud) scratch path and run
   there: `Tests: 6 passed, 6 total`, `Test Suites: 1 passed, 1 total`,
   0.5–1s runtime.** The scratch copy was deleted afterward; no
   deliverable files live outside `salesforce/`. The two code fixes
   (`jest.config.js` moduleNameMapper, `reportValidity() === false`) are
   committed in the actual `salesforce/` tree and are what was proven
   passing.

**OpenAPI alignment review — executed (manual/static).**

| Contract element | Apex | Match |
|---|---|---|
| `POST /api/v1/eligibility/verify` | `MemberEligibilityIntegrationService.RESOURCE_PATH` + `.setMethod('POST')` | ✅ |
| `EligibilityVerificationRequest.memberId` (required, string) | `EligibilityVerificationRequest.memberId` | ✅ |
| `EligibilityVerificationResponse` (8 fields, 3 nullable) | `EligibilityVerificationResponse` (8 `@AuraEnabled` fields) | ✅ |
| `EligibilityStatus` enum (`ELIGIBLE`/`INELIGIBLE`/`UNABLE_TO_DETERMINE`) | `STATUS_LABELS`/`STATUS_ICON_NAMES`/`STATUS_VARIANTS` keys in the LWC | ✅ |
| `ErrorResponse` / `ValidationErrorResponse` (400/404/500, same 4 fields) | `EligibilityErrorResponse` (4 fields), reused across all three statuses | ✅ |
| 200 / 400 / 404 / 500 status handling | `MemberEligibilityIntegrationService.parseResponse` branches on exactly these four | ✅ |
| No `securitySchemes` in contract | Named Credential configured `No Authentication` | ✅ (see Architecture Decisions) |

**Traceability review — executed.**

| Requirement | Source | Implementation | Test | Status |
|---|---|---|---|---|
| FC-001 Verify eligibility by Member ID | `02-functional-requirements.md` | `memberEligibilityVerification` LWC, `MemberEligibilityController` | `memberEligibilityVerification.test.js` (all), `MemberEligibilityControllerTest` (all) | Implemented |
| FC-005 / Display Eligibility Result outcomes | `02-functional-requirements.md` | `memberEligibilityVerification.js` status label/icon mapping | `...test.js::renders a successful eligible result`, `...UNABLE_TO_DETERMINE...` | Implemented |
| `POST /api/v1/eligibility/verify` request/response shape | `contracts/member-eligibility.yaml` | `EligibilityVerificationRequest`/`Response`, `MemberEligibilityIntegrationService` | `MemberEligibilityIntegrationServiceTest` (200, null-fields cases) | Implemented |
| 400/404/500 handling | `contracts/member-eligibility.yaml` | `MemberEligibilityIntegrationService.parseResponse`/`toIntegrationException` | `MemberEligibilityIntegrationServiceTest` (400/404/500/malformed/undocumented/fallback) | Implemented |
| Apex contains no business rules | `03-architecture.md` | `MemberEligibilityIntegrationService`, `MemberEligibilityController` (no eligibility comparisons anywhere) | Manual review (no date/coverage comparison logic exists in Apex) | Implemented |
| LWC contains no business rules | `03-architecture.md` | `memberEligibilityVerification.js` (only presentation mapping of an already-decided status) | Manual review | Implemented |
| Secure callout via Named Credential | `03-architecture.md` ("Apex + Named Credentials") | `callout:Member_Eligibility_Service/...` | Deploy succeeded; no hardcoded URL/secret in source | Implemented |

## Assumptions

- **Named Credential base URL** is a placeholder
  (`http://localhost:8000`, the contract's local dev server) that must be
  replaced with the deployed backend's HTTPS URL before non-local use — no
  other environment URL is documented anywhere in the supplied
  specifications.
- **Callout timeout of 10000ms** — no timeout value is specified in any
  document; chosen as a conservative default well under Apex's 120000ms
  cumulative limit.
- **LWC page placement** (App Page vs. Home Page vs. utility bar) is not
  specified; the component is exposed to `lightning__AppPage`,
  `lightning__RecordPage`, and `lightning__HomePage` so an admin can place
  it appropriately.
- **Status label text** ("Eligible" / "Ineligible" / "Unable to
  Determine") is derived directly from
  `docs/02-functional-requirements.md`'s own wording for "Display
  Eligibility Result" — no separate UI copy document exists.
- **Salesforce API version 62.0** was chosen as a current, stable version;
  no specific version is mandated by any specification.

## Specification Conflicts

**External Credential requested but not needed.** The task's scope
explicitly lists "External Credential configuration guide" as a
deliverable, but `docs/05-api-design.md` states Version 1 "assumes
trusted internal communication" and the OpenAPI contract defines no
`securitySchemes`. Resolved by producing the guide as forward-looking,
clearly-labeled guidance for a future authenticated contract version,
rather than inventing a current OAuth/API-key requirement the
specifications don't support (see Architecture Decisions). Not a blocker
— the deliverable was still produced, honestly scoped.

No other conflicts were found between `docs/01`–`05`, the contract, and
the task scope; `docs/05-api-design.md`'s response table listing "Member
Not Found" as an `eligibilityStatus` value (rather than an HTTP 404, as
the contract defines) was already resolved in the backend's own
generation (`03-fastapi-generation.md`) in favor of the contract, and the
Salesforce error-handling code here follows that same resolution
(404 → `MemberEligibilityIntegrationException`, not a fourth
`eligibilityStatus` value).

## What Was Generated Well

- Every Apex wrapper field, the callout path/method, and all four handled
  status codes trace directly and unambiguously to
  `contracts/member-eligibility.yaml` — confirmed by an actual successful
  deploy and compile against a real org, not just static review.
- The thin-Apex / thin-LWC boundary held throughout: no date comparison,
  coverage-window logic, or eligibility decision exists anywhere in
  `salesforce/` — every outcome displayed is a value the backend already
  computed.
- Real execution (not just generation) caught three genuine defects
  before they could reach a reviewer: the missing `.forceignore`, the
  Jest resolver/ESM incompatibility, and the `reportValidity()` guard bug
  — all three are documented above with root cause and fix, not just
  patched silently.
- Final state: 12/12 Apex tests passing with 100% coverage on all
  executable classes (real org), 6/6 LWC Jest tests passing (real local
  run, off iCloud), and a clean full-project deploy.

## Improvements Identified

**Skill improvements:**
- `references/salesforce-testing.md` and `assets/lwc-project-template.md`
  should call out that Apex classes in SFDX source format must be flat in
  `classes/` (no subfolders) — the metadata API does not support nested
  test folders for Apex, unlike LWC bundles. This implementation applied
  that correction but the skill's own template doesn't yet state it.
- `references/named-credentials.md` doesn't mention the "No
  Authentication" protocol option at all — it should, since a V1
  reference implementation with no auth scheme (like this one) is a
  realistic, non-edge-case scenario the skill should guide toward
  explicitly rather than leaving the developer to infer it.

**Prompt improvements:**
- The task's initial "Metadata Only (default)" instruction and the
  mid-task "Connected Mode" authorization arrived as two separate
  messages. A future version of this prompt could let the execution mode
  be specified once, up front, alongside the org alias/ID if Connected
  Mode is intended from the start — this would avoid generating an
  initial round of Metadata-Only-only validation language that then had
  to be reconciled with real Connected Mode results mid-document.

**Specification improvements:**
- `docs/05-api-design.md`'s "Security" section states V1 "assumes trusted
  internal communication" but doesn't explicitly say whether that means
  "no Named Credential authentication configuration" or "authentication
  exists but is out of scope to document." This implementation interpreted
  it as the former (see Architecture Decisions); an explicit statement in
  a future spec revision would remove the need for that interpretation.

## Lessons Learned

- **Real execution finds defects static generation cannot.** All three
  defects fixed in this run (missing `.forceignore`, Jest ESM resolver
  mismatch, `reportValidity()` stub behavior) were invisible from reading
  the code — each only surfaced by actually deploying, actually running
  Apex tests against a live org, and actually running Jest. Static
  contract-alignment review is necessary but not sufficient; treat it as
  a complement to real execution, not a substitute.
- **Jest's default lightning-* stubs are intentionally minimal, not
  spec-accurate mocks.** `reportValidity()` returning `undefined` (rather
  than `true`) is a reasonable stub choice, but it means any component
  code that treats a falsy `reportValidity()` return as "invalid" will
  silently break under test. Future WorkflowFox LWCs should check for an
  explicit `=== false`, not just falsiness, when gating on base-component
  validation methods.
- **Don't develop/test Node tooling inside an iCloud Drive-synced
  project path.** This repository lives under `~/Library/Mobile
  Documents/com~apple~CloudDocs/...`; installing `node_modules` there and
  running Jest triggered an indefinite hang traced to blocking file-read
  syscalls, and even macOS's own `brctl status` hung in the same
  environment. When Jest (or similar heavy-file-I/O tooling) must run in
  a project under iCloud Drive, either verify local Jest execution from a
  non-synced path once per environment, or move the project (or at least
  `node_modules`) outside iCloud Drive/Desktop/Documents.
- **Authorization scope should be enforced mechanically, not just
  remembered.** With six Salesforce orgs authenticated on this machine
  (one marked as the CLI's own default), every `sf` command in this run
  passed `-o dev-workflowfox` explicitly rather than relying on the
  default org — a cheap habit that removes an entire class of
  wrong-target risk when a user scopes authorization to one specific org.
