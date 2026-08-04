# Sequence Diagram

## Purpose

This diagram shows the runtime request flow for the Member Eligibility Verification capability: exactly what happens after a Provider Relations Representative presses **Verify Eligibility**, across every container introduced in [`02-container-diagram.md`](02-container-diagram.md), down to the point where a result is displayed back to the representative.

It is scoped to the single validated capability — `POST /api/v1/eligibility/verify` — and to the runtime path only. It does not describe deployment infrastructure, build tooling, or how the implementation was generated or tested; those are covered by [`docs/06-end-to-end-architecture.md`](../../docs/06-end-to-end-architecture.md) and the engineering journals.

## Runtime Flow

1. The representative enters a Member ID and clicks **Verify Eligibility**.
2. The Salesforce LWC validates the input is not blank before calling Apex.
3. The LWC calls the Apex Controller.
4. The Apex Controller invokes the Apex Integration Service.
5. The Integration Service sends an HTTP POST through the Named Credential.
6. The FastAPI Eligibility API receives the request.
7. The Eligibility Service evaluates the request.
8. The Eligibility Service requests the Member from the Member Repository.
9. The Member Repository retrieves the Member from Synthetic Member Data.
10. The Eligibility Service requests Coverage from the Coverage Repository.
11. The Coverage Repository retrieves Coverage from Synthetic Member Data.
12. The Eligibility Service determines the Eligibility Decision.
13. FastAPI returns a standardized JSON response.
14. The response returns through the Named Credential, the Apex Integration Service, and the Apex Controller to the LWC.
15. The representative sees the Eligibility Result.

Source: `docs/06-end-to-end-architecture.md`, "End-to-End Request Flow" and "High-Level Architecture."

## Mermaid Diagram

```mermaid
sequenceDiagram
    actor Rep as Provider Relations Representative
    participant LWC as Salesforce LWC
    participant Ctrl as Apex Controller
    participant Integ as Apex Integration Service
    participant NC as Named Credential
    participant API as FastAPI Eligibility API
    participant Elig as Eligibility Service
    participant MRepo as Member Repository
    participant CRepo as Coverage Repository
    participant Data as Synthetic Member Data

    Note over LWC,NC: Salesforce — presentation and integration only. Named Credential is part of Salesforce.
    Note over API,CRepo: FastAPI Eligibility Service — owns all business rules.
    Note over LWC,Data: Request and response shapes are governed by the OpenAPI Contract (contracts/member-eligibility.yaml).

    Rep->>LWC: Enters Member ID
    Rep->>LWC: Clicks Verify Eligibility
    activate LWC
    LWC->>LWC: Validates input (Member ID not blank)

    alt Member ID is blank — client-side validation failure
        LWC-->>Rep: Displays inline validation error
    else Member ID present
        LWC->>Ctrl: verifyEligibility(memberId)
        activate Ctrl
        Ctrl->>Ctrl: Guards against blank Member ID
        Ctrl->>Integ: verifyEligibility(memberId)
        activate Integ
        Integ->>NC: HTTP POST /api/v1/eligibility/verify
        activate NC

        alt Network or transport failure
            NC--xInteg: Callout exception (timeout / connection failure — no response received)
        else Callout reaches FastAPI
            NC->>API: HTTP POST (forwarded)
            activate API

            alt Request fails input validation (400)
                API-->>NC: 400 Bad Request — JSON Response (ValidationErrorResponse)
            else Member not found (404)
                API->>MRepo: Find Member by Member ID
                activate MRepo
                MRepo->>Data: Read member record
                activate Data
                Data-->>MRepo: No match
                deactivate Data
                MRepo-->>API: No match
                deactivate MRepo
                API-->>NC: 404 Not Found — JSON Response (ErrorResponse: MEMBER_NOT_FOUND)
            else Unexpected system error (500)
                API-->>NC: 500 Internal Server Error — JSON Response (ErrorResponse)
            else Member found — eligibility evaluated (200)
                API->>Elig: Evaluate eligibility(memberId)
                activate Elig
                Elig->>MRepo: Find Member by Member ID
                activate MRepo
                MRepo->>Data: Read member record
                activate Data
                Data-->>MRepo: Member record
                deactivate Data
                MRepo-->>Elig: Member record
                deactivate MRepo
                Elig->>CRepo: Find Coverage by Member ID
                activate CRepo
                CRepo->>Data: Read coverage record
                activate Data
                Data-->>CRepo: Coverage record (or none)
                deactivate Data
                CRepo-->>Elig: Coverage record (or none)
                deactivate CRepo
                Elig->>Elig: Determines Eligibility Decision (compares coverage dates to evaluation date)
                Elig-->>API: Eligibility Decision
                deactivate Elig
                API-->>NC: 200 OK — JSON Response (EligibilityVerificationResponse)
            end
            deactivate API
            NC-->>Integ: HTTP response
        end
        deactivate NC
        Integ->>Integ: Deserializes response or translates failure to exception
        Integ-->>Ctrl: Result or translated exception
        deactivate Integ
        Ctrl-->>LWC: Result or AuraHandledException
        deactivate Ctrl
        LWC-->>Rep: Displays eligibility outcome or error state
    end
    deactivate LWC
```

