# Architecture

## Purpose

This document describes the solution architecture for the Member Eligibility Verification reference implementation.

It explains the architectural decisions, component responsibilities, request flow, and technology choices used to translate the business requirements into a maintainable enterprise solution.

This document serves as the foundation for API design, implementation, testing, and future enhancements.

---

# Audience

This document is intended for:

- Enterprise Architects
- Solution Architects
- Technical Leads
- Software Engineers
- Integration Engineers

---

# Architecture Goals

The solution has been designed to achieve the following objectives:

- Keep the solution simple and easy to understand.
- Separate business logic from presentation logic.
- Support future expansion without redesign.
- Demonstrate enterprise engineering best practices.
- Provide a reusable service that can support multiple client applications.
- Showcase WorkflowFox's AI-assisted engineering methodology.

---

# Architecture Principles

The architecture follows several core principles.

## Business First

Architecture exists to solve the business problem.

Technology choices support the business objective rather than drive it.

---

## Separation of Concerns

Each component has a single responsibility.

Salesforce provides the user experience.

The backend owns business logic.

The data layer provides member information.

---

## API First

The API contract is defined before implementation.

This enables independent development, testing, and future integrations.

---

## Reusable Business Services

Eligibility rules belong in a reusable backend service rather than inside Salesforce.

Future applications should be able to reuse the same service without duplicating business logic.


---

# High-Level Architecture

```text
+----------------------------------------------------+
|                 Provider Relations                 |
+--------------------------+-------------------------+
                           |
                           |
                           v
+----------------------------------------------------+
|              Salesforce Service Cloud              |
|                                                    |
|  Lightning Web Component                           |
|                 |                                  |
|                 v                                  |
|              Apex Controller                       |
|                 |                                  |
|         Named Credential                           |
+-----------------|----------------------------------+
                  |
                  |
                  v
+----------------------------------------------------+
|            Member Eligibility Service              |
|                  (FastAPI)                         |
|                                                    |
|  Eligibility Service                               |
|  Member Repository                                 |
|  Coverage Repository                               |
+-----------------|----------------------------------+
                  |
                  |
                  v
+----------------------------------------------------+
|        Synthetic Member Data Repository            |
|                 JSON Files                         |
+----------------------------------------------------+
```

---

# Component Responsibilities

## Salesforce

Responsibilities:

- Accept Member ID
- Invoke backend service
- Display eligibility result
- Display user-friendly errors

Salesforce does **not** evaluate eligibility.

---

## Apex

Responsibilities:

- Call backend REST API
- Handle HTTP responses
- Deserialize JSON
- Return strongly typed objects to the LWC

Apex does **not** contain business rules.

---

## Member Eligibility Service

Responsibilities:

- Retrieve member information
- Retrieve coverage information
- Evaluate eligibility
- Return standardized responses

This service owns the business logic.

---


# Request Flow

The following sequence describes the end-to-end request.

1. Provider supplies a Member ID.
2. Representative enters the Member ID into Salesforce.
3. LWC invokes Apex.
4. Apex calls the Member Eligibility Service.
5. The service retrieves member and coverage information.
6. Eligibility rules are evaluated.
7. A standardized response is returned.
8. Salesforce displays the eligibility outcome.

---

# Technology Decisions

| Layer | Technology | Reason |
|--------|------------|--------|
| User Interface | Salesforce LWC | Familiar enterprise user experience |
| Integration | Apex + Named Credentials | Secure outbound API integration |
| Backend | Python + FastAPI | Lightweight, modern API framework that aligns well with AI-assisted engineering |
| API Contract | OpenAPI | Contract-first development |
| Data | JSON | Simple, portable, synthetic reference data |
| Testing | Pytest + Apex Tests | Automated verification of business behavior |

---

# Architecture Decisions

## AD-001

**Decision**

Business rules are implemented in the backend service.

**Reason**

Prevents duplication across Salesforce, web applications, mobile applications, and future integrations.

---

## AD-002

**Decision**

Salesforce serves as the presentation layer.

**Reason**

Allows user experience changes without affecting business logic.

---

## AD-003

**Decision**

Use OpenAPI before implementation.

**Reason**

The API contract becomes the shared agreement between frontend and backend development.

---

## AD-004

**Decision**

Use synthetic data.

**Reason**

Allows the repository to be publicly shared while demonstrating realistic enterprise workflows.

---

## AD-005

**Decision**

Implement Version 1 using a lightweight architecture.

**Reason**

The goal is to demonstrate engineering methodology rather than infrastructure complexity.

---

# Alternatives Considered

## Business Logic in Salesforce

**Rejected**

Business rules would become tightly coupled to Salesforce and difficult to reuse.

---

## Spring Boot

**Considered**

Spring Boot is an excellent enterprise framework.

For this reference implementation, FastAPI provides a simpler implementation while aligning well with WorkflowFox's AI-assisted engineering approach and future AI-focused reference implementations.

---

## PostgreSQL

**Deferred**

JSON provides sufficient capability for Version 1 while reducing setup complexity.

A relational database will be introduced when future business requirements require persistent storage.

---

# Future Evolution

Future versions may introduce:

- PostgreSQL
- Authentication and Authorization
- Docker
- Kubernetes
- Event-driven architecture
- AI-assisted decision support
- Observability
- CI/CD automation

These capabilities will be introduced only when justified by additional business requirements.

---

# Traceability

## Source

- 01-business-discovery.md
- 02-functional-requirements.md

## Produces

- 04-openapi.yaml
- Backend Implementation
- Salesforce Integration
- Test Strategy
- Deployment Architecture