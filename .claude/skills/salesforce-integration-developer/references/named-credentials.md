# Named Credentials

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference defines how outbound authentication to an enterprise REST
API should be configured on the Salesforce side. It is project-agnostic;
the exact host, authentication scheme, and credential values always come
from the project's architecture and API design documents — this skill
documents the *configuration steps*, it does not create org configuration
directly (Named Credentials are typically set up declaratively by an
admin or via a deployed metadata component, not written as Apex).

---

## Why Named Credentials

- A Named Credential decouples Apex from the target endpoint's URL and
  authentication details. Apex references it by name
  (`callout:My_Named_Credential/...`); the platform resolves the actual
  host and injects the authentication headers.
- This is the only acceptable way to reach an external endpoint from Apex
  in a WorkflowFox project. Hardcoding a URL, API key, or bearer token in
  Apex source is never acceptable — it is unrevocable without a
  deployment, visible to anyone with code access, and breaks environment
  promotion (the same code would need to change between sandboxes and
  production).

---

## Choosing Legacy vs. External Credentials

Salesforce supports two models:

- **Legacy Named Credential (URL + authentication in one record)** —
  simplest to configure, appropriate for a single endpoint with a single
  authentication scheme (e.g., a static API key or Basic auth) and no
  need to reuse the same authentication across multiple endpoints.
- **Named Credential + External Credential (separated model)** —
  separates the endpoint (Named Credential) from the authentication
  configuration (External Credential), and supports OAuth 2.0 flows
  (client credentials, JWT bearer, browser flow), per-principal
  credentials, and reuse of one authentication configuration across
  multiple Named Credentials.

Default to the separated External Credential model for any OAuth-based
API, or when the architecture document indicates the same backend will be
called from multiple Named Credentials. Use a legacy Named Credential only
for a simple static-key or Basic-auth endpoint where the separated model
would add configuration overhead without benefit.

**If the OpenAPI contract defines no `security` requirement and no
`securitySchemes`** — a realistic, non-edge-case scenario for an internal
or early-stage service, not something to treat as an oversight — configure
the Named Credential's Authentication Protocol as **No Authentication**.
Do not invent an OAuth flow, JWT scheme, API key header, or any External
Credential principal the contract and architecture documents don't
describe; guessing an authentication mechanism is explicitly against this
skill's role boundaries (see [SKILL.md](../SKILL.md) Section 1). If the
architecture documents mention authentication as a *future* enhancement,
it is acceptable to write a separate, clearly-labeled forward-looking
guide for that future state — but never configure it as if it were a
current requirement.

---

## Configuration Steps (No Authentication)

1. **Setup → Named Credentials → New Legacy Named Credential** (or New
   Named Credential — no External Credential is needed since there is no
   authentication to separate out).
2. **URL**: the API's base URL as defined in the OpenAPI contract's
   `servers` entry for the target environment. Treat this as a
   placeholder that must be replaced with the real deployed backend's
   HTTPS URL before non-local use if the contract only documents a local
   development server.
3. **Authentication Protocol**: `No Authentication`.
4. **Generate Authorization Header**: leave unchecked — there is no
   header to generate.
5. If a future contract version is expected to add authentication,
   document that as separate, explicitly-future-labeled guidance (see
   "Configuration Steps (OAuth 2.0)" below for the shape such a guide
   should take) rather than configuring it now.

---

## Configuration Steps (Static API Key / Basic Auth)

1. **Setup → Named Credentials → New Legacy Named Credential** (or New
   Named Credential, depending on org configuration).
2. Set **URL** to the API's base URL as defined in the OpenAPI contract's
   `servers` entry for the target environment.
3. Set **Identity Type** to "Named Principal" (all users share one
   credential) unless the functional requirements call for per-user
   authentication.
4. Set **Authentication Protocol** to match the scheme (e.g., "Password
   Authentication" for Basic auth, or a custom header for an API key —
   configure via a custom header under "Generate Authorization Header" if
   the API key is not a standard scheme Salesforce supports natively).
5. Enable **Generate Authorization Header** so Apex does not need to set
   the auth header manually.
6. Leave **Allow Merge Fields in HTTP Header** / **Allow Merge Fields in
   HTTP Body** off unless a specific merge-field use case is documented.

---

## Configuration Steps (OAuth 2.0)

1. **Setup → Named Credentials → External Credentials → New.** Choose the
   authentication protocol matching the API's documented OAuth flow
   (Client Credentials, JWT Bearer, or Browser Flow per the architecture
   document).
2. Configure the **Principal** (Named Principal for a service-to-service
   integration; Per-User Principal only if the functional requirements
   require individual user identity to flow through to the backend).
3. Store the client ID/secret (or certificate, for JWT Bearer) as
   protected custom metadata or in the External Credential's principal
   configuration — never in Apex, a custom label marked as unprotected, or
   a hardcoded constant.
4. **Setup → Named Credentials → New Named Credential.** Set **URL** to
   the API's base URL, and reference the External Credential created
   above.
5. Enable **Generate Authorization Header.**

---

## Permissions

- Grant access to the Named Credential (and, for the separated model, to
  the External Credential's principal) only through a Permission Set
  scoped to the users/integration user who need it — do not grant it
  broadly through a profile unless the architecture document specifies
  that scope.
- Document the exact Permission Set name expected, so the implementation
  summary produced in Step 10 of the workflow can tell an admin exactly
  what to assign.

---

## What Apex Should Reference

- Apex callouts reference the Named Credential by its `DeveloperName`
  only: `new HttpRequest().setEndpoint('callout:My_Named_Credential/v1/resource')`.
- Do not read the Named Credential's URL or credentials into Apex via
  `Named_Credential__mdt` or similar custom metadata as a workaround —
  the platform callout syntax already handles this.
- If the contract requires a header the Named Credential's "Generate
  Authorization Header" does not cover (e.g., a correlation ID, an
  API-version header), set that specific header explicitly in the
  integration service — do not route it through the Named Credential
  configuration.

---

## Multiple Environments

- Configure one Named Credential per Salesforce org/sandbox pointing at
  that environment's corresponding backend URL (e.g., sandbox Named
  Credential points at a staging API, production Named Credential points
  at the production API). Apex code itself does not change between
  environments — only the Named Credential's URL and stored credential
  values do.
- Never embed an environment check (e.g., `if (isSandbox()) { ... }`) in
  Apex to select between endpoints — that is exactly the problem Named
  Credentials solve.
