# 03 — FastAPI Backend Generation

## Summary

The Member Eligibility Verification FastAPI backend is complete under `backend/`, built strictly from the six approved specifications. Both validation commands pass:

- `ruff check .` → **All checks passed!**
- `pytest` → **19 passed** (6 unit, 7 integration, 6 contract-alignment)

## Files Created

```text
backend/
├── pyproject.toml, uv.lock, README.md
├── app/
│   ├── main.py                          — create_app() factory, correlation-ID middleware, exception handlers, OpenAPI post-processing
│   ├── api/dependencies.py, eligibility.py
│   ├── models/domain.py, requests.py, responses.py, errors.py
│   ├── services/eligibility_service.py  — all business rules (BR-001–BR-006)
│   ├── repositories/member_repository.py, coverage_repository.py
│   ├── core/config.py, exceptions.py, logging.py
│   └── data/members.json, coverage.json
└── tests/
    ├── unit/test_eligibility_service.py
    ├── integration/test_eligibility_api.py
    └── contract/test_contract_alignment.py
```

## Traceability

| Requirement | Source | Implementation | Test | Status |
|---|---|---|---|---|
| BR-001 (memberId required) | 02-functional-requirements.md | `models/requests.py::EligibilityVerificationRequest` | `integration/test_eligibility_api.py::test_verify_eligibility_returns_400_for_missing_member_id` | Implemented |
| BR-002 (member not found) | 02-functional-requirements.md | `core/exceptions.py::MemberNotFoundError`, `main.py::handle_member_not_found` | `unit/…::test_br002_unknown_member_raises_not_found`, `integration/…::test_…returns_404…` | Implemented |
| BR-003 (eligible, inclusive boundaries) | 02-functional-requirements.md | `services/eligibility_service.py::_evaluate_for_member` | `unit/…::test_br003_*` (incl. boundary dates) | Implemented |
| BR-004 (not yet effective) | 02-functional-requirements.md | same | `unit/…::test_br004_…` | Implemented |
| BR-005 (terminated) | 02-functional-requirements.md | same | `unit/…::test_br005_…` | Implemented |
| BR-006 (unable to determine) | 02-functional-requirements.md | same | `unit/…::test_br006_…` | Implemented |
| `POST /api/v1/eligibility/verify` (all shapes/status codes) | contracts/member-eligibility.yaml | `api/eligibility.py`, `models/*` | `contract/test_contract_alignment.py` (6 tests) | Implemented |
| 500 unexpected failure | 05-api-design.md | `main.py::handle_unexpected_error` | `integration/…::test_…returns_500…` | Implemented |

## Assumptions

- `memberName` = `"{firstName} {lastName}"` — the contract requires this field but the domain model docs don't specify how it's derived.
- Synthetic data reuses the exact member IDs/names from the contract's own examples, so manual calls reproduce the contract's documented examples exactly.

## Resolved Discrepancy (Not a Gap)

`05-api-design.md`'s response table lists "Member Not Found" as an `eligibilityStatus` value, but `contracts/member-eligibility.yaml` explicitly overrides this with a 3-value enum and HTTP 404 instead. Implemented per the contract, per the skill's rule that the OpenAPI contract is authoritative.

## Bugs the Contract-Alignment Test Caught and Fixed

1. `coverageType`/`effectiveDate`/`terminationDate` were modeled as required-but-nullable; the contract only requires 5 of 8 fields — added `= None` defaults.
2. FastAPI auto-documented a `422` response that can never actually occur (our handler converts validation failures to `400`) — added a schema post-processor in `main.py` to strip it, keeping `/openapi.json` truthful to runtime behavior.

## Unresolved Gaps

None. No Salesforce files exist in this repo, so none were touched.
