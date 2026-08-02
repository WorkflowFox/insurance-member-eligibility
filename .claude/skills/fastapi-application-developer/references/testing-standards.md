# Testing Standards

> Generated from industry best practices for Python 3.13, FastAPI, Pydantic v2, Uvicorn, Pytest, and Ruff. Update with organization-specific standards as needed.

This reference defines how a WorkflowFox FastAPI backend should be tested
so that every documented requirement and error scenario has verifiable
coverage. It is project-agnostic — specific test cases always come from the
project's functional requirements and OpenAPI contract.

---

## Unit Tests

- Test business rules directly against the service layer, without an HTTP
  client — services must be constructible and callable in a plain Pytest
  function.
- Use lightweight fakes or in-memory implementations of repository
  interfaces for unit tests rather than the real data adapter, so tests are
  fast and deterministic.
- One test (or a small parametrized set) per documented business rule.
  Name tests after the rule or behavior being verified, not after
  implementation details (`test_order_before_start_date_is_not_active`, not
  `test_evaluate_2`).

---

## FastAPI Integration Tests

- Use FastAPI's `TestClient` (or `httpx.AsyncClient` for async apps) to
  exercise the full request/response cycle: routing, validation,
  serialization, and error handling together.
- Build the app under test via the same factory function
  (`create_app()`) used in production, optionally with dependency overrides
  for repositories, so integration tests use realistic wiring rather than
  hand-constructed routers.
- Assert on status code, response schema shape, and specific field values —
  not just "the call succeeded."

---

## Pytest Fixtures

- Keep fixtures in `conftest.py`, scoped as narrowly as correctness allows
  (function-scoped by default; broaden only when setup is expensive and
  genuinely shareable/immutable).
- Provide a fixture for a test client bound to the app factory, and
  fixtures for any fake/in-memory repository implementations used across
  multiple test modules.
- Avoid fixtures that hide business-relevant setup — if a test's outcome
  depends on specific input data, that data should be visible in the test
  or in a clearly named fixture, not buried in a generic shared fixture.

---

## Boundary Cases

- For any rule expressed as a date or numeric comparison (e.g., "active if
  today is between a start and end date, inclusive"), test the boundary
  values explicitly: the day before, the exact boundary day, and the day
  after — inclusive/exclusive behavior is exactly where
  off-by-one defects hide.
- For any required string field, test both an empty string and a missing
  field, since these commonly trigger different validation paths.

---

## Error Scenarios

- Every error scenario documented in the functional requirements and every
  non-2xx response defined in the OpenAPI contract must have at least one
  corresponding test.
- Assert the full error contract: status code, and — when the contract
  defines a standard error schema — the response body's structure and
  relevant field values (e.g., the expected `code`).
- Do not test only the "happy path" for an endpoint that the specification
  defines multiple outcomes for; each documented outcome is a first-class
  test case.

---

## Deterministic Test Data

- Test data must be fixed and deterministic — do not depend on the current
  system date/time without controlling it (e.g., freeze or inject "today"
  rather than comparing against `date.today()` inside the test and the
  implementation simultaneously, which can mask off-by-one bugs at
  midnight boundaries).
- Prefer explicit, readable literal values in test data (specific dates,
  specific IDs) over randomly generated data, so failures are reproducible
  and self-explanatory.
- Reuse the project's synthetic data conventions (see
  [security-basics.md](security-basics.md)) — never use real personal data
  in tests.

---

## Requirement-to-Test Traceability

- Every test should be traceable to a requirement ID, business rule ID, or
  contract element (e.g., a test docstring or comment referencing "BR-003"
  or the OpenAPI operation/schema it verifies) so coverage can be checked
  against the specification set, not just against code paths.
- When producing the final traceability summary (see the skill's
  [traceability matrix template](../assets/traceability-matrix-template.md)),
  every "Implemented" requirement must have at least one corresponding
  test entry; a requirement with no test is not complete.
- Do not report a requirement as tested unless a test for it actually
  exists and passes — an untested requirement should be listed as a gap,
  not marked done.
