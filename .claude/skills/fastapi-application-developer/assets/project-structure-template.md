# Project Structure Template

A generic, reusable FastAPI project structure. Adapt directory and module
names to the specific application's domain — do not copy any
project-specific filenames from an example verbatim.

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # create_app() factory, router registration, exception handlers
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py      # Depends() providers wiring services/repositories into routes
│   │   └── <resource>.py        # One router module per API resource (thin routes only)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── requests.py          # Pydantic request models (match OpenAPI request schemas)
│   │   ├── responses.py         # Pydantic response models (match OpenAPI response schemas)
│   │   └── errors.py            # Pydantic error/response models (match OpenAPI error schema)
│   ├── services/
│   │   ├── __init__.py
│   │   └── <domain>_service.py  # Business rules, orchestration, domain exceptions
│   ├── repositories/
│   │   ├── __init__.py
│   │   └── <entity>_repository.py  # Data retrieval only, no business decisions
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Settings (Pydantic BaseSettings)
│   │   ├── exceptions.py        # Domain exception types shared across services
│   │   └── logging.py           # Logging configuration (no sensitive-data logging)
│   └── data/
│       └── ...                  # Only the data source(s) the specifications require
│                                 # (e.g., synthetic JSON fixtures) — no database unless required
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Shared fixtures (test client, fake repositories)
│   ├── unit/
│   │   └── test_<domain>_service.py
│   ├── integration/
│   │   └── test_<resource>_api.py
│   └── contract/
│       └── test_contract_alignment.py   # Optional: verifies responses match the OpenAPI contract
├── pyproject.toml               # Dependencies, Ruff config, Pytest config
├── .env.example                 # Only if the specifications require configurable secrets/settings
└── README.md                    # Install, run, test instructions for this application
```

---

## Notes

- Every directory above must have a documented responsibility before it is
  created — do not scaffold empty layers "for completeness" if a given
  project's specifications do not need them (e.g., omit `repositories/`
  entirely if there is truly nothing to retrieve).
- `tests/contract/` is optional and should only be created when a practical
  automated check against the OpenAPI contract is feasible (e.g., using an
  installed schema validator) — do not fabricate a contract test that does
  not actually validate against the contract file.
- `app/data/` holds only the data source(s) the implementation design
  specifies. Do not introduce a database layer here unless the
  specifications call for one.
