# 07 — README Productization

## Purpose

Rewrite the repository root `README.md` into a polished public landing page
for the WorkflowFox Showcase — the first thing an enterprise architect,
engineering leader, Salesforce architect, healthcare technology leader, or
prospective WorkflowFox client sees. This is a documentation-only task: no
application code, contract, prompt, or journal was modified — only
`README.md`.

This supersedes an earlier, shorter productization pass recorded in an
earlier version of this same file. That pass covered a smaller README
structure (13 sections) written before `engineering-journal/06-salesforce-
ui-polish.md` existed. This pass covers the full 15-section structure
specified in `prompts/07-productize-root-readme.md` (the current version
of that prompt), incorporating journal 06 and its live end-to-end
validation evidence.

## Inputs

Read in full before writing:

- Specifications: `docs/01-business-discovery.md` through
  `docs/06-end-to-end-architecture.md`
- Contract: `contracts/member-eligibility.yaml`
- Engineering journals: `03-fastapi-generation.md`,
  `04-salesforce-generation.md`, `05-architecture-packaging.md`,
  `06-salesforce-ui-polish.md`
- Existing documentation: the prior `README.md`, `salesforce/README.md`,
  `backend/README.md`
- Source structure: `backend/`, `salesforce/`, `contracts/`, `docs/`,
  `showcase/` (including `README.md`, `case-study.md`, `demo-script.md`),
  `prompts/`, `engineering-journal/`, `.claude/skills/`

`engineering-journal/06-salesforce-ui-polish.md` did not exist the last
time this README was productized (see the prior pass's journal entry,
preserved in git history) and was read in full this time, since it is now
present and is the sourcing document for the live end-to-end validation
claim.

## README Structure Decisions

