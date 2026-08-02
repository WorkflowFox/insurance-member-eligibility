# FastAPI Application Developer Skill

## What this skill does

This is a reusable Agent Skill that makes Claude Code act as a **Senior
FastAPI Application Developer**. When activated, it implements a complete
FastAPI backend — source code, configuration, synthetic data adapters,
automated tests, and developer documentation — strictly from an approved,
supplied set of specification files and an OpenAPI contract.

The skill embodies a repeatable engineering *process* (layered
architecture, thin routes, contract-first behavior, disciplined testing).
It contains no business rules, endpoints, or fields for any specific
application — those always come from the specification files provided at
invocation time.

## When it activates

Use this skill whenever a task asks you to implement (or extend) a FastAPI
backend from a WorkflowFox specification set — for example: "implement the
backend for &lt;project&gt;" or "build the FastAPI service described in
`docs/` and `contracts/`."

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

A complete FastAPI application:

- Pydantic v2 request/response models matching the OpenAPI contract
- Service-layer business logic, independent of the web framework
- Repository/data-adapter implementations matching the specified data
  source
- Thin API routes matching every contract-defined path, method, and status
  code
- Standardized error handling per the contract's error schema
- Unit, integration, and (where practical) contract-alignment tests
- Developer documentation (install, run, test, structure, known
  limitations, validation status)
- A traceability summary mapping requirements to code and tests

## How to invoke it

Reference the skill by name (`fastapi-application-developer`) or describe
the task in terms it matches (e.g., "use the FastAPI application developer
skill to implement the backend from the docs and contract"). The skill
walks through the 11-step workflow defined in [SKILL.md](SKILL.md) Section
3, starting with reading and validating all required inputs.

## How missing inputs are handled

If any required specification file or the OpenAPI contract is missing, the
skill:

1. Stops immediately — no code is generated.
2. Lists the missing files by exact path.
3. Explains what each missing file must contain.
4. Waits for the missing inputs or clarification.

It will not invent endpoints, fields, business rules, or infrastructure to
fill a gap. If `docs/CLAUDE.md` (or a project-root `CLAUDE.md`) contains
business rules or acceptance criteria, the skill flags this as misplaced
rather than treating it as authoritative — those belong in
`docs/02-functional-requirements.md`.

## How validation works

Before reporting completion, the skill:

- Runs `ruff check .` and `pytest` and reports actual output — it does not
  claim a check passed without having run it.
- Runs an OpenAPI/contract validation tool when one is locally available;
  otherwise performs and reports a manual structural review.
- Produces a traceability summary (see
  [assets/traceability-matrix-template.md](assets/traceability-matrix-template.md))
  mapping every supported requirement to its implementation artifact and
  test.
- Reports assumptions, unresolved gaps, and any specification conflicts
  explicitly rather than concealing them.

See [SKILL.md](SKILL.md) Section 4 for the full validation checklist.

## Project-specific business logic stays out of this skill

This skill is reusable across any WorkflowFox project that follows the
documented input convention. It must never contain business rules, field
names, endpoints, or domain logic specific to any one application (for
example, Member Eligibility Verification). All such content is supplied by
the project's `docs/` and `contracts/` files at the time the skill is
invoked, and lives in the generated application code — not in this skill
directory.
