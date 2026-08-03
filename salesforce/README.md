# Member Eligibility Verification — Salesforce Client

Lightning Web Component + Apex client that lets a Provider Relations
representative verify member eligibility from Salesforce Service Cloud,
by calling the Member Eligibility Service (FastAPI backend at
`../backend/`) defined by `contracts/member-eligibility.yaml`.

Generated using the `.claude/skills/salesforce-integration-developer`
skill. See `engineering-journal/04-salesforce-generation.md` for the full
implementation record, including validation results and assumptions.

## Architecture

- **Salesforce is the presentation layer.** It accepts a Member ID,
  invokes the backend, and displays the result.
- **The backend (FastAPI) owns all eligibility business logic.** Apex and
  the LWC never evaluate eligibility, coverage effective/termination
  dates, or any other business rule — see `docs/03-architecture.md`.
- **The OpenAPI contract is authoritative.** Every Apex wrapper field,
  the callout path/method, and every handled status code trace to
  `contracts/member-eligibility.yaml`.

```text
LWC (memberEligibilityVerification)
  → Apex Controller (MemberEligibilityController, @AuraEnabled)
    → Apex Integration Service (MemberEligibilityIntegrationService)
      → Named Credential (Member_Eligibility_Service)
        → FastAPI backend: POST /api/v1/eligibility/verify
```

## Project Structure

```text
salesforce/
├── sfdx-project.json
├── package.json, jest.config.js       — LWC Jest tooling (local, no org required)
├── config/
│   ├── named-credential-guide.md      — Named Credential setup (No Authentication, per V1 spec)
│   ├── external-credential-guide.md   — Not required for V1; forward-looking guidance only
│   └── permission-set-guide.md        — Permission Set to create declaratively
└── force-app/main/default/
    ├── classes/
    │   ├── EligibilityVerificationRequest.cls        — request wrapper
    │   ├── EligibilityVerificationResponse.cls        — success (200) response wrapper
    │   ├── EligibilityErrorResponse.cls                — error (400/404/500) response wrapper
    │   ├── MemberEligibilityIntegrationException.cls  — translated integration failure
    │   ├── MemberEligibilityIntegrationService.cls     — builds/executes the callout
    │   ├── MemberEligibilityController.cls             — @AuraEnabled entry point for the LWC
    │   ├── MemberEligibilityHttpCalloutMock.cls        — HttpCalloutMock for tests
    │   ├── MemberEligibilityIntegrationServiceTest.cls
    │   └── MemberEligibilityControllerTest.cls
    └── lwc/memberEligibilityVerification/
        ├── memberEligibilityVerification.js/.html/.js-meta.xml
        └── __tests__/memberEligibilityVerification.test.js
```

## Prerequisites

- A Salesforce org (Developer Edition, sandbox, or scratch org) with the
  Salesforce CLI (`sf`) authenticated against it.
- Node.js and npm, for running the Lightning Web Component Jest tests
  locally.
- The Member Eligibility Service (`../backend/`) running and reachable
  from the org (a Salesforce scratch/sandbox org cannot reach
  `localhost` — deploy the backend somewhere the org can reach, or use a
  tool such as a tunnel, for end-to-end testing beyond unit tests).

## Configure the Org

Before deploying, complete the declarative configuration described in
`config/`:

1. [config/named-credential-guide.md](config/named-credential-guide.md) — create the `Member_Eligibility_Service` Named Credential.
2. [config/external-credential-guide.md](config/external-credential-guide.md) — confirm no External Credential is needed for V1 (read before skipping).
3. [config/permission-set-guide.md](config/permission-set-guide.md) — create and assign the `Member_Eligibility_Verification` Permission Set.

## Deploy

```bash
sf project deploy start --source-dir force-app -o <your-org-alias>
```

## Run Apex Tests

Apex tests only run inside a Salesforce org (there is no local Apex
compiler/runtime). After deploying:

```bash
sf apex run test --class-names MemberEligibilityIntegrationServiceTest,MemberEligibilityControllerTest -o <your-org-alias> --result-format human --synchronous
```

## Run Lightning Web Component Tests

LWC Jest tests run locally in Node — no org connection required:

```bash
cd salesforce
npm install
npm test
```

## Known Limitations

- Version 1 configures the Named Credential with `No Authentication`,
  matching `docs/05-api-design.md`'s statement that V1 "assumes trusted
  internal communication." See `config/external-credential-guide.md` for
  how to add authentication when a future contract version requires it.
- The Lightning Web Component's page placement (App Page, Home Page,
  utility bar) is not specified by the supplied documents; the component
  is exposed to `lightning__AppPage`, `lightning__RecordPage`, and
  `lightning__HomePage` so an admin can place it appropriately.
- End-to-end testing against a running backend requires the org to reach
  the backend's URL — not possible against `http://localhost:8000`
  (the contract's local development server) without additional
  environment setup. Apex tests use `HttpCalloutMock` and do not require
  a reachable backend.

## Validation Status

See `engineering-journal/04-salesforce-generation.md` for what was
actually executed (LWC Jest test run output) versus what could not be
executed in this environment (Apex compilation and Apex test execution,
which require a connected Salesforce org and were out of scope for this
generation run — see that document's Validation Results section).
