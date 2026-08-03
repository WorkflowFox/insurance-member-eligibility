# Named Credential Configuration Guide

Configuration required to let Apex call the Member Eligibility Service
(`contracts/member-eligibility.yaml`) via `callout:Member_Eligibility_Service`.

## Why "No Authentication"

`docs/05-api-design.md` ("Security") states:

> Version 1 assumes trusted internal communication.

The OpenAPI contract defines no `security` requirement and no
`securitySchemes`. Per the skill's rule against guessing authentication
requirements, this guide configures the Named Credential with
**Authentication Protocol: No Authentication** rather than inventing an
API key or OAuth scheme the specifications do not describe. See
[external-credential-guide.md](external-credential-guide.md) for how to
add real authentication when a future contract version requires it.

## Steps

1. **Setup → Named Credentials → New Legacy Named Credential.**
   (The legacy, single-record form is sufficient here because there is no
   authentication to separate into an External Credential. If your org
   standardizes on the newer Named Credential + External Credential model
   for all callouts regardless of auth, use **New Named Credential**
   instead and skip step 4 below — no External Credential reference is
   required.)
2. **Label / Name:** `Member Eligibility Service` /
   `Member_Eligibility_Service`. Apex references this exact
   `DeveloperName` (see `MemberEligibilityIntegrationService.cls`).
3. **URL:** the Member Eligibility Service's base URL for the target
   environment (e.g. `http://localhost:8000` for local backend
   development, per `contracts/member-eligibility.yaml` `servers`). This
   is a placeholder — **replace it with the deployed backend's HTTPS URL
   before using this Named Credential outside local development.** No
   other environment URL is documented in the current specifications.
4. **Authentication Protocol:** `No Authentication`.
5. **Generate Authorization Header:** leave unchecked (there is no header
   to generate).
6. **Allow Merge Fields in HTTP Header / Body:** leave unchecked — not
   required by the contract.
7. Save.

## What Apex References

```apex
request.setEndpoint('callout:Member_Eligibility_Service/api/v1/eligibility/verify');
```

The Named Credential supplies the host; Apex supplies only the resource
path. See `MemberEligibilityIntegrationService.cls`.

## Access

Grant access to this Named Credential only through the Permission Set
described in [permission-set-guide.md](permission-set-guide.md) — do not
grant it via a profile unless your org's standard differs and that
decision is documented separately.

## Multiple Environments

Configure one Named Credential per org/sandbox, each pointing at that
environment's Member Eligibility Service URL. Apex code does not change
between environments — only this record's URL does.
