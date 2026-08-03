# External Credential Configuration Guide

## Not required for Version 1

An External Credential is **not needed** to run this integration today.
`docs/05-api-design.md` explicitly states Version 1 "assumes trusted
internal communication," and `contracts/member-eligibility.yaml` defines
no `securitySchemes`. The Named Credential configured in
[named-credential-guide.md](named-credential-guide.md) uses
`Authentication Protocol: No Authentication` and needs no External
Credential reference.

This guide is forward-looking preparation for when a future contract
version adds authentication, per `docs/05-api-design.md` ("Future
Evolution": OAuth 2.0, JWT, Mutual TLS, API Gateway) and
`docs/03-architecture.md` ("Future Evolution": "Authentication and
Authorization"). **Do not configure an External Credential from this
guide today** — only once a new contract version documents a concrete
authentication scheme, per that version's own requirements. Configuring
one now would mean inventing an authentication mechanism the current
specifications do not describe, which the
`salesforce-integration-developer` skill's role explicitly disallows.

## When a Future Contract Adds Authentication

The steps below illustrate the separated External Credential model using
OAuth 2.0 Client Credentials as a representative example. Replace the
authentication protocol with whatever the future contract's
`securitySchemes` entry actually specifies — do not assume Client
Credentials is the eventual choice.

1. **Setup → Named Credentials → External Credentials → New.**
2. **Label / Name:** e.g. `Member_Eligibility_Service_Auth`.
3. **Authentication Protocol:** match the contract's documented scheme
   (OAuth 2.0 Client Credentials / JWT Bearer / Browser Flow / custom
   header, etc.).
4. **Principal:** Named Principal for service-to-service calls (all
   Salesforce users share one backend identity), unless the functional
   requirements call for per-user identity to flow through to the
   backend, in which case use a Per-User Principal.
5. Store the client ID/secret (or certificate, for JWT Bearer) in the
   principal's protected credential fields — never in Apex, an
   unprotected custom label, or a hardcoded constant.
6. Update the `Member_Eligibility_Service` Named Credential
   (`named-credential-guide.md`) to reference this External Credential
   and change its Authentication Protocol away from `No Authentication`.
7. Enable **Generate Authorization Header** on the Named Credential so
   Apex does not need to set the auth header manually.
8. Update the Permission Set (`permission-set-guide.md`) to grant access
   to the new External Credential's principal.

No Apex code change is required for this transition — Apex already
references the callout only via `callout:Member_Eligibility_Service/...`
and never builds authentication headers itself
(`MemberEligibilityIntegrationService.cls`).
