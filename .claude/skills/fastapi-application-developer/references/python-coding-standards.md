# Python Coding Standards

> Generated from industry best practices for Python 3.13, FastAPI, Pydantic v2, Uvicorn, Pytest, and Ruff. Update with organization-specific standards as needed.

This reference defines baseline Python coding conventions for WorkflowFox
FastAPI backends. It is project-agnostic and applies to any codebase built
with this skill.

---

## Type Hints

- Every function signature (parameters and return type) must be fully typed.
- Use built-in generics (`list[str]`, `dict[str, int]`) rather than
  `typing.List` / `typing.Dict` — Python 3.13 does not need the `typing`
  aliases for these.
- Use `X | None` instead of `Optional[X]`.
- Avoid `Any` unless interfacing with genuinely untyped external data (e.g.,
  raw JSON before validation). Once data passes through a Pydantic model, it
  should be concretely typed.
- Use `from __future__ import annotations` only if the project's Python
  version or tooling requires deferred evaluation; Python 3.13 generally
  does not need it.

---

## Naming

- Modules: `snake_case`.
- Classes: `PascalCase`.
- Functions and variables: `snake_case`.
- Constants: `UPPER_SNAKE_CASE`.
- Use domain-oriented names (`InvoiceService`, `CustomerRepository`), not
  generic ones (`Manager`, `Helper`, `Utils`).
- Boolean names should read as predicates (`is_active`, `has_permission`),
  not ambiguous nouns.

---

## Imports

- Group imports: standard library, third-party, local application — each
  group separated by a blank line, alphabetized within the group (Ruff's
  `isort` rules enforce this automatically).
- Avoid wildcard imports (`from module import *`).
- Avoid deep relative imports (`from ...core.config import Settings`);
  prefer absolute imports rooted at the application package.
- Do not import from the API layer into the service or repository layers.

---

## Error Handling

- Raise specific, named exceptions for domain errors (e.g.,
  `ResourceNotFoundError`, `InvalidResourceIdError`) rather than generic
  `Exception` or `ValueError` for business conditions.
- Catch exceptions only where they can be meaningfully handled (typically at
  the API layer, where domain exceptions are translated to HTTP responses).
- Do not use exceptions for expected, non-error control flow.
- Never silently swallow an exception (`except Exception: pass`). If a
  failure must not propagate, log it with enough context to diagnose later.

---

## Dataclasses versus Pydantic

- Use **Pydantic models** for anything that crosses a validation boundary:
  API request/response bodies, external data being parsed, configuration.
- Use **`dataclasses`** (or plain classes) for internal-only structures that
  do not need validation or serialization — e.g., an internal computation
  result passed between two functions in the same layer.
- Do not use Pydantic purely for its `__init__` convenience where a
  dataclass would do; Pydantic's validation and serialization overhead
  should be justified by an actual boundary.

---

## Small Functions

- Each function should do one thing and be readable without scrolling.
- Extract a helper when a block of logic has its own name-worthy purpose,
  not merely to shorten a function.
- Prefer early returns over deeply nested conditionals.

---

## Avoiding Unnecessary Abstraction

- Do not introduce interfaces, factories, or plugin systems for a single
  concrete implementation the specifications do not call for.
- Do not add configuration flags, feature toggles, or extensibility points
  for hypothetical future requirements.
- Three similar lines of code are preferable to a premature shared
  abstraction — only extract a shared abstraction once a real second use
  case exists.
- A one-shot script or adapter does not need a class hierarchy.

---

## Ruff Conventions

- Ruff is the single source of truth for lint and formatting; do not hand
  enforce style that Ruff already checks.
- Run `ruff check .` before considering implementation work complete.
- Do not disable Ruff rules inline (`# noqa`) without a one-line comment
  explaining the specific, justified reason.
- Keep line length and formatting consistent with the project's
  `pyproject.toml` Ruff configuration; if none exists yet, use Ruff's
  defaults rather than inventing custom rules.