## Request

The only request shape in this flow is `EligibilityVerificationRequest`, carried in the HTTP POST body to `POST /api/v1/eligibility/verify`:

| Field | Type | Required | Description |
|---|---|---|---|
| `memberId` | string (min length 1) | Yes | Member identifier supplied by the provider |

Source: `contracts/member-eligibility.yaml`, `components.schemas.EligibilityVerificationRequest`.

## Response

On success (200), FastAPI returns `EligibilityVerificationResponse`:

| Field | Description |
|---|---|
| `memberId` | Member identifier |
| `memberName` | Full name of the member |
| `eligibilityStatus` | `ELIGIBLE`, `INELIGIBLE`, or `UNABLE_TO_DETERMINE` |
| `reason` | Human-readable explanation |
| `evaluationDate` | Date eligibility was evaluated |
| `coverageType` | Nullable — null when `UNABLE_TO_DETERMINE` |
| `effectiveDate` | Nullable — null when `UNABLE_TO_DETERMINE` |
| `terminationDate` | Nullable — null when `UNABLE_TO_DETERMINE` |

On 400, 404, or 500, FastAPI returns `ErrorResponse` (400 uses `ValidationErrorResponse`, structurally identical): `code`, `message`, `timestamp`, `correlationId`.

A member that cannot be found produces an HTTP 404 error response, not an `eligibilityStatus` value — there is no "Member Not Found" status in the response enum.

Source: `contracts/member-eligibility.yaml`, `components.schemas.EligibilityVerificationResponse`, `EligibilityStatus`, `ErrorResponse`, `ValidationErrorResponse`.

## Error Handling

| Scenario | Where it is handled | What happens |
|---|---|---|
| **Validation failure** (blank Member ID) | Salesforce LWC, before any Apex call | The LWC's own input validation blocks submission and shows an inline error; no callout is made. The Apex Controller applies the same guard again as a second check before invoking the Integration Service. |
| **400 — Invalid request** | FastAPI, if an invalid request still reaches the API | FastAPI returns `ValidationErrorResponse` (`code`, `message`, `timestamp`, `correlationId`). The Integration Service translates this into an exception the Apex Controller turns into an `AuraHandledException` for the LWC. |
| **404 — Member not found** | FastAPI, after a Member Repository lookup finds no match | FastAPI returns `ErrorResponse` with `code: MEMBER_NOT_FOUND`. The Integration Service translates this into `MemberEligibilityIntegrationException`; the Controller surfaces it to the LWC as an `AuraHandledException`, and the LWC shows a "member not found" error state. |
| **500 — Unexpected system error** | FastAPI, on an unhandled failure while evaluating eligibility | FastAPI returns `ErrorResponse` with `code: INTERNAL_SERVER_ERROR`. Handled the same way as 404 by Apex — translated to an exception, surfaced as a generic error state in the LWC. |
| **Network failure** | Apex Integration Service, if the callout itself fails (timeout, connection failure) | No HTTP response is received from FastAPI at all. The Integration Service catches the callout exception and translates it into `MemberEligibilityIntegrationException`, which the Controller turns into a generic `AuraHandledException` for the LWC. |

Source: `docs/06-end-to-end-architecture.md`, "End-to-End Request Flow" and "Component Responsibilities"; `contracts/member-eligibility.yaml`, `paths./api/v1/eligibility/verify.post.responses`.

## Business Logic Boundary

**Salesforce owns:**

- UI — collecting the Member ID and rendering loading/success/error states.
- Input validation — the LWC's blank-Member-ID check and the Apex Controller's blank-Member-ID guard.
- REST invocation — building and executing the HTTP callout through the Named Credential, and deserializing the response.

**Salesforce does not evaluate eligibility.** No date comparison, coverage-window logic, or eligibility decision exists anywhere in Salesforce; every outcome it displays is a value the backend already computed.

**FastAPI owns:**

- Eligibility rules — comparing coverage effective and termination dates to the evaluation date (BR-001–BR-006).
- Decision making — producing the `ELIGIBLE` / `INELIGIBLE` / `UNABLE_TO_DETERMINE` outcome, or the 404 member-not-found result.
- Data retrieval — the Member Repository and Coverage Repository are the only components that read Synthetic Member Data.

Source: `docs/06-end-to-end-architecture.md`, "High-Level Architecture" ("The FastAPI service owns every eligibility business rule and is the only component that evaluates coverage dates... No eligibility logic is duplicated in Salesforce") and "Component Responsibilities."

## Key Takeaway

Every step a representative experiences after clicking **Verify Eligibility** is either Salesforce collecting input and displaying a result, or FastAPI making the eligibility decision — there is exactly one place in this entire flow where the eligibility outcome is decided, and it is not in Salesforce.
