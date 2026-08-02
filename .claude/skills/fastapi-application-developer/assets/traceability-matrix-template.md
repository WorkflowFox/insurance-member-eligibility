# Traceability Matrix Template

Use this table to map every supported requirement to the specification it
came from, the code that implements it, the test that verifies it, and its
current status. Populate one row per requirement, business rule, endpoint,
or acceptance criterion — do not group multiple requirements into one row.

| Requirement ID | Source | Implementation Artifact | Test | Status |
|---|---|---|---|---|
| _e.g., BR-001_ | _e.g., 02-functional-requirements.md_ | _e.g., app/models/requests.py::ResourceIdRequest_ | _e.g., tests/unit/test_request_validation.py::test_resource_id_required_ | _Implemented / Partial / Not Started / Blocked_ |

---

## Column Definitions

- **Requirement ID** — the identifier used by the source specification
  (business rule ID, functional capability ID, API design decision ID, or
  OpenAPI operationId/schema name). If the source document has no formal
  ID, use a short, stable, quoted reference to the relevant section.
- **Source** — the specific specification file (and section, if useful)
  the requirement came from.
- **Implementation Artifact** — the concrete file and symbol
  (module::function/class) that implements the requirement. Leave blank
  only if the status is "Not Started."
- **Test** — the concrete test file and test name that verifies the
  requirement. Leave blank only if the status is "Not Started" or "Blocked"
  — an "Implemented" status without a corresponding test is not permitted.
- **Status** — one of:
  - `Implemented` — code exists, is tested, and tests pass.
  - `Partial` — code exists but coverage or behavior is incomplete; explain
    the gap in a footnote.
  - `Not Started` — no implementation yet.
  - `Blocked` — cannot proceed due to a missing or contradictory
    specification; explain the blocker in a footnote.

---

## Usage Notes

- Build this matrix incrementally during implementation (Step 2 of the
  skill's workflow creates the initial plan; Step 11 finalizes it as a
  validation artifact).
- Every row with status `Implemented` must be independently verifiable: the
  named test must exist and must pass.
- Do not delete rows for requirements that turned out to be unsupported by
  the available specifications — mark them `Blocked` with a footnote
  explaining what is missing, so the gap is visible rather than silently
  dropped.
