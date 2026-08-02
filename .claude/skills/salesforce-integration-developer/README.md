# Salesforce Integration Developer Skill

## What this skill does

This is a reusable Agent Skill that makes Claude Code act as a **Senior
Salesforce Integration Developer**. When activated, it implements a
Salesforce client — Lightning Web Components, Apex integration services,
Apex wrapper models, Named Credential configuration guidance, Apex tests,
LWC tests, and developer documentation — that consumes an enterprise REST
API, strictly from an approved, supplied set of specification files and an
OpenAPI contract.

The skill embodies a repeatable engineering *process* (thin Apex, thin
LWCs, contract-first modeling, secure callouts, disciplined testing). It
contains no business rules, endpoints, or fields for any specific
application — those always come from the specification files provided at
invocation time, and business logic itself always stays in the backend
service, never in Salesforce.

## When it activates

Use this skill whenever a task asks you to implement (or extend) a
Salesforce client that integrates with a WorkflowFox backend API — for
example: "implement the Salesforce integration for &lt;project&gt;" or
"build the Lightning Web Component and Apex service described in `docs/`
and `contracts/`."

## Required inputs

The skill requires all of the following to exist and be readable before any
implementation work begins:

```text
docs/01-business-discovery.md
docs/02-functional-requirements.md
docs/03-architecture.md
docs/04-implementation-design.md
docs/05-api-design.md
contracts/<name>.yaml
```

See [SKILL.md](SKILL.md) Section 2 for what the role extracts from each
file.

## Expected output

A complete Salesforce client implementation:

- Apex wrapper classes matching the OpenAPI request/response schemas
  field-for-field
- An Apex integration service performing HTTP callouts through a Named
  Credential, with no embedded business logic
- Named Credential (and External Credential, if applicable) configuration
  guidance for the contract's authentication scheme
- A Lightning Web Component presenting the required user experience,
  calling Apex for data and displaying loading/success/error states
- Apex tests using `HttpCalloutMock`, covering success, contract-defined
  errors, and unexpected responses
- Lightning Web Component Jest tests covering loading, success, empty, and
  error states
- Developer documentation (Named Credential setup, how to run tests,
  known limitations, validation status)

## How to invoke it

Reference the skill by name (`salesforce-integration-developer`) or
describe the task in terms it matches (e.g., "use the Salesforce
integration developer skill to build the client from the docs and
contract"). The skill walks through the 10-step workflow defined in
[SKILL.md](SKILL.md) Section 3, starting with validating all required
inputs.

## How missing inputs are handled

If any required specification file or the OpenAPI contract is missing, the
skill:

1. Stops immediately — no Apex, Lightning Web Component, or metadata is
   generated.
2. Lists the missing files by exact path.
3. Explains what each missing file must contain.
4. Waits for the missing inputs or clarification.

It will not invent endpoints, fields, business rules, custom objects, or
metadata to fill a gap. If `CLAUDE.md` contains business rules or
acceptance criteria, the skill flags this as misplaced rather than
treating it as authoritative — those belong in
`docs/02-functional-requirements.md` and, ultimately, in the backend
service.

## How validation works

Before reporting completion, the skill:

- Re-checks every Apex wrapper field and every callout path/method/status
  code against the OpenAPI contract.
- Confirms no business logic (e.g., eligibility evaluation) was introduced
  in Apex or the Lightning Web Component.
- Confirms every callout uses a Named Credential — no hardcoded endpoint
  URLs, API keys, or tokens.
- Runs Apex tests and LWC Jest tests when a target org or local toolchain
  is available, and reports actual output — it does not claim a check
  passed without having run it.
- Reports assumptions, unresolved gaps, and any specification conflicts
  explicitly rather than concealing them.

See [SKILL.md](SKILL.md) Section 4 for the full validation checklist.

## Project-specific business logic stays out of this skill

This skill is reusable across any WorkflowFox project that follows the
documented input convention. It must never contain business rules, field
names, endpoints, or domain logic specific to any one application (for
example, Member Eligibility Verification). All such content is supplied by
the project's `docs/` and `contracts/` files at the time the skill is
invoked, and lives in the generated Salesforce implementation and its
backend service — not in this skill directory.
