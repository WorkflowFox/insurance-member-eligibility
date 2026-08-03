# 05 — Architecture Documentation Packaging

## Files Created

- `docs/06-end-to-end-architecture.md` — the 11-section end-to-end
  architecture document, including one Mermaid `flowchart` (High-Level
  Architecture) and one Mermaid `sequenceDiagram` (End-to-End Request
  Flow, with `alt` branches for success / member-not-found / technical
  failure).
- `engineering-journal/05-architecture-packaging.md` — this entry.

No application code (`backend/`, `salesforce/`) was modified.

## Diagram Decisions

- **One flowchart, one sequence diagram**, exactly as scoped — no
  additional diagrams were added, even though a deployment diagram or a
  data-model diagram could have been justified, because the task named
  exactly two diagrams and scope discipline mattered more than
  completeness for its own sake.
- **Flowchart grouped into two subgraphs** (Salesforce, FastAPI) plus one
  standalone data node, with `classDef` coloring (blue = presentation,
  amber = backend/business logic, green = data) so the
  no-business-logic-in-Salesforce boundary is visible at a glance without
  reading the labels — this was the most direct way to satisfy "must
  clearly show ... business rules are not duplicated in Salesforce" in a
  diagram rather than only in prose.
- **Sequence diagram used `alt`/`else` for the three required outcomes**
  (success, member not found, technical failure) rather than three
  separate diagrams, so the single diagram stays readable as one flow with
  branching outcomes, matching how `docs/02-functional-requirements.md`
  itself presents the error scenarios as one table rather than separate
  processes.
- Numbered the sequence diagram's message labels (1–8) to match
  `docs/03-architecture.md`'s own "Request Flow" step numbering exactly,
  so a reader can cross-reference the diagram against that existing prose
  description without renumbering anything in their head.
- Kept both diagrams to the components explicitly named in the task
  (Named Credential shown as a single node, not split into Named
  Credential + External Credential) — the current architecture doesn't
  use an External Credential (see `docs/06-end-to-end-architecture.md`,
  "Security and Integration Boundary"), so showing one would have
  misrepresented what's actually configured.

## Information Simplified for Executive Readability

- The flowchart shows Member Repository and Coverage Repository as two
  nodes both pointing at one shared "Synthetic JSON Data" store, rather
  than depicting the two separate JSON files (`members.json`,
  `coverage.json`) as distinct nodes — the file-level detail is preserved
  in prose (Component Responsibilities table) rather than the diagram, to
  keep the diagram's node count focused on the 11 components the task
  actually asked for.
- The sequence diagram compresses "Apex deserializes JSON and returns a
  strongly typed object" (a real implementation detail from
  `docs/03-architecture.md`, "Apex" responsibilities) into a single
  arrow/return step rather than a separate lifeline event, since it isn't
  one of the 8 flow steps the task specified and adding it would have
  cluttered the branching logic without adding decision-relevant
  information.
- The three technical-failure sub-cases documented in Apex
  (`CalloutException`, an undocumented status code, and a malformed
  response body — see `engineering-journal/04-salesforce-generation.md`,
  "Apex tests") are collapsed into one "Technical failure" branch in the
  sequence diagram, since all three produce the same visible behavior
  (translated exception → generic error state) and distinguishing them
  in the diagram would only be useful for someone debugging Apex
  internals, not for understanding the end-to-end architecture.

## Validation Claims Included

Only claims with a direct source in `engineering-journal/03-fastapi-generation.md`
or `engineering-journal/04-salesforce-generation.md` were included in
`docs/06-end-to-end-architecture.md`'s "Validation Evidence" section:

- Ruff: "All checks passed!"
- Pytest: 19 passed (6 unit, 7 integration, 6 contract-alignment)
- Salesforce deploy: `numberComponentErrors: 0`, all 9 Apex classes + LWC
  bundle
- Apex tests: 12/12 passed, 100% coverage on all executable classes
- LWC Jest: 6/6 passed (explicitly noted as a local, off-iCloud run, per
  journal 04's own caveat)
- OpenAPI alignment: both the backend's 6 automated contract-alignment
  tests and Salesforce's manual field-by-field review table

Each claim is labeled with which evidence category it belongs to
(component-level / org validation / contract alignment), matching the
distinction the task explicitly required.

## Claims Intentionally Excluded

- **End-to-end runtime integration.** The task explicitly instructed:
  "Do not claim end-to-end runtime integration unless Salesforce has
  successfully called a running FastAPI deployment." Neither journal
  documents this — every Apex test used `HttpCalloutMock`, and the
  backend was never deployed or called by anything outside its own test
  suite. The architecture document states this gap explicitly rather than
  omitting it silently, in its own "Validation Evidence" subsection and
  again in "Current Limitations."
- **Persistent backend deployment.** No journal records a deployment step
  or a hosted URL for the FastAPI service; the document does not imply
  one exists.
- **Production-grade security.** The "No Authentication" Named Credential
  is documented as matching the current contract's own scope, not framed
  as a security best practice — the document is explicit that this is a
  V1-specific, contract-driven choice, not a general recommendation.
- **LWC Jest results as if they ran in the project's actual location.**
  Journal 04 is explicit that the passing LWC Jest run happened from a
  local scratch copy off iCloud Drive, not the project's real path — the
  architecture document's validation table carries that same caveat
  rather than presenting it as an unqualified pass.

## Assumptions

- **Journal 03 and journal 04 are the complete, current record of
  validation activity.** No additional testing, deployment, or
  integration work was assumed to have occurred between journal 04 and
  this task; if such work happened outside those two files, it isn't
  reflected here.
- **"Executive readability" means a reader who knows the business problem
  but not the codebase.** Diagram and prose simplifications were chosen
  assuming the reader wants to understand what the system does and what's
  proven, not how to read Apex or Python source directly.
- **The task's 11 required sections define the document's complete
  scope.** No additional sections (e.g., a glossary, a deployment runbook)
  were added, since none were requested and adding them would be scope
  creep beyond what was asked.

## Lessons Learned

- **A synthesis document is only as honest as its refusal to
  over-claim.** The single highest-risk failure mode for this kind of
  document is quietly upgrading "component-level tests passed" into
  "the system works end-to-end" through imprecise language. Keeping the
  validation evidence in explicitly labeled categories (component-level /
  org validation / contract alignment / end-to-end) — and stating the
  end-to-end category as unmet — is what makes the rest of the document's
  claims trustworthy by contrast.
- **Diagrams should encode the architectural rule being asserted, not
  just the topology.** "Salesforce doesn't duplicate business rules"
  is easy to write in prose and easy to lose in a diagram that just shows
  boxes and arrows. Grouping nodes into labeled, colored subgraphs by
  responsibility (not just by physical system) made the rule visible in
  the diagram itself, not only in the caption underneath it.
- **Two engineering journals from two separate generation runs are enough
  to reconstruct a trustworthy system-level view — if both were honest
  about their own limits.** Journal 03 and journal 04 each already
  distinguished what they validated from what they didn't (journal 04 in
  particular flagged that `HttpCalloutMock` was used throughout). That
  discipline in the source journals is what made it possible to write
  this document without inventing evidence to fill perceived gaps —
  a synthesis task is much easier, and much more honest, when its inputs
  already practiced the same discipline it's being asked to apply.
