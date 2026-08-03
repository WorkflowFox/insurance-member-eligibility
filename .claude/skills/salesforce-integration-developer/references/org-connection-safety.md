# Org Connection Safety and Validation Evidence

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference defines the mechanics of the three execution modes
introduced in [SKILL.md](../SKILL.md) Section 2, the safety rules that
apply whenever a Salesforce org is touched, and how to describe validation
evidence honestly. It is project-agnostic — the org alias, org ID, and
scope are always supplied by the current invocation, never invented or
carried over from memory of a prior session.

---

## Execution Mode Mechanics

### Metadata Only (default)

- No Salesforce CLI command that authenticates, connects to, deploys to,
  retrieves from, or otherwise touches an org may run.
- `sf org list` (enumerating already-authenticated orgs) is the one
  exception worth calling out explicitly as still forbidden by default —
  even read-only org enumeration is a connection action and stays out of
  scope unless a later mode permits it.
- Available validation: static contract-alignment review, and local LWC
  Jest execution if a Node/npm toolchain is available on the machine (see
  [local-tooling-and-environment.md](local-tooling-and-environment.md)).
  Apex cannot be compiled or tested without an org — say this explicitly
  in the implementation summary rather than implying it was checked.

### Connected Validation

- Enters only when the current invocation explicitly authorizes it **and**
  names one specific org alias (and, ideally, an org ID to cross-check
  against). Do not infer authorization from an org being authenticated on
  the machine, from a prior conversation, or from a default org being set.
- Purpose: prove the generated Apex actually compiles and its tests
  actually pass, and that the LWC bundle deploys cleanly. The org is a
  disposable verification target for this purpose — Connected Validation
  does not by itself mean the org is the intended long-term home for this
  code, or that any other org configuration (Named Credential secrets,
  Permission Set assignment) was performed.
- Permitted commands (all scoped to the one authorized alias — see
  "Target-Org Discipline" below): `sf project deploy start`,
  `sf apex run test`, `sf project deploy report`, `sf org list` (to
  confirm the authorized alias is present before targeting it).

### Deployment

- Enters only when the current invocation explicitly authorizes it, names
  one specific org alias, and explicitly states the goal is to leave the
  generated code deployed in that org — not merely to verify it.
- All Target-Org Discipline rules below apply identically to Deployment
  and Connected Validation. Deployment adds one more expectation: because
  the change is meant to persist, treat it with the same care as any
  other hard-to-reverse, shared-state action — if the org's type or
  status suggests it might be shared or production-like, confirm with the
  user before deploying, and never perform destructive operations
  (deleting metadata, overwriting unrelated components) beyond what the
  invocation asked for.

### Default Behavior

Default to **Metadata Only**. Never authenticate, connect, deploy,
retrieve, or modify an org unless the *current* invocation explicitly
authorizes Connected Validation or Deployment mode by naming a specific
org alias. Authorization from an earlier message or an earlier session
does not carry forward — if a new invocation doesn't repeat the
authorization, treat the mode as Metadata Only again and ask if org
access is actually still intended.

---

## Target-Org Discipline

These rules apply the moment any mode other than Metadata Only is
authorized:

- **Require an explicit authorized org alias.** Never guess which org to
  use, never fall back to "whatever is currently authenticated," and
  never proceed with an ambiguous or unstated target.
- **Pass `--target-org <alias>` (or `-o <alias>`) on every single
  Salesforce CLI command that touches an org** — `sf project deploy
  start`, `sf apex run test`, `sf project deploy report`, and any other
  org-scoped command. No exceptions, even for commands that would
  otherwise use a default.
- **Never rely on the CLI's default org.** Do not assume the default org
  (`sf config get target-org`, or the org marked default in `sf org
  list`) is the authorized one, even if it happens to match — always pass
  the alias explicitly so the command is correct regardless of what the
  default is or later becomes.
- **Never target any other authenticated org, even accidentally.** Before
  the first org-scoped command runs, run `sf org list` and confirm the
  authorized alias is present, connected, and (if an org ID was supplied)
  matches it exactly. If multiple orgs are authenticated on the machine,
  treat that as a reason for *more* caution, not less — a wrong `-o` value
  silently succeeding against the wrong org is a real, high-consequence
  failure mode.
- If the authorized alias is not found connected, stop and report this —
  do not attempt to authenticate a new one unless the invocation
  explicitly asks for that.

---

## Validation Evidence Taxonomy

Every implementation summary or engineering journal entry must label its
validation evidence using these exact categories, and must never describe
one as another:

1. **Static review** — reading generated code against the contract/specs
   by eye; no execution occurred. Never call this "tests passed" or
   "compiled."
2. **Local tests** — LWC Jest run on the local machine; no Salesforce org
   involved. Proves JavaScript/component behavior only — says nothing
   about whether the Apex compiles.
3. **Org compilation** — a metadata deploy reported zero component
   errors. Proves the Apex/LWC source is syntactically and referentially
   valid Salesforce metadata. Does not by itself prove the tests pass or
   that business/integration logic is correct.
4. **Org tests** — `sf apex run test` actually executed and reported
   pass/fail counts and coverage. This is the only evidence that Apex
   logic behaves as intended; a successful compilation is not a
   substitute for this.
5. **Deployment** — metadata persisted in a target org as the delivery
   artifact itself, under Deployment mode. Distinct from Connected
   Validation's disposable-verification intent — state explicitly which
   one occurred.

When reporting results, name the category and the actual command/output
that produced it (e.g., "Org tests: `sf apex run test ... ` → 12/12
passed, 100% coverage" — not "tests passed"). If a category was not
executed, say so plainly rather than omitting it or implying it happened
via adjacent language.
