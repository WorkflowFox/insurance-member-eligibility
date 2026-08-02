# API Error Handling

> Generated from industry best practices for Python 3.13, FastAPI, Pydantic v2, Uvicorn, Pytest, and Ruff. Update with organization-specific standards as needed.

This reference defines how a FastAPI application should distinguish and
respond to different categories of error. It is project-agnostic; the exact
error codes, messages, and schema always come from the project's OpenAPI
contract.

---

## Categories of Error

Every FastAPI application built with this skill should distinguish between
four categories, each with a distinct handling path:

1. **Validation errors** — the request itself is malformed or fails input
   constraints (e.g., a required field is missing or empty).
2. **Resource-not-found outcomes** — the request is well-formed, but the
   referenced resource does not exist.
3. **Business outcomes** — the request is well-formed and the resource
   exists, but the business evaluation produces a non-success-but-still-
   valid result (e.g., a "declined" or "not applicable" decision). These
   are **not** errors — they are legitimate 200-level responses defined by
   the contract's response schema.
4. **Unexpected failures** — anything not anticipated by the specification
   (a bug, an unavailable dependency, an unhandled exception).

Only categories 1, 2, and 4 result in an HTTP error status. Category 3 is a
successful response whose body communicates a business result — do not
convert a business outcome into an HTTP error status unless the contract
explicitly says to.

---

## Validation Errors

- Prefer encoding constraints directly in Pydantic request models (field
  types, `Field(min_length=...)`, enums) so FastAPI's built-in validation
  produces the error automatically — do not hand-roll validation the model
  layer already provides.
- Register an exception handler for `RequestValidationError` that reshapes
  FastAPI's default validation error body into the contract's standard
  error response schema, if the contract defines one. Do not return
  FastAPI's default validation error shape unmodified when the contract
  specifies a different structure.
- Return the HTTP status code the contract assigns to validation failures
  (commonly `400`, though some contracts use `422` — always defer to the
  contract, never assume).

---

## Resource-Not-Found Responses

- Raise a specific domain exception from the service or repository layer
  (e.g., `MemberNotFoundError`) when a requested resource does not exist.
- Translate that exception to the contract's specified not-found status
  code (commonly `404`) via a dedicated exception handler at the API layer
  — do not raise `HTTPException` directly from service code, which would
  couple business logic to the web framework.
- The not-found response body must follow the contract's standard error
  schema, populated with a code and message appropriate to what was not
  found.

---

## Business Outcomes

- A business outcome (e.g., a status decision of "declined") is serialized
  using the contract's success response schema, not the error schema, and
  returned with the contract's success status code (commonly `200`).
- Do not raise an exception to represent a business outcome that the
  contract models as a normal response value.
- If the business rules cannot produce a definitive outcome due to missing
  underlying data, and the contract defines a specific status value for
  that case (e.g., "unable to determine"), return that status value in the
  normal success response — this is still category 3, not an error.

---

## Unexpected Failures

- Register a catch-all exception handler for otherwise-unhandled
  exceptions that returns the contract's standard error schema with the
  contract's specified server-error status code (commonly `500`).
- Never leak internal exception details (stack traces, file paths, raw
  exception messages) into the response body — log them internally and
  return a generic, contract-compliant message.
- Every unexpected failure should be logged with enough context (including
  a correlation ID, if the contract defines one) to diagnose later, without
  logging sensitive data (see
  [security-basics.md](security-basics.md)).

---

## HTTP Status Codes

- Status codes are dictated entirely by the OpenAPI contract's `responses`
  object for the operation — never choose a status code based on general
  REST convention when the contract specifies a different one.
- Implement exactly the status codes documented in the contract. Do not add
  additional status codes (e.g., a `409 Conflict`) the contract does not
  define, even if they seem technically reasonable.

---

## Error Response Consistency

- If the contract defines a standard error schema (commonly containing
  fields like `code`, `message`, `timestamp`, and a correlation identifier),
  every error response — validation, not-found, and unexpected failure —
  must use that exact schema. Consistency across error types is what makes
  the API predictable for consumers.
- Centralize error-schema construction in one helper (e.g., a factory
  function or a shared exception handler) rather than building error bodies
  ad hoc in multiple places, so a future schema change only needs a single
  edit.
- A correlation identifier, if the contract requires one, should be
  generated once per request (e.g., via middleware) and threaded through
  logs and the error response, not fabricated separately in each handler.
