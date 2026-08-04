# 10 — Sequence Diagram

## Purpose

Produce `showcase/architecture/03-sequence-diagram.md`, the runtime sequence diagram for the validated Member Eligibility reference implementation, showing exactly what happens after a Provider Relations Representative presses **Verify Eligibility**. This is a documentation-only task: no application code, contract, prompt, or prior journal was modified.

The diagram completes the showcase architecture set alongside `showcase/architecture/01-system-context.md` (business-level actors and system boundary) and `showcase/architecture/02-container-diagram.md` (runtime containers and their communication) — this document is the third and most detailed level, tracing a single request through every container.

## Inputs

Read in full before writing:

- `showcase/architecture/01-system-context.md`
- `showcase/architecture/02-container-diagram.md`
- `docs/06-end-to-end-architecture.md`
- `contracts/member-eligibility.yaml`
- `engineering-journal/03-fastapi-generation.md`
- `engineering-journal/04-salesforce-generation.md`
- `engineering-journal/06-salesforce-ui-polish.md`

## Design Decisions

**Participants fixed exactly as specified.** The task named ten exact participants (Provider Relations Representative, Salesforce LWC, Apex Controller, Apex Integration Service, Named Credential, FastAPI Eligibility API, Eligibility Service, Member Repository, Coverage Repository, Synthetic Member Data). No participant was added, removed, or renamed.

**Named Credential grouped with Salesforce via a note, not a `box`.** The task requires representing the Named Credential as part of Salesforce. `docs/06-end-to-end-architecture.md`'s own sequence diagram groups participants by ordering and by a subgraph in its flowchart, not by the Mermaid sequence-diagram `box` syntax. To stay consistent with that existing precedent and avoid depending on a newer Mermaid feature that may not render identically everywhere, this diagram uses `Note over LWC,NC: Salesforce — presentation and integration only. Named Credential is part of Salesforce.` and places the four Salesforce participants contiguously at the left, immediately followed by the four FastAPI participants and then Synthetic Member Data.

**OpenAPI Contract represented as a note, not a participant.** Per the task's explicit instruction, a single `Note over LWC,Data` references `contracts/member-eligibility.yaml` as the governing shape for every request/response in the diagram, rather than modeling it as an actor that sends or receives messages.

**Three nested `alt` blocks, not one flat list of branches.** The runtime has three genuinely different decision points, each gating a different set of participants:
1. Whether the LWC's client-side check blocks submission entirely (no network call at all).
2. Whether the callout reaches FastAPI or fails in transit (Network failure — no HTTP response exists to branch on).
3. Which of the four contract-defined HTTP outcomes (200/400/404/500) FastAPI returns once the request does arrive.

Flattening these into one `alt` would have implied, incorrectly, that a network failure and a 500 response are the same kind of event (one never reaches FastAPI; the other is a response FastAPI actively produced). Nesting keeps the diagram truthful to what actually happens at each layer, matching the layered `alt` structure already used in `docs/06-end-to-end-architecture.md`'s own sequence diagram.

**Two validation-failure paths shown, not one.** `docs/06-end-to-end-architecture.md` and `engineering-journal/04-salesforce-generation.md` both describe a blank-Member-ID guard existing in two places: the LWC's own input check (client-side, blocks the call entirely) and the Apex Controller's guard (defense-in-depth, before invoking the Integration Service). The contract separately defines an HTTP 400 `ValidationErrorResponse` that FastAPI can return. The diagram shows all three: the LWC guard as an outer `alt` branch that never reaches Apex, the Controller's guard as a labeled step (`Ctrl->>Ctrl: Guards against blank Member ID`), and the 400 branch as a FastAPI-side outcome, since the task's Error Handling section explicitly requires both "400" and "Validation failure" as distinct items.

**Method-call labels retained, filenames excluded.** Calls are labeled `verifyEligibility(memberId)`, matching `docs/06-end-to-end-architecture.md`'s own sequence diagram, since this reflects real Apex method names already established as a documentation convention, not a class or file reference. No `.cls` file, Python module path, or package name appears anywhere in the diagram — those are excluded per the task's explicit instruction and are already covered by `showcase/architecture/02-container-diagram.md`.

