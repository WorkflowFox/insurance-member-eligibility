# FastAPI Architecture Patterns

> Generated from industry best practices for Python 3.13, FastAPI, Pydantic v2, Uvicorn, Pytest, and Ruff. Update with organization-specific standards as needed.

This reference defines how a FastAPI application should be structured so that
business logic remains testable, framework-independent, and easy to extend.
It applies to any WorkflowFox FastAPI backend built from an approved
specification set — it contains no project-specific structure or rules.

---

## Layered Architecture

A WorkflowFox FastAPI application separates concerns into distinct layers.
Each layer has exactly one responsibility and depends only on the layers
beneath it.

```text
API layer        → HTTP concerns: routing, request/response shaping, status codes
Service layer     → Business rules, orchestration, domain decisions
Repository layer  → Data retrieval / persistence
Core layer        → Configuration, cross-cutting concerns (logging, settings)
Data layer        → The actual data source (files, database, external API)
```

Requests flow downward (API → Service → Repository → Data). Data and
decisions flow upward. No layer should reach past its immediate neighbor.

---

## Thin Routes

Route handlers are the thinnest possible layer between HTTP and the domain.

A route handler should:

- Accept a validated Pydantic request model.
- Call exactly one service method.
- Translate the service result into an HTTP response.
- Translate known service exceptions into HTTP error responses.

A route handler should **not**:

- Contain conditional business logic (`if` statements that encode business
  rules).
- Perform data lookups directly.
- Format business explanations, reasons, or decisions.
- Import repository classes directly.

```python
# app/api/<resource>.py
@router.post("/api/v1/<resource>/evaluate", response_model=ResourceEvaluationResponse)
def evaluate_resource(
    request: ResourceEvaluationRequest,
    service: ResourceService = Depends(get_resource_service),
) -> ResourceEvaluationResponse:
    return service.evaluate(request.resource_id)
```

The route above does not make the business decision itself. It delegates
entirely to the service and lets FastAPI/Pydantic handle serialization.

---

## Service-Layer Business Logic

The service layer owns all business rules and is the only layer that makes
domain decisions.

- Services accept plain domain inputs (not FastAPI `Request` objects).
- Services return domain results, which the API layer maps to response
  models (or, if the domain result and the response model are identical in
  shape, the response model may be returned directly).
- Services raise domain-specific exceptions (e.g., `ResourceNotFoundError`)
  rather than HTTP exceptions. The API layer translates domain exceptions to
  HTTP responses.
- Services must be callable and testable without starting Uvicorn or
  constructing a `TestClient`.

```python
# app/services/resource_service.py
class ResourceService:
    def __init__(self, resources: ResourceRepository, related: RelatedDataRepository) -> None:
        self._resources = resources
        self._related = related

    def evaluate(self, resource_id: str) -> ResourceEvaluationResult:
        resource = self._resources.find_by_id(resource_id)
        if resource is None:
            raise ResourceNotFoundError(resource_id)
        related_data = self._related.find_by_resource_id(resource_id)
        return self._evaluate(resource, related_data)
```

---

## Repository Boundaries

Repositories retrieve or persist data. They do not decide anything.

- A repository method returns data (or `None` / an empty result) — it never
  returns a business decision, a formatted message, or an HTTP status.
- Repositories are defined by an interface (protocol or abstract base class)
  when more than one implementation is plausible (e.g., JSON file today,
  database later). When the specification supports only one implementation,
  a single concrete class is sufficient — do not add an abstraction for a
  hypothetical future backend.
- Repositories must not import from the API layer or the service layer.

---

## Dependency Management

Use FastAPI's `Depends` system to wire services and repositories into
routes.

- Prefer constructor injection: routes depend on services, services depend
  on repositories.
- Keep dependency provider functions (e.g., `get_resource_service`) in
  `app/api/dependencies.py` or colocated with the router, not scattered
  across the codebase.
- Do not use global mutable state to share instances between requests
  unless the underlying resource is genuinely stateless and safe to share
  (e.g., a read-only in-memory data adapter).

---

## Configuration

- Centralize configuration in a single `Settings` object (Pydantic
  `BaseSettings`) under `app/core/config.py`.
- Load configuration from environment variables with sensible defaults for
  local development.
- Do not scatter `os.environ` reads throughout the codebase.
- Do not hardcode values that vary between environments (host, port, data
  file paths) inside business logic.

---

## Application Startup

- Construct the FastAPI app in a single factory function (e.g.,
  `create_app()`), so tests can build isolated app instances.
- Register routers, exception handlers, and middleware in the factory.
- Keep startup logic minimal — avoid heavyweight initialization unless the
  specification requires it (e.g., no database connection pools when the
  data source is JSON files).

---

## Framework-Independent Domain Logic

Business rules and domain models must not import FastAPI, Starlette, or
Uvicorn symbols. This ensures:

- Business logic can be unit tested with plain Pytest, without an HTTP
  client.
- Business logic could be reused by a future non-FastAPI consumer without
  rewriting it.
- The service layer stays honest about what is "business" versus "web
  framework plumbing."

If a service needs a value that looks HTTP-specific (e.g., a correlation
ID), pass it in as a plain argument from the API layer rather than reaching
into request internals from the service.
