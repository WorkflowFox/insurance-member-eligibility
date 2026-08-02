# Member Eligibility Verification API

FastAPI reference implementation of the Member Eligibility Verification
capability described in `../docs/` and `../contracts/member-eligibility.yaml`.

## Install Dependencies

Requires Python 3.13+. Using [uv](https://docs.astral.sh/uv/):

```bash
cd backend
uv sync
```

## Run the API

```bash
uv run uvicorn app.main:app --reload
```

The API is served at `http://localhost:8000`. Interactive docs are available
at `http://localhost:8000/docs`.

## Run Tests

```bash
uv run pytest
```

## Run Lint

```bash
uv run ruff check .
```

## Project Structure

```text
backend/
├── app/
│   ├── main.py                  # create_app() factory, exception handlers, OpenAPI customization
│   ├── api/
│   │   ├── dependencies.py      # Depends() providers for repositories/service/evaluation date
│   │   └── eligibility.py       # POST /api/v1/eligibility/verify (thin route)
│   ├── models/
│   │   ├── requests.py          # EligibilityVerificationRequest
│   │   ├── responses.py         # EligibilityVerificationResponse, EligibilityStatus
│   │   ├── errors.py            # ErrorResponse, ValidationErrorResponse
│   │   └── domain.py            # Internal dataclasses: Member, Coverage, EligibilityResult
│   ├── services/
│   │   └── eligibility_service.py  # All eligibility business rules (BR-002..BR-006)
│   ├── repositories/
│   │   ├── member_repository.py    # JSON-backed member lookup
│   │   └── coverage_repository.py  # JSON-backed coverage lookup
│   ├── core/
│   │   ├── config.py            # Settings (data file paths)
│   │   ├── exceptions.py        # MemberNotFoundError
│   │   └── logging.py           # Logging configuration
│   └── data/
│       ├── members.json         # Synthetic member records
│       └── coverage.json        # Synthetic coverage records
└── tests/
    ├── unit/                    # Service-layer business rule tests (no HTTP)
    ├── integration/             # FastAPI TestClient request/response tests
    └── contract/                # Generated OpenAPI schema vs. contracts/member-eligibility.yaml
```

## Supported Scenarios

A single endpoint, `POST /api/v1/eligibility/verify`, implemented exactly as
defined in `contracts/member-eligibility.yaml`:

| Scenario | Business Rule | HTTP Status | `eligibilityStatus` |
|---|---|---|---|
| Member not found | BR-002 | 404 | _(no eligibilityStatus; error response)_ |
| Coverage record missing | BR-006 | 200 | `UNABLE_TO_DETERMINE` |
| Today before effective date | BR-004 | 200 | `INELIGIBLE` |
| Today after termination date | BR-005 | 200 | `INELIGIBLE` |
| Today within effective/termination range (inclusive) | BR-003 | 200 | `ELIGIBLE` |
| `memberId` missing or empty | BR-001 | 400 | _(validation error)_ |
| Unexpected failure | — | 500 | _(error response)_ |

Synthetic data in `app/data/` reuses the exact `memberId` and `memberName`
values from the OpenAPI contract's own examples (`M100234`, `M100455`,
`M100678`, `M100999`) so a manual call against a locally running server
reproduces the contract's documented examples exactly.

## Known Limitations / Out of Scope

Per `docs/01-business-discovery.md` and `docs/02-functional-requirements.md`,
Version 1 intentionally excludes: claims, benefits, deductibles, prior
authorization, provider search, multiple coverage records per member,
historical eligibility, authentication/authorization, and any database
(JSON files are the only data source). These are not gaps in this
implementation — they are out of scope by design.

## Validation Status

- `ruff check .` — passes.
- `pytest` — all unit, integration, and contract-alignment tests pass (see
  the traceability matrix in the implementation report for full coverage).
- Manual verification: all four contract example scenarios plus the 404/400
  error paths were exercised against a running instance and matched the
  contract's documented examples exactly (including reason text and error
  schema shape).
