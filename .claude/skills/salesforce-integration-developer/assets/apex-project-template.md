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
            ├── <Resource>Request.cls           # Apex wrapper: request schema
            ├── <Resource>Request.cls-meta.xml
            ├── <Resource>Response.cls          # Apex wrapper: response schema
            ├── <Resource>Response.cls-meta.xml
            ├── <Resource>Error.cls             # Apex wrapper: contract error schema
            ├── <Resource>Error.cls-meta.xml
            ├── <Resource>IntegrationService.cls    # Builds/executes the callout, deserializes
            ├── <Resource>IntegrationService.cls-meta.xml
            ├── <Resource>Controller.cls        # @AuraEnabled entry point for the LWC
            ├── <Resource>Controller.cls-meta.xml
            ├── IntegrationException.cls        # Shared exception type for translated failures
            ├── IntegrationException.cls-meta.xml
            ├── HttpCalloutHelper.cls           # Shared callout execution/logging helper (reused
            ├── HttpCalloutHelper.cls-meta.xml  #   across every integration service)
            └── tests/
                ├── <Resource>IntegrationServiceTest.cls
                ├── <Resource>IntegrationServiceTest.cls-meta.xml
                ├── <Resource>ControllerTest.cls
                ├── <Resource>ControllerTest.cls-meta.xml
                ├── <Resource>HttpCalloutMock.cls   # Implements HttpCalloutMock for this resource
                └── <Resource>HttpCalloutMock.cls-meta.xml
```

---

## Notes

- Every class above must have a documented responsibility before it is
  created — do not scaffold `HttpCalloutHelper` or `IntegrationException`
  as project-specific if the project's Salesforce codebase already
  provides an equivalent shared utility; reuse the existing one instead.
- `tests/` here is a documentation convenience for this template; place
  Apex test classes according to the target org's existing convention if
  one is already established (many orgs keep test classes alongside
  production classes in the same `classes/` folder rather than a
  subfolder).
- Do not add a `triggers/`, `objects/`, or `flows/` directory unless the
  implementation design explicitly requires persistence, automation, or
  new fields/objects — an HTTP-integration-only client typically needs
  none of these.
- `<Resource>Error.cls` is only needed if the contract defines a
  structured error response body; if errors are communicated purely via
  HTTP status code with no body schema, omit this class.
