# Changelog

## 1.1.0

Reusable lessons captured from the Member Eligibility Verification
Salesforce generation (`engineering-journal/04-salesforce-generation.md`).

- Added explicit execution modes — Metadata Only (default), Connected
  Validation, and Deployment — with a default-deny rule: never
  authenticate, connect, deploy, retrieve, or modify an org unless the
  current invocation explicitly authorizes it by naming a specific org
  alias (SKILL.md Section 2).
- Added `references/org-connection-safety.md`: org-targeting discipline
  (`--target-org`/`-o` on every command, never the default org, never
  another authenticated org) and a validation-evidence taxonomy (static
  review / local tests / org compilation / org tests / deployment) that
  must never be conflated.
- Added `references/local-tooling-and-environment.md`: the
  `sfdx-lwc-jest`/`@lwc/engine-dom` ESM-CJS resolver mismatch and its
  `jest.config.js` fix, and the cloud-synced-directory (iCloud
  Drive/OneDrive/Dropbox) Jest-hang pattern with its local-scratch-copy
  workaround.
- Fixed `assets/apex-project-template.md`: Apex classes (including tests)
  must remain flat in `classes/` — the `ApexClass` metadata type does not
  support nested subfolders, unlike LWC bundles. Also softened the
  `HttpCalloutHelper` guidance to only apply once a second integration
  service exists.
- Updated `assets/lwc-project-template.md` and SKILL.md Step 6 to require
  a `.forceignore` excluding `**/__tests__/**`, so Jest test files are
  never deployed as component source.
- Updated `references/named-credentials.md` with an explicit
  **No Authentication** configuration path for contracts that define no
  security scheme, and a rule against inventing OAuth/JWT/API
  key/External Credential principals the contract doesn't describe.
- Updated `references/ui-design-guidelines.md` and
  `references/salesforce-testing.md`: gate on `reportValidity() === false`
  (not plain falsiness) — `sfdx-lwc-jest`'s base-component stubs return
  `undefined`, which a falsy-only check misreads as invalid.
- Added SKILL.md Section 8, "Engineering Journal Requirement": every
  invocation must create or update an engineering journal entry with a
  defined set of sections (purpose, skill used, inputs, plan, files
  created, architecture decisions, evidence-typed validation results,
  assumptions, specification conflicts, what went well, improvements
  identified, reusable lessons learned).
- Renumbered SKILL.md sections to accommodate the new Execution Modes
  (Section 2) and Engineering Journal Requirement (Section 8) sections;
  updated cross-references in README.md accordingly.

## 1.0.0

- Initial WorkflowFox Salesforce Integration Developer skill.
- Added reusable Salesforce integration workflow.
- Added Apex, LWC, testing, and integration references.
- Added project templates.
