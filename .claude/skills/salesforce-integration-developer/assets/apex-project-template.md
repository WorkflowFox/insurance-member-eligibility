# Apex Project Template

A generic, reusable Apex integration-class structure. Adapt directory and
class names to the specific application's domain and the OpenAPI
contract's resource names — do not copy any project-specific filenames
from an example verbatim.

```text
force-app/
└── main/
    └── default/
        └── classes/
            ├── <Resource>Request.cls              # Apex wrapper: request schema
            ├── <Resource>Request.cls-meta.xml
            ├── <Resource>Response.cls             # Apex wrapper: response schema
            ├── <Resource>Response.cls-meta.xml
            ├── <Resource>Error.cls                # Apex wrapper: contract error schema
            ├── <Resource>Error.cls-meta.xml
            ├── <Resource>IntegrationService.cls    # Builds/executes the callout, deserializes
            ├── <Resource>IntegrationService.cls-meta.xml
            ├── <Resource>Controller.cls           # @AuraEnabled entry point for the LWC
            ├── <Resource>Controller.cls-meta.xml
            ├── IntegrationException.cls           # Shared exception type for translated failures
            ├── IntegrationException.cls-meta.xml
            ├── HttpCalloutHelper.cls              # Shared callout execution/logging helper — only
            ├── HttpCalloutHelper.cls-meta.xml     #   once a second integration service needs it (see Notes)
            ├── <Resource>IntegrationServiceTest.cls
            ├── <Resource>IntegrationServiceTest.cls-meta.xml
            ├── <Resource>ControllerTest.cls
            ├── <Resource>ControllerTest.cls-meta.xml
            ├── <Resource>HttpCalloutMock.cls      # Implements HttpCalloutMock for this resource
            └── <Resource>HttpCalloutMock.cls-meta.xml
```

---

## Notes

- **`classes/` must stay flat — no subfolders.** Unlike an LWC bundle
  (which is a directory-based metadata type), the `ApexClass` metadata
  type does not support nested directories in SFDX source format; a
  metadata deploy will not resolve classes placed in a `classes/tests/`
  or similar subfolder. Distinguish test classes from production classes
  by naming convention (a `Test` suffix, as shown above), not by
  location.
- Every class above must have a documented responsibility before it is
  created — do not scaffold `HttpCalloutHelper` as project-specific
  boilerplate for a *first* integration service; it earns its place once
  a *second* API resource needs the same callout-construction logic (see
  [../references/apex-integration-patterns.md](../references/apex-integration-patterns.md)
  "Reuse"). For a single-endpoint V1, keep that logic inside
  `<Resource>IntegrationService.cls` instead of introducing a one-caller
  abstraction — and reuse the existing helper instead of creating a
  second one if the project's Salesforce codebase already has an
  equivalent shared utility.
- Do not add a `triggers/`, `objects/`, or `flows/` directory unless the
  implementation design explicitly requires persistence, automation, or
  new fields/objects — an HTTP-integration-only client typically needs
  none of these.
- `<Resource>Error.cls` is only needed if the contract defines a
  structured error response body. If the contract defines both a success
  error schema and a validation-error schema that are structurally
  identical (e.g., a validation error schema defined as `allOf` the base
  error schema with no additional properties), reuse the same wrapper
  class for both rather than generating a duplicate.