**Excluded per explicit instruction:** Cloudflare Tunnel, GitHub, Claude, prompt files, this engineering journal, unit tests, implementation classes, package names, and repository filenames. None of these appear anywhere in `showcase/architecture/03-sequence-diagram.md`.

## Validation

- **Mermaid syntax** — the diagram's three `alt` blocks were counted and matched against their three closing `end` statements; every `activate` has a corresponding `deactivate` on the same participant within the same or an enclosing branch. No unmatched lifeline bars.
- **Participants match implementation** — cross-checked against `engineering-journal/04-salesforce-generation.md`'s "Files Created" table (`MemberEligibilityController`, `MemberEligibilityIntegrationService`, Named Credential `Member_Eligibility_Service`) and `engineering-journal/03-fastapi-generation.md`'s "Files Created" table (API layer, `eligibility_service.py`, `member_repository.py`, `coverage_repository.py`, `data/members.json` / `coverage.json`). All ten participants correspond to real, validated components — none are invented.
- **Runtime order is correct** — matches the task's own specified Runtime Flow line for line, and cross-checked against `docs/06-end-to-end-architecture.md`'s "End-to-End Request Flow" sequence diagram, which follows the same ordering (enter ID → LWC → Controller → Integration Service → Named Credential → FastAPI → repositories → response → back up the stack).
- **No unsupported technology appears** — verified the diagram contains none of: Cloudflare Tunnel, GitHub, Claude, prompt file paths, journal references, test names, class/file names, or package names.
- **Business logic ownership is accurate** — the "Business Logic Boundary" section's claims (Salesforce owns UI/input validation/REST invocation; FastAPI owns eligibility rules/decision making/data retrieval) are sourced directly from `docs/06-end-to-end-architecture.md`'s own statement that "the FastAPI service owns every eligibility business rule and is the only component that evaluates coverage dates... No eligibility logic is duplicated in Salesforce," and from `engineering-journal/04-salesforce-generation.md`'s manual review confirming no date/coverage comparison logic exists anywhere in `salesforce/`.

## Lessons Learned

- **A flat `alt` list can misrepresent failure semantics.** The first draft of this diagram considered one `alt` with five parallel branches (200/400/404/500/network). That would have implied a network failure is just another status code FastAPI returns, when it is actually the absence of any FastAPI response. Nesting the network-failure check *before* the HTTP-status `alt` makes the diagram match reality: FastAPI cannot return a 500 it never got the chance to compute.
- **Client-side and server-side validation are not the same failure, even though both trace to the same business rule.** The Salesforce docs describe a blank-Member-ID guard in two independent places (LWC and Apex Controller) plus a third, contract-defined 400 response on the FastAPI side. Collapsing these into a single "validation failure" branch would have hidden that two of the three checks never produce network traffic at all — a detail worth preserving for an audience of Enterprise and Solution Architects reasoning about failure isolation.
- **Reusing an established diagramming convention (method-call labels, note-based grouping) reduces risk more than introducing new Mermaid syntax.** `docs/06-end-to-end-architecture.md` already set a precedent for this repository's sequence diagrams; deviating from it (e.g., using `box` grouping) would have been a stylistic choice with no functional benefit and unclear cross-renderer support.

## Excluded Details

Per the task's explicit scope, the following were deliberately left out of `showcase/architecture/03-sequence-diagram.md`:

- Cloudflare Tunnel (documented instead in `showcase/architecture/02-container-diagram.md`, since it is infrastructure used for one manual demonstration, not part of the permanent runtime architecture).
- GitHub, Claude, and any AI-assisted engineering tooling.
- Prompt files (`prompts/`).
- This engineering journal and all other engineering journals.
- Unit test names and test files.
- Implementation class names beyond the method-call labels already established by `docs/06-end-to-end-architecture.md`.
- Package names and repository filenames.

These are intentionally scoped to other documents in this repository (the container diagram, the engineering journals, and the source code itself) rather than duplicated here.
