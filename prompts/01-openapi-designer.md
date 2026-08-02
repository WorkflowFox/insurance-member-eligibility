You are acting as a Senior API Designer.

Your task is to create the machine-readable OpenAPI contract for the
Member Eligibility Verification reference implementation.

Do not generate FastAPI code, Salesforce code, tests, or infrastructure.
Create only the API contract and make any minimal repository changes
required to support it.

Before doing any work, read these files:

- docs/01-business-discovery.md
- docs/02-functional-requirements.md
- docs/03-architecture.md
- docs/04-implementation-design.md
- docs/05-api-design.md
- CLAUDE.md, if present

If any required file is missing, stop and report exactly which file is
missing. Do not invent requirements.

Create this file:

contracts/member-eligibility.yaml

Use OpenAPI 3.1.0.

The contract must define:

Endpoint:
POST /api/v1/eligibility/verify

Request body:
- memberId
- required
- non-empty string

Successful business outcomes:
- ELIGIBLE
- INELIGIBLE
- UNABLE_TO_DETERMINE

Member-not-found behavior:
- Return HTTP 404
- Use the standard error response schema

Successful response fields:
- memberId
- memberName
- eligibilityStatus
- reason
- evaluationDate
- coverageType
- effectiveDate
- terminationDate

Rules:
- memberId, memberName, eligibilityStatus, reason, and evaluationDate are
  required for a successful eligibility response.
- coverageType, effectiveDate, and terminationDate may be nullable when
  eligibility cannot be determined.
- Use ISO 8601 date format for dates.
- Use camelCase JSON property names.
- Use reusable schemas under components/schemas.
- Include meaningful descriptions and realistic synthetic examples.
- Do not include date of birth or other unnecessary personal data.
- Do not add endpoints or fields that are not supported by the
  specification documents.
- Do not add OAuth, JWT, API gateway, database, bulk processing,
  pagination, or runtime AI.

Define reusable schemas for at least:

- EligibilityVerificationRequest
- EligibilityVerificationResponse
- EligibilityStatus
- ErrorResponse
- ValidationErrorResponse, only if needed for HTTP 400

Define these HTTP responses:

- 200: eligibility successfully evaluated
- 400: invalid request
- 404: member not found
- 500: unexpected service failure

The standard error response should contain:

- code
- message
- timestamp
- correlationId

Also include:

- API title
- version 1.0.0
- concise API description
- operationId
- tags
- request and response examples
- server entry for local development using http://localhost:8000

Before finishing:

1. Validate the YAML syntax.
2. Validate the OpenAPI structure using an available local validation
   tool. If no validator is installed, state that clearly and perform a
   careful structural review instead.
3. Map each endpoint, field, status code, and schema back to the source
   specification.
4. Report any conflicts or ambiguities you found.
5. Do not claim validation passed unless a validator actually ran.

First show a short plan. Then create the file and report exactly what
was added.