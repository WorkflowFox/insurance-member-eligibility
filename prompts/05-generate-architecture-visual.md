# Generate the Member Eligibility Architecture Visual

Read:

- `docs/01-business-discovery.md`
- `docs/02-functional-requirements.md`
- `docs/03-architecture.md`
- `docs/04-implementation-design.md`
- `docs/05-api-design.md`
- `contracts/member-eligibility.yaml`
- `engineering-journal/03-fastapi-generation.md`
- `engineering-journal/04-salesforce-generation.md`

## Task

Create:

`docs/06-end-to-end-architecture.md`

The document should explain the validated end-to-end architecture for the
Member Eligibility Verification reference implementation.

Use Mermaid diagrams so the architecture renders directly in GitHub.

## Required Sections

1. Purpose
2. Business Context
3. High-Level Architecture
4. End-to-End Request Flow
5. Component Responsibilities
6. Security and Integration Boundary
7. Validation Evidence
8. Architecture Decisions
9. Current Limitations
10. Future Evolution
11. Traceability

## High-Level Architecture Diagram

Create one Mermaid flowchart showing:

- Provider Relations Representative
- Salesforce Service Cloud
- Lightning Web Component
- Apex Controller
- Apex Integration Service
- Salesforce Named Credential
- FastAPI Eligibility API
- Eligibility Service
- Member Repository
- Coverage Repository
- Synthetic JSON Data

The diagram must clearly show:

- Salesforce is the presentation and integration layer.
- FastAPI owns eligibility business logic.
- JSON files are the Version 1 data source.
- Business rules are not duplicated in Salesforce.

## Request Sequence Diagram

Create one Mermaid sequence diagram showing:

1. Representative enters Member ID.
2. LWC invokes Apex Controller.
3. Controller invokes Apex Integration Service.
4. Integration Service calls FastAPI through the Named Credential.
5. FastAPI retrieves member and coverage information.
6. Eligibility Service evaluates coverage.
7. FastAPI returns the contract-defined response.
8. Salesforce displays the outcome.

Include handling for:

- Successful eligibility result
- Member not found
- Technical failure

## Validation Evidence

Use only evidence documented in the engineering journals.

Include:

- FastAPI Ruff result
- FastAPI Pytest result
- Salesforce deployment result
- Apex test result
- LWC Jest result
- OpenAPI alignment review

Do not claim end-to-end runtime integration unless Salesforce has
successfully called a running FastAPI deployment.

Clearly distinguish:

- Component-level validation
- Salesforce org validation
- Contract alignment
- End-to-end integration

## Architecture Decisions

Summarize the important decisions:

- Backend owns business rules.
- Salesforce is a consuming channel.
- OpenAPI is the integration contract.
- JSON is used instead of PostgreSQL for Version 1.
- Named Credential prevents hardcoded endpoints.
- No authentication mechanism was invented because the contract does not
  define one.

## Current Limitations

State honestly that:

- The FastAPI backend has not yet been deployed to a persistent HTTPS
  environment unless the project evidence says otherwise.
- A live Salesforce-to-FastAPI call has not yet been validated unless
  corresponding evidence exists.
- Synthetic data is used.
- Version 1 supports one eligibility workflow only.

## Engineering Journal

After completing the architecture document, create or update:

`engineering-journal/05-architecture-packaging.md`

Record:

- Files created
- Diagram decisions
- Information simplified for executive readability
- Validation claims included
- Claims intentionally excluded
- Assumptions
- Lessons learned

Do not modify application code.

Begin with a concise plan.