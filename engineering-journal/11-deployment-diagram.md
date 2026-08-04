# 11 — Deployment Diagram

## Purpose

Produce `showcase/architecture/04-deployment-diagram.md`, the final diagram in the showcase architecture set, showing where every runtime component from `showcase/architecture/02-container-diagram.md` actually executes. This is a documentation-only task: no application code, contract, prompt, or prior journal was modified.

This completes the four-diagram architecture progression: business context (`01-system-context.md`) → runtime containers (`02-container-diagram.md`) → request flow (`03-sequence-diagram.md`) → physical deployment (`04-deployment-diagram.md`).

## Inputs

Read in full before writing:

- `showcase/architecture/01-system-context.md`
- `showcase/architecture/02-container-diagram.md`
- `showcase/architecture/03-sequence-diagram.md`
- `docs/03-architecture.md`
- `docs/06-end-to-end-architecture.md`
- `engineering-journal/03-fastapi-generation.md`
- `engineering-journal/04-salesforce-generation.md`
- `engineering-journal/06-salesforce-ui-polish.md`
- `README.md`

## Deployment Decisions

**Three boundaries, exactly as specified.** The task named three deployment boundaries — Salesforce Cloud, Internet, Developer Machine — and specified exactly which runtime components belong in each. No component was reassigned to a different boundary and no fourth boundary was introduced.

