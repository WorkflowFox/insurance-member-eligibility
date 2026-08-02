# Security Basics

> Generated from industry best practices for Python 3.13, FastAPI, Pydantic v2, Uvicorn, Pytest, and Ruff. Update with organization-specific standards as needed.

This reference defines baseline, specification-scoped security hygiene for
WorkflowFox FastAPI backends. It intentionally covers only practices that
apply regardless of whether a given project requires authentication —
**do not add authentication, authorization, encryption, or other security
infrastructure to a project implementation unless the project's
specifications explicitly require it.** Adding unrequested security
infrastructure is itself a specification violation (unsupported complexity),
not a safety improvement.

---

## Synthetic Data

- When a project's data layer is specified as synthetic/reference data
  (e.g., JSON fixtures), never substitute real personal data, even for
  local testing convenience.
- Keep synthetic data clearly identifiable as synthetic (e.g., obviously
  fictional names, non-real identifiers) so it cannot be mistaken for real
  member or customer data if it leaks.
- Do not commit real credentials, tokens, or production data into any
  fixture, seed file, or test.

---

## Input Validation

- Every externally supplied value must pass through the API layer's
  Pydantic request models before reaching business logic — do not accept
  unvalidated raw request bodies in a route handler.
- Validation constraints (required fields, non-empty strings, enums, date
  formats) must match what the OpenAPI contract specifies — this is a
  security control as much as a correctness one: it prevents malformed or
  oversized input from reaching downstream code.
- Never build a file path, query, or shell command from unvalidated user
  input. If the data layer is file-based (e.g., a JSON lookup by ID), treat
  the identifier as an untrusted string and validate it against the
  contract's constraints before using it to construct a lookup key or path.

---

## Sensitive-Data Minimization

- Return only the fields the OpenAPI contract's response schema defines.
  Do not add convenience fields (e.g., date of birth, government
  identifiers, internal record IDs) that the contract does not specify,
  even if the underlying domain model contains them.
- When a domain model carries more data than the response contract exposes
  (e.g., an internal `Member` object with fields the API response omits),
  map explicitly to the response model at the API boundary rather than
  serializing the domain model directly — this prevents accidental
  over-exposure when the domain model changes.

---

## Logging Restrictions

- Never log full request or response bodies if they may contain personal or
  sensitive data — log identifiers and outcomes instead (e.g., "evaluated
  request R100234: ACTIVE", not the full response payload).
- Do not log values the implementation specification explicitly says not to
  log.
- Correlation IDs, timestamps, and status outcomes are generally safe to
  log; names, dates of birth, and other personal identifiers generally are
  not, unless the specification says otherwise.
- Log at a level appropriate to the event: incoming requests and business
  outcomes at `INFO`, unexpected failures at `ERROR` with enough context to
  diagnose (but without leaking sensitive data or full stack traces to
  clients).

---

## Secret Handling

- Configuration values that are secrets (API keys, credentials, tokens)
  must be sourced from environment variables or a secrets manager, never
  hardcoded in source, fixtures, or committed configuration files.
- If a project's specifications do not require any secrets (e.g., a local
  JSON-file data source with no external integrations), do not invent
  configuration for secrets that do not exist.
- `.env` files used for local development must be excluded from version
  control (`.gitignore`); commit an `.env.example` with placeholder values
  only if the project's implementation specification calls for one.

---

## Dependency Hygiene

- Only add the dependencies the project's technology stack specifies (see
  the project's `03-architecture.md` / implementation design). Do not add
  unrelated libraries "for convenience."
- Pin dependency versions in `pyproject.toml` to known-good versions rather
  than leaving them unbounded, so builds stay reproducible.
- Avoid dependencies with known unmaintained status or a history of
  security advisories when an actively maintained alternative satisfies the
  same requirement.