- **Full rewrite, not an incremental edit.** The task specified a new
  15-section structure (`Why This Repository Exists` through `About
  WorkflowFox`) that differs materially from the previous README's
  13-section structure — different opening framing ("Workflow Insurance"
  as the H1, per the task's explicit spec, rather than "Insurance Member
  Eligibility"), a required Validation Summary table with fixed row
  labels, a Technology Stack table organized by layer, an explicit AI-
  Assisted Engineering Lifecycle diagram distinct from the "Why This
  Repository Exists" diagram, a Screenshots section, and a Roadmap
  section. Patching the old structure in place would have produced an
  inconsistent document; a full rewrite was more honest about the scope of
  the change.
- **Validation Summary table used verbatim as specified.** The task
  supplied the exact table (rows and checkmark values) to use. Every row
  was independently verified against a journal before accepting it — see
  Validation Evidence Included — rather than trusting the task's own
  example table on faith. It matched the evidence in every row.
- **Architecture diagram: Mermaid, not PNG.** The task's instruction was
  conditional: embed a PNG from `showcase/assets/architecture/` if one
  exists, otherwise embed the Mermaid diagram from `docs/06-end-to-end-
  architecture.md`. No `showcase/assets/` directory exists in this
  repository (verified: `showcase/` contains only `README.md`,
  `case-study.md`, `demo-script.md`, `linkedin.md`). The Mermaid flowchart
  was embedded verbatim from the source document.
- **Screenshots: captioned table, not placeholder image tags.** The task
  offered the same conditional pattern for screenshots. No
  `showcase/assets/screenshots/` directory exists either. Rather than
  inserting `![...](path/that/does/not/exist.png)` markdown image syntax
  — which would render as a broken image on GitHub and fail the task's
  own "verify every image path" validation step — the Screenshots section
  states plainly that no screenshot assets exist yet and lists, in a
  table, what each expected capture would show. This satisfies "create
  placeholders with descriptive captions" without shipping a dead link.
- **"Workflow Insurance" as the H1, exactly as specified.** This is the
  name of the fictional insurance enterprise the reference implementation
  represents (`showcase/case-study.md` refers to it as "the Workflow
  Insurance reference enterprise"), distinct from "WorkflowFox," the
  consulting company. The task's required structure names this exactly;
  it was used as given rather than substituting the company name.

## Claims Included

Every factual claim in the README traces to one of the specification
documents, the contract, or an engineering journal:

- Business problem and current-process description — `docs/01-business-
  discovery.md`
- Solution flow (Salesforce collects, backend decides) — `docs/03-
  architecture.md`, `docs/06-end-to-end-architecture.md`
- All six Validation Summary rows — see Validation Evidence Included
- Architecture diagram and component responsibilities — `docs/06-end-to-
  end-architecture.md` ("High-Level Architecture," "Component
  Responsibilities")
- Technology Stack table — `docs/03-architecture.md` ("Technology
  Decisions") for Frontend/Backend/API/Testing rows; `backend/pyproject.toml`
  and `salesforce/sfdx-project.json` confirm `uv` and `sf` tooling for the
  Developer Experience row; `engineering-journal/06-salesforce-ui-
  polish.md` for the Cloudflare Tunnel / no-cloud-deployment Infrastructure
  row
- Current Scope bullets (synthetic data, local FastAPI, Cloudflare Tunnel
  for demonstration, no production auth, no cloud deployment) — `docs/06-
  end-to-end-architecture.md` ("Current Limitations") and
  `engineering-journal/06-salesforce-ui-polish.md` ("Assumptions",
  "Evidence")
- Roadmap — `showcase/case-study.md` ("What's Next") and `docs/01-
  business-discovery.md` ("Out of Scope")
- About WorkflowFox positioning — provided verbatim by the task
  specification itself, not sourced from external marketing material

## Claims Intentionally Excluded

- **Any suggestion that all four eligibility outcomes were validated live.**
  `engineering-journal/06-salesforce-ui-polish.md`'s "Live End-to-End
  Validation" section documents exactly one scenario: Member ID `M100234`,
  Eligible. The README's Validation Summary caveat paragraph and the
  end-to-end description both state this scope explicitly rather than
  letting the single checkmark in the required table imply broader
  coverage than what was tested.
- **Any claim that the Cloudflare Tunnel is a standing or production
  connection.** Journal 06's own "Assumptions" section states the tunnel
  is temporary and FastAPI remains local. The README's Current Scope
  section states this as an intentional, temporary choice, not a
  deployment.
- **Specific LWC Jest test counts beyond what a journal documents.** The
  Validation Summary states "6 Passing," matching `engineering-journal/
  04-salesforce-generation.md` exactly, per the task's fixed table. The
  actual test suite has grown since journal 04 (additional UI-polish work
  in this repository's history added more test cases), but no journal
  documents an updated passing count, so the only citable number is the
  one from journal 04. Using a higher number without a journal to support
  it would violate "do not invent numbers."
- Hype language — "revolutionary," "cutting-edge," "world-class," and
  unqualified "production-ready" do not appear anywhere in the README.

## Validation Evidence Included

Each Validation Summary row, checked against its source before inclusion:

| Row | Source | Verified detail |
|---|---|---|
| Ruff | `engineering-journal/03-fastapi-generation.md` | "`ruff check .` → All checks passed!" |
| Backend Tests | `engineering-journal/03-fastapi-generation.md` | "`pytest` → 19 passed (6 unit, 7 integration, 6 contract-alignment)" |
| OpenAPI Contract Alignment | `engineering-journal/03-fastapi-generation.md`, `04-salesforce-generation.md` | 6 automated backend contract-alignment tests + Salesforce manual field-by-field review, 7/7 rows matched |
| Salesforce Deployment | `engineering-journal/04-salesforce-generation.md` | `sf project deploy start ...` → `"status": "Succeeded"`, `numberComponentErrors: 0`, 9 Apex classes + LWC bundle |
| Apex Tests | `engineering-journal/04-salesforce-generation.md` | "12/12 passed, 100% pass rate, 100% coverage on every class with executable logic" |
| LWC Jest Tests | `engineering-journal/04-salesforce-generation.md` | "6 passed, 6 total" |
| Live End-to-End Validation | `engineering-journal/06-salesforce-ui-polish.md` | Full execution path traced (LWC → Apex Controller → Integration Service → Named Credential → Cloudflare Tunnel → FastAPI → Eligibility Service → Synthetic Repository → Response → Salesforce UI); Member ID `M100234` observed returning Eligible / Medical / Sarah Johnson |

## Simplifications Made

- **One diagram, not two.** `docs/06-end-to-end-architecture.md` contains
  both a flowchart and a sequence diagram; only the flowchart was
  embedded, with a link to the source document for the full request-flow
  sequence diagram. A landing page needs one diagram a reader absorbs in
  seconds.
- **Business Problem trimmed to a single paragraph.** The source documents
  (`docs/01-business-discovery.md`) describe the current process as a
  six-step numbered list and five named "Challenges." The README compresses
  this to one paragraph, per the task's own "Keep this concise"
  instruction for this section.
- **Technical failure sub-cases not enumerated.** Consistent with how
  `docs/06-end-to-end-architecture.md` itself compresses `CalloutException`
  / undocumented status / malformed body into one "technical failure"
  outcome, the README does not break these out either.
- **"Run Locally" (renamed "Running Locally" per the task's structure)
  covers only the backend**, referencing `salesforce/README.md` and
  `backend/README.md` rather than duplicating either.

## Assumptions

- **The local `salesforce/` source tree is stale relative to the org state
  journal 06 describes, and this was not corrected.** Journal 06 and
  `git log` (`af9b2a6 refactor: Changed app name`) confirm the Lightning
  App's label is now "Provider Relations" with a tab named `Provider_Relations`
  and a utility bar named `Provider_Relations_UtilityBar`. The
  currently-committed `salesforce/force-app/main/default/applications/
  Member_Eligibility.app-meta.xml` file does reflect the new label and
  those two references — but no `Provider_Relations.tab-meta.xml` or
  `Provider_Relations_UtilityBar.flexipage-meta.xml` file exists anywhere
  in this source tree; only the original `Member_Eligibility.tab-meta.xml`
  and `Member_Eligibility_UtilityBar.flexipage-meta.xml` do. This means the
  committed metadata could not be redeployed from a clean checkout without
  first retrieving the renamed tab/utility-bar metadata from the org. This
  is a real gap, but fixing Salesforce metadata is out of scope for a
  README-only task, so it was not touched — only noted here.
- **The prior version of this journal file is fully superseded**, not
  merged with. Its content remains visible in git history; a diff against
  the previous commit shows exactly what changed.
- **Command syntax in "Running Locally"** (`uv sync`, `uv run uvicorn
  app.main:app --reload`, `uv run pytest`) is taken from `backend/README.md`,
  which documents these commands directly.
- **Roadmap wording** favors the exact phrasing already used in
  `showcase/case-study.md` ("Workflow Insurance reference enterprise,"
  "AI-assisted engineering workflows across additional enterprise
  platforms") and `docs/01-business-discovery.md` ("Benefits" in Out of
  Scope) over the task's own example roadmap items ("AI Operations") where
  the task's wording wasn't itself traceable to a source document.

## Lessons Learned

- **A task's own example content is still a claim that needs checking.**
  The task supplied an exact Validation Summary table to use. Using it
  required verifying every row against a journal first, not simply
  trusting that a well-formed instruction implies well-verified content —
  in this case it held up, but the verification step is what makes that
  conclusion trustworthy rather than assumed.
- **A conditional instruction ("embed X if it exists, otherwise Y") is a
  branch to actually check, not a preference to default past.** Both the
  architecture-image and screenshots instructions had a real fallback
  path; checking `showcase/` for an `assets/` directory before writing
  either section (rather than assuming Mermaid/placeholders were the
  intended answer) is what made the "otherwise" branches correct rather
  than convenient.
- **Superseding a prior journal entry should say so explicitly, not
  silently replace it.** The previous version of this file recorded real,
  useful reasoning (specifically, a mid-task correction about live
  validation evidence). Stating plainly that this version supersedes it —
  and that the full history is one `git log` away — keeps the journal
  trail honest instead of erasing what came before without a trace.
- **Real inconsistencies found while researching a documentation task
  should be reported, not silently absorbed into confident-sounding prose.**
  The stale tab/utility-bar metadata reference was not something this task
  was asked to fix, and fixing it would have exceeded scope (`salesforce/`
  is explicitly off-limits). Writing it into "Assumptions" instead of
  smoothing it over in the README text is what keeps the README's own
  claims about Salesforce deployment accurate without requiring the reader
  to discover the gap themselves.

## Future README Improvements

- Add real screenshots under `showcase/assets/screenshots/` (Salesforce
  app, LWC result states, Swagger UI) and real architecture images under
  `showcase/assets/architecture/`, then update the Screenshots and
  Architecture sections to embed them per the same conditional logic this
  task already specified.
- Once the local `salesforce/` source tree's tab/utility-bar metadata is
  reconciled with the org's actual "Provider Relations" naming (see
  Assumptions), update the Architecture and Screenshots sections' prose to
  reference the correct metadata file names.
- If a future live validation exercises the Ineligible, Unable to
  Determine, or member-not-found scenarios end to end, extend the
  Validation Summary caveat paragraph (or the table itself) to reflect the
  broader confirmed scope, sourced from whatever journal documents that
  test.
- Consider a CI badge (build status, test count) once automated CI exists
  — none does today, so none was added.
