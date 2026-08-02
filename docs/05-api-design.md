# API Design

## Purpose

This document defines the REST API exposed by the Member Eligibility Service.

It specifies the API responsibilities, resources, request and response models, error handling, and versioning strategy before implementation begins.

The OpenAPI specification generated from this document becomes the implementation contract between Salesforce, backend services, testing, and AI-assisted development.

---

# Audience

- API Designers
- Backend Developers
- Salesforce Developers
- QA Engineers
- Integration Engineers
- AI Coding Agents

---

# API Goals

The API has been designed to:

- Expose a simple eligibility verification capability
- Keep business logic independent of Salesforce
- Support future channels and applications
- Provide consistent response structures
- Be easy to consume and test

---

# API Style

The Member Eligibility Service follows REST principles.

Characteristics include:

- Resource-oriented endpoints
- JSON request and response payloads
- Stateless interactions
- Standard HTTP methods
- Standard HTTP status codes

---

# Resource

## Eligibility Verification

Version 1 exposes a single business capability.

```
POST /api/v1/eligibility/verify
```

The client submits a Member ID.

The service evaluates eligibility and returns a standardized response.

---

# Request Model

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| memberId | String | Yes | Member identifier |

---

# Response Model

| Field | Description |
|--------|-------------|
| memberId | Member identifier |
| eligibilityStatus | Eligible, Ineligible, Member Not Found, Unable to Determine |
| reason | Human-readable explanation |
| coverageType | Medical, Dental, Vision, etc. |
| effectiveDate | Coverage effective date |
| terminationDate | Coverage termination date |

---

# HTTP Status Codes

| Status | Meaning |
|---------|----------|
| 200 | Eligibility evaluated successfully |
| 400 | Invalid request |
| 404 | Member not found |
| 500 | Unexpected system error |

---

# Error Response

Every error response should follow a consistent structure.

| Field | Description |
|--------|-------------|
| code | Error code |
| message | User-friendly message |
| timestamp | Time of error |
| correlationId | Request identifier |

---

# Versioning

The API uses URI versioning.

```
/api/v1/
```

Future enhancements should introduce new versions without breaking existing consumers.

---

# Security

Version 1 assumes trusted internal communication.

Future versions may introduce:

- OAuth 2.0
- JWT
- Mutual TLS
- API Gateway

---

# Idempotency

Eligibility verification is a read-only operation.

Submitting the same request multiple times should produce the same response when the underlying data has not changed.

---

# API Design Decisions

## APD-001

Expose a single business endpoint rather than CRUD operations.

Reason:

Consumers care about business outcomes, not database entities.

---

## APD-002

Return standardized response models.

Reason:

Simplifies client integrations.

---

## APD-003

Use POST for eligibility verification.

Reason:

Supports future request expansion while keeping request payloads flexible.

---

# Future Evolution

Future API capabilities may include:

- Coverage Details
- Benefits
- Claims History
- Prior Authorization
- Provider Validation
- Bulk Eligibility Verification

---

# Traceability

## Source

- 02-functional-requirements.md
- 03-architecture.md
- 04-implementation-design.md

## Produces

- OpenAPI Specification
- FastAPI Controllers
- Apex Callouts
- Integration Tests