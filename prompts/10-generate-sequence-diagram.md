# Generate the Member Eligibility Sequence Diagram

## Purpose

Create the runtime sequence diagram for the validated Member Eligibility reference implementation.

This is documentation only.

Do not modify any application code.

---

## Inputs

Read:

- showcase/architecture/01-system-context.md
- showcase/architecture/02-container-diagram.md
- docs/06-end-to-end-architecture.md
- contracts/member-eligibility.yaml
- engineering-journal/03-fastapi-generation.md
- engineering-journal/04-salesforce-generation.md
- engineering-journal/06-salesforce-ui-polish.md

---

## Output

Create:

showcase/architecture/03-sequence-diagram.md

---

## Audience

Enterprise Architects

Solution Architects

Senior Developers

Salesforce Architects

---

## Goal

Demonstrate the complete runtime request flow.

The diagram should show exactly what happens after the user presses **Verify Eligibility**.

---

## Participants

Use these exact participants.

Provider Relations Representative

Salesforce LWC

Apex Controller

Apex Integration Service

Named Credential

FastAPI Eligibility API

Eligibility Service

Member Repository

Coverage Repository

Synthetic Member Data

---

## Runtime Flow

Show this flow.

Provider enters Member ID

↓

Clicks Verify

↓

LWC validates input

↓

Calls Apex Controller

↓

Apex Controller invokes Apex Integration Service

↓

Integration Service sends HTTP POST through Named Credential

↓

FastAPI receives request

↓

Eligibility Service evaluates request

↓

Eligibility Service requests Member

↓

Member Repository retrieves Member

↓

Eligibility Service requests Coverage

↓

Coverage Repository retrieves Coverage

↓

Eligibility Service determines Eligibility

↓

FastAPI returns standardized response

↓

Named Credential

↓

Apex Integration Service

↓

Apex Controller

↓

LWC

↓

Representative sees Eligibility Result

---

## Important Notes

Represent:

OpenAPI Contract

as a note

NOT a participant.

---

Represent

Named Credential

as part of Salesforce.

---

Do NOT include

Cloudflare Tunnel

GitHub

Claude

Prompt files

Engineering Journal

Unit Tests

Implementation classes

Package names

Repository filenames

---

## Document Structure

Use:

# Sequence Diagram

## Purpose

## Runtime Flow

## Mermaid Diagram

## Request

## Response

## Error Handling

## Business Logic Boundary

## Key Takeaway

---

## Mermaid

Use

sequenceDiagram

Use activation bars.

Use return arrows.

Label every call.

Include HTTP POST.

Include JSON Response.

Include Eligibility Decision.

---

## Error Handling

Document

400

404

500

Network failure

Validation failure

---

## Business Logic Boundary

Clearly explain

Salesforce owns

UI

Input validation

REST invocation

FastAPI owns

Eligibility rules

Decision making

Data retrieval

---

## Engineering Journal

Create

engineering-journal/10-sequence-diagram.md

Include

Purpose

Design decisions

Validation

Lessons learned

Excluded details

---

## Validation

Before finishing

Verify Mermaid renders.

Verify participants match implementation.

Verify runtime order is correct.

Verify no unsupported technology appears.

Verify business logic ownership is accurate.

Begin with a concise implementation plan.