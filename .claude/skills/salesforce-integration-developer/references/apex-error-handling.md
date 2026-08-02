# Apex Error Handling

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference defines how an Apex integration client should distinguish
and respond to different categories of failure when calling an external
REST API, and how those failures should surface to the Lightning Web
Component. It is project-agnostic; the exact error codes, messages, and
schema always come from the project's OpenAPI contract.

---

## Categories of Failure

An Apex integration client should distinguish between four categories:

1. **Transport failures** — the callout itself could not complete
   (timeout, DNS failure, unreachable host). These surface as Apex
   `CalloutException`.
2. **Contract-defined error responses** — the callout completed and the
   backend returned a non-2xx status the contract documents (e.g., a
   validation or not-found error). These are expected, handled outcomes,
   not bugs.
3. **Business outcomes** — a 2xx response whose body communicates a
   non-success-but-valid business result (e.g., a "declined" or "not
   applicable" status). These are **not** errors from Salesforce's
   perspective — deserialize and pass them through unchanged; the LWC
   presents them as data, not as a failure state.
4. **Unexpected responses** — a status code or payload shape the contract
   does not document. Handle defensively, but do not silently coerce an
   unexpected shape into the "success" wrapper.

Only categories 1, 2, and 4 should result in the `@AuraEnabled` method
throwing (or otherwise signaling failure) back to the LWC. Category 3 is a
normal return value.

---

## Transport Failures

- Catch `CalloutException` at the integration-service boundary, not deep
  inside shared HTTP utility code, so calling code has one consistent
  place to look for this handling.
- Translate it into the same internal error representation used for
  contract-defined error responses (see below), so the controller and LWC
  do not need to distinguish "the network failed" from "the backend
  rejected the request" unless the functional requirements specifically
  call for different user-facing messages for each.
- Log the underlying exception message and the target endpoint (Named
  Credential name, not raw URL/credentials) for diagnosis. Do not log
  request or response bodies that may contain sensitive data.

---

## Contract-Defined Error Responses

- Branch on the HTTP status code returned by `HttpResponse.getStatusCode()`
  and deserialize the body into the error shape the contract defines for
  that status, if one exists.
- Represent this internally as a custom exception type (e.g.,
  `IntegrationException`) carrying the status code and a message, rather
  than propagating a raw `JSONException` or generic `Exception` up to the
  controller.
- Do not retry a contract-defined 4xx error automatically (the request was
  rejected as invalid — retrying without changing it will fail again).
  Only apply retry logic to transient failures (timeouts, 5xx) if the
  implementation design explicitly calls for retry behavior.

---

## Business Outcomes

- Deserialize a 2xx response into the contract's success wrapper and
  return it as-is, even if the body's status field represents a
  "negative" business result. Do not throw an exception, and do not
  transform the value, to represent a business outcome the contract
  models as a normal response.
- The `@AuraEnabled` method's return type for this case is the same
  success wrapper used for any other 2xx result — there is no separate
  "business error" return path.

---

## Unexpected Responses

- If the status code or payload shape does not match anything the
  contract documents, treat it as an unexpected failure: catch the
  deserialization exception (or explicitly branch on "unrecognized
  status"), log the details internally, and translate it into the same
  internal error representation used for other error categories.
- Never let a raw `JSONException`, `NullPointerException`, or stack trace
  propagate to the `@AuraEnabled` boundary — the LWC would receive an
  unhelpful, potentially sensitive error message.

---

## Surfacing Errors to the Lightning Web Component

- `@AuraEnabled(cacheable=false)` methods that can fail should throw an
  `AuraHandledException` with a clear, user-appropriate message (call
  `setMessage()` before throwing, since `AuraHandledException`'s message
  is not directly settable via constructor in older API versions — always
  verify against the org's API version).
- Do not expose internal exception messages, stack traces, or the
  backend's raw error body directly to the user — map the internal error
  representation to a message appropriate for the UI, per the functional
  requirements.
- The LWC must catch the rejected promise from every Apex call and render
  the error state defined in
  [ui-design-guidelines.md](ui-design-guidelines.md) — it must never leave
  the user looking at a loading spinner or a blank component after a
  failure.

---

## Logging

- Log enough context to diagnose a failure later (Named Credential name,
  HTTP status code, a correlation identifier if the contract defines one)
  without logging request/response bodies that may contain sensitive
  member or customer data.
- Use a single, consistent logging approach across all integration
  services (e.g., a shared logging utility or `System.debug` pattern
  agreed with the project's architecture) rather than ad hoc logging
  calls scattered per service.
