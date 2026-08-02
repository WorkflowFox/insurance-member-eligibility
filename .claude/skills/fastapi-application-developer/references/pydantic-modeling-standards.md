# Pydantic Modeling Standards

> Generated from industry best practices for Python 3.13, FastAPI, Pydantic v2, Uvicorn, Pytest, and Ruff. Update with organization-specific standards as needed.

This reference defines how Pydantic v2 models should be authored so that
API-facing models match an OpenAPI contract exactly and internal models stay
independent of the wire format. It is project-agnostic.

---

## Request and Response Separation

- Define a distinct Pydantic model for each request body and each response
  body described in the OpenAPI contract. Do not reuse one model for both
  directions, even when the fields look similar — request and response
  models evolve independently.
- Do not expose internal domain models (service/repository return types)
  directly as API responses unless their shape is already identical to the
  contract's response schema. When they diverge even slightly, map
  explicitly at the API boundary.
- Name models after the OpenAPI schema they implement (e.g., an OpenAPI
  schema named `OrderStatusResponse` should produce a Pydantic class of the
  same name), so the contract and the code stay traceable to each other.

---

## Required versus Optional Fields

- A field the contract marks as required must not have a default value in
  the Pydantic model — a default makes it optional.
- A field the contract marks as optional (not in the schema's `required`
  list) may use `field: X | None = None`, or a non-`None` default when the
  contract specifies one.
- Do not mark a field optional "just in case" — every deviation from the
  contract's required/optional status is a contract violation.

---

## Nullable Fields

- A schema property typed as `["string", "null"]` (OpenAPI 3.1) or marked
  `nullable: true` (OpenAPI 3.0) maps to `field: str | None` in Pydantic.
- Nullable does not imply optional. If the contract still lists the field
  in `required`, the field must always be present in the payload — its
  value may be `null`, but the key may not be omitted. Model this as
  `field: str | None` **without** a default, so callers must supply it
  (even if the value is `None`).
- Only omit a default (forcing explicit `None`) when the contract's
  `required` list includes the field; otherwise use `field: str | None =
  None`.

---

## Enums

- Model any OpenAPI `enum` as a Python `enum.StrEnum` (or `str, Enum` on
  versions predating `StrEnum`) whose member values exactly match the
  contract's enum values, including case (e.g., `ACTIVE`, not `Active`).
- Do not add enum members the contract does not define.
- Reference the enum type from every model field that uses it — do not
  duplicate the literal values with `Literal["ACTIVE", "INACTIVE", ...]` in
  more than one place.

---

## Date Types

- Use `datetime.date` for OpenAPI `format: date` fields, and
  `datetime.datetime` for `format: date-time` fields. Pydantic v2 serializes
  both to ISO 8601 by default — do not hand-write date formatting logic.
- Do not use `str` for date fields; typing them as `date`/`datetime` gives
  validation for free and prevents malformed dates from reaching the
  response.

---

## Aliases

- API field names in the contract are the source of truth. If the contract
  uses `camelCase` (e.g., `customerId`) and the codebase's Python convention
  is `snake_case`, use Pydantic's `alias_generator` (e.g.,
  `to_camel`) with `populate_by_name=True`, or per-field `Field(alias=...)`,
  so the Python attribute stays `snake_case` while the wire format matches
  the contract exactly.
- Do not let internal attribute naming leak into the API payload, and do
  not let wire-format casing leak into internal Python code.

---

## Validation

- Encode contract-level constraints (e.g., `minLength: 1` on `customerId`) as
  Pydantic field constraints (`Field(min_length=1)`), not as manual `if`
  checks in the route handler.
- Use `model_config = ConfigDict(extra="forbid")` on request models when the
  contract sets `additionalProperties: false`, so unexpected fields are
  rejected rather than silently ignored.
- Prefer field-level validators (`field_validator`) for single-field rules
  and model-level validators (`model_validator`) only for rules that span
  multiple fields.
- Validation errors raised by Pydantic should be allowed to propagate to
  FastAPI's default exception handling (or a project-specific handler) that
  maps them to the contract's standard error response — do not duplicate
  Pydantic's validation logic by hand.

---

## Serialization

- Rely on `response_model` (or FastAPI's return-type inference) to enforce
  that only contract-defined fields are serialized — do not manually build
  `dict` responses that bypass model validation.
- Use `model_config = ConfigDict(extra="forbid")` combined with explicit
  field lists so a response can never accidentally leak an internal-only
  attribute (e.g., a field used for computation but not present in the
  OpenAPI response schema).
- When serializing enums, confirm the emitted JSON value matches the
  contract's exact casing — verify this with a contract-alignment test
  rather than assuming Pydantic's default behavior is correct for every
  case.
