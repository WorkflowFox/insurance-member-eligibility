# Generate the Salesforce Integration

Use the `salesforce-integration-developer` skill.

## Inputs

Read and use:

- docs/01-business-discovery.md
- docs/02-functional-requirements.md
- docs/03-architecture.md
- docs/04-implementation-design.md
- docs/05-api-design.md
- contracts/member-eligibility.yaml

## Task

Generate the Salesforce implementation for the Member Eligibility Verification reference implementation.

Create the implementation under:

salesforce/

Follow the Salesforce Integration Developer skill exactly.

## Scope

Generate:

- Lightning Web Component
- Apex Controller
- Apex REST Callout Service
- Request Wrapper
- Response Wrapper
- Named Credential configuration guide
- External Credential configuration guide
- Permission Set guidance
- Apex Tests
- LWC Tests
- README

## Architecture Rules

- Salesforce is the presentation layer.
- FastAPI owns all eligibility business logic.
- Apex performs integration only.
- LWC contains presentation logic only.
- No business rules may be duplicated in Salesforce.
- The OpenAPI contract is authoritative.

## Validation

Before completion:

- Verify wrapper classes match the OpenAPI contract.
- Verify Named Credential configuration.
- Verify Apex tests compile.
- Verify LWC imports and metadata.
- Produce a traceability report.

Report:

- Files created
- Validation evidence
- Assumptions
- Any specification conflicts

## Engineering Journal

After completing the implementation, create or update the engineering journal:

```text
engineering-journal/04-salesforce-generation.md
```

The journal is a required deliverable.

It should document the engineering journey, not just the final outcome.

Include the following sections.

### Purpose

Briefly describe the objective of this implementation.

### Skill Used

Record the reusable skill that was activated.

Example:

- `.claude/skills/salesforce-integration-developer`

### Project Inputs

List every specification that was used.

### Implementation Plan

Summarize the implementation plan presented before coding.

### Files Created

List every file generated.

For each file explain:

- Purpose
- Why it was needed
- Which specification or OpenAPI element it satisfies

### Architecture Decisions

Document any implementation decisions made during generation.

For each decision explain:

- Decision
- Reason
- Supporting specification

### Validation Results

Record actual validation results.

Include:

- Apex compilation (if executed)
- Apex tests
- LWC tests
- OpenAPI alignment review
- Traceability review

Do not claim validations passed unless they were actually executed.

### Assumptions

List every assumption made.

Explain why each assumption was necessary.

### Specification Conflicts

Document any conflicting requirements or ambiguities discovered.

Explain how they were resolved or why implementation stopped.

### What Was Generated Well

Summarize areas where the implementation closely matched the specifications.

### Improvements Identified

Document:

- Skill improvements
- Prompt improvements
- Specification improvements

### Lessons Learned

Capture engineering lessons that will improve future WorkflowFox projects.

Focus on reusable learning rather than project-specific details.

---

The engineering journal is part of the deliverable.

Implementation is not complete until the journal has been created and saved.

Do not generate backend changes.

Do not modify documentation unless required by the implementation.

Execution Mode

Metadata Only (default)

- Generate source
- Generate tests
- Generate documentation
- Do NOT connect to a Salesforce org.
- Do NOT deploy.
- Do NOT retrieve metadata.
- Do NOT authenticate.

Connected Mode (optional)

Only if explicitly instructed.

May:

- Authenticate
- Retrieve metadata
- Deploy
- Run org tests

- go in full edit mode. you don't need my approval during executing steps.or running mac commands.

you can use salesforce org - https://orgfarm-a4585d132c-dev-ed.develop.lightning.force.com/. this is  Org authorized: alias dev-workflowfox → dev.69249eea2f47@agentforce.com (org ID 00DgK00000VbGQXUA3)

you must not connect or use any other org