**Cloudflare Tunnel represented generically as "HTTPS," not omitted from the flow entirely.** The one live end-to-end validation (`engineering-journal/06-salesforce-ui-polish.md`) actually reached the local FastAPI process through a Cloudflare Tunnel, not raw HTTPS to a public IP. The task instructs excluding the tunnel and treating the communication "simply as HTTPS." This is the accurate representation of the *intended* architecture (`docs/03-architecture.md`'s "Apex + Named Credentials" over HTTPS) with the *demonstration-only* tunneling mechanism abstracted away — the tunnel was scaffolding to make a validation possible, not a designed part of the deployment. This distinction (tunnel-as-scaffolding vs. HTTPS-as-architecture) is made explicit in the "Deployment Assumptions" section of the diagram so the simplification is not silently lossy.

**Named Credential placed inside Salesforce Cloud, not in the Internet boundary.** The Named Credential is Salesforce platform configuration — it resolves the callout endpoint but executes as part of the Salesforce runtime, not as separate network infrastructure. This matches its treatment in `showcase/architecture/02-container-diagram.md` and `showcase/architecture/03-sequence-diagram.md`, both of which group it with Salesforce.

**Swagger included in the Developer Machine boundary.** The task explicitly lists "Swagger" as a Developer Machine component. `README.md` ("Running Locally") documents Swagger UI as being served by the same local FastAPI process at `/docs`, so it is shown as a dotted association from FastAPI rather than a separate process — it is the same runtime, a different exposed route, not a distinct deployable.

**No Apex test mock, no build tooling, no package manager represented.** The deployment diagram shows runtime components only — `HttpCalloutMock` (a test-time construct), `uv`/`sf`/`npm` (build and deployment tooling), and Jest (a test runner) are development-time or test-time concerns, not things that execute when a representative uses the live system. These are covered by the engineering journals, not this diagram.

**One Salesforce org named explicitly, not a generic "Salesforce" box.** `engineering-journal/04-salesforce-generation.md` and `engineering-journal/06-salesforce-ui-polish.md` both identify the actual validated org as `dev-workflowfox`. Naming it in the diagram (rather than leaving Salesforce Cloud unlabeled) keeps the diagram honest about the fact that exactly one org was ever deployed to — not a generic multi-environment Salesforce estate.

## What Was Intentionally Excluded

Per the task's explicit exclusion list, none of the following appear anywhere in `showcase/architecture/04-deployment-diagram.md`:

- Cloudflare Tunnel (represented generically as HTTPS instead, per the task's instruction)
- Docker, Kubernetes, Terraform
- AWS, Azure, or any cloud provider
- Redis, Kafka
- Any database (the diagram shows only the synthetic JSON files, which are not a database)
- Monitoring or observability infrastructure
- Authentication mechanisms (the diagram states "No Authentication" as a property of the Named Credential, matching the validated configuration, but does not add or imply any auth infrastructure)
- Any future or hypothetical deployment target

Future-facing items (production cloud deployment, authentication, a managed database, observability, a container platform) are mentioned exactly once, in the diagram's "Future Evolution" section, explicitly separated from — and stated not to appear in — the Mermaid diagram itself.

## Assumptions

- The Named Credential's base URL is documented as the placeholder `http://localhost:8000` (the contract's own documented local development server) rather than a real deployed URL, since no other URL is documented anywhere in the supplied specifications. (`engineering-journal/04-salesforce-generation.md`, "Assumptions")
- "Developer Machine" is treated as a single node running the entire FastAPI process (application, service layer, repositories, data files, and Swagger) because no evidence in any source shows these split across multiple machines or processes.
- The Salesforce org `dev-workflowfox` is treated as the sole representative environment, since it is the only org named in either Salesforce-related journal.

## Lessons Learned

- **A deployment diagram must resist the temptation to "clean up" an ad hoc validation into something more polished than it was.** The real live validation depended on a Cloudflare Tunnel — an intentionally temporary mechanism, not a designed component. Representing the connection as generic HTTPS (per the task's instruction) accurately reflects the target architecture's intent, but doing so silently, without the "Deployment Assumptions" callout explaining *why* the tunnel isn't shown, would have overstated how production-ready the current deployment actually is. Stating the simplification explicitly kept the diagram honest.
- **"Where something runs" and "what talks to what" are genuinely different views, even for a small system.** The container diagram (`02-container-diagram.md`) already showed every component and their communication paths in detail. This deployment diagram adds no new components — it answers a strictly different question (which machine/cloud/org each one executes on), which is why it looks sparser and groups things more coarsely (e.g., collapsing FastAPI's internal API layer distinction from the container diagram into a single "FastAPI" node, since that internal layering doesn't matter at the deployment-boundary level).
- **Excluding a long list of technologies (Docker, Kubernetes, databases, auth, monitoring) is easiest to get right by only ever drawing what a source document proves is running, rather than by actively filtering out a checklist.** Every node in the final diagram was added because a specific source cited it as deployed; nothing was drawn first and then evaluated against the exclusion list. This meant the exclusion list required no active enforcement — none of the excluded technologies were ever candidates for inclusion in the first place, because none of them appear as "implemented" in any of the seven input documents.

## Validation

- **Mermaid renders** — the flowchart uses three `subgraph` blocks (`SFC`, `NET`, `DEV`) with straightforward `-->` and `-.->` edges and no unsupported syntax; structurally consistent with the flowcharts already used and rendering correctly in `01-system-context.md` and `02-container-diagram.md`.
- **Every runtime component exists** — cross-checked against `engineering-journal/03-fastapi-generation.md`'s "Files Created" (FastAPI app, `eligibility_service.py`, `member_repository.py`, `coverage_repository.py`, `data/members.json`/`coverage.json`) and `engineering-journal/04-salesforce-generation.md`'s "Files Created" (Lightning Application, LWC, `MemberEligibilityController`, `MemberEligibilityIntegrationService`, Named Credential guide). Swagger's presence is confirmed by `README.md` ("interactive docs (Swagger UI) are at `http://localhost:8000/docs`"). Every node in the diagram traces to one of these.
- **Deployment reflects the validated implementation** — the org name (`dev-workflowfox`), the local-process nature of FastAPI, and the HTTPS callout path all trace to the actual live validation recorded in `engineering-journal/06-salesforce-ui-polish.md`, not to an aspirational target state.
- **No future infrastructure appears** — the Mermaid diagram contains only the eleven components explicitly listed in the task's "Runtime Environment" section plus the Provider Relations Application (also explicitly listed under Salesforce Cloud); "Future Evolution" content is confined to its own prose section, entirely outside the diagram.
- **Cloudflare Tunnel is excluded** — confirmed absent from the Mermaid diagram; its role is acknowledged only in prose (Purpose and Deployment Assumptions sections) as context for why the diagram simplifies the Internet boundary to plain HTTPS.
