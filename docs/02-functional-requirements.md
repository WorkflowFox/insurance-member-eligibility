# Functional Requirements

## Purpose

This document defines the functional capabilities required for the Member Eligibility Verification reference implementation.

It translates the business problem identified during Business Discovery into clear, implementable requirements that guide architecture, API design, implementation, and testing.

---

## Audience

This document is intended for:

- Business Stakeholders
- Product Owners
- Solution Architects
- Software Engineers
- QA Engineers

---

# Overview

The objective of this implementation is to provide a simple and reusable capability for verifying whether a healthcare member currently has active insurance coverage.

A Provider Relations representative enters a Member ID within Salesforce.

The application retrieves the member's information, evaluates eligibility according to predefined business rules, and returns a clear eligibility decision.


---

# Primary Actor

**Provider Relations Representative**

The representative answers eligibility inquiries from healthcare providers.

---

# Supporting Systems

- Salesforce Service Cloud
- Member Eligibility Service
- Member Data Repository (Synthetic Data)

---

# Business Capabilities

The application shall support the following business capabilities.

## FC-001 — Verify Member Eligibility

The representative can verify whether a member currently has active coverage using a Member ID.

Business Value

- Reduces manual effort
- Improves response time
- Standardizes eligibility decisions

---

## FC-002 — Retrieve Member Information

The application retrieves the member record associated with the supplied Member ID.

Business Value

- Eliminates manual searching
- Provides a consistent starting point for eligibility evaluation

---

## FC-003 — Retrieve Coverage Information

The application retrieves the member's current coverage information.

Coverage information includes:

- Coverage Type
- Effective Date
- Termination Date

Business Value

Supports consistent eligibility evaluation.

---

## FC-004 — Evaluate Eligibility

The application evaluates whether the member is eligible on the current date.

Business Value

Provides a consistent business decision independent of the user.

---

## FC-005 — Display Eligibility Result

The representative receives a clear eligibility outcome.

Possible outcomes include:

- Eligible
- Ineligible
- Unable to Determine
- Member Not Found

Business Value

Reduces ambiguity during provider interactions.

---

# User Outcomes

After completing the workflow, the representative should be able to:

- Verify eligibility within seconds.
- Respond confidently to the provider.
- Avoid navigating multiple systems.
- Receive consistent eligibility decisions.

---

# Business Rules

## BR-001

A Member ID is required.

---

## BR-002

If no member exists for the supplied Member ID, the application returns:

**Member Not Found**

---

## BR-003

If today's date falls between the Effective Date and Termination Date (inclusive), the member is considered:

**Eligible**

---

## BR-004

If today's date is before the Effective Date, the member is considered:

**Ineligible**

Reason:

Coverage Not Yet Effective

---

## BR-005

If today's date is after the Termination Date, the member is considered:

**Ineligible**

Reason:

Coverage Terminated

---

## BR-006

If sufficient information is unavailable to evaluate eligibility, the application returns:

**Unable to Determine**

---

# Functional Flow

```text
Representative

↓

Enter Member ID

↓

Retrieve Member

↓

Retrieve Coverage

↓

Evaluate Eligibility

↓

Display Result
```

---

# Error Scenarios

The application shall support the following business scenarios.

| Scenario | Expected Result |
|----------|-----------------|
| Invalid Member ID | Member Not Found |
| Missing Coverage | Unable to Determine |
| Coverage Not Yet Effective | Ineligible |
| Coverage Terminated | Ineligible |
| Active Coverage | Eligible |

---

# Version 1 Scope

Version 1 includes:

- Member lookup
- Coverage lookup
- Eligibility evaluation
- Salesforce user interface
- REST API
- Synthetic data
- Automated tests

---

# Out of Scope

Version 1 does not include:

- Claims
- Benefits
- Copay calculations
- Deductibles
- Prior Authorization
- Provider Search
- Multiple coverage records
- Historical eligibility
- Runtime AI
- RAG
- AI Agents

These capabilities will be introduced in future reference implementations where appropriate.

---

# Acceptance Summary

The solution is considered functionally complete when a representative can:

- Enter a Member ID.
- Receive one of the supported eligibility outcomes.
- Complete the workflow without manually consulting another system.

---

# Traceability

**Source**

- 01-business-discovery.md

**Produces**

- 03-solution-architecture.md
- 04-openapi-specification.md
- Salesforce Integration
- FastAPI Backend
- Test Scenarios