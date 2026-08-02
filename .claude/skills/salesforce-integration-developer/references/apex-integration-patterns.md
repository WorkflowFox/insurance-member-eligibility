# Apex Integration Patterns

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference defines how Apex should be structured when its job is to
call an external REST API on behalf of a Lightning Web Component. It is
project-agnostic; the exact endpoints, fields, and payloads always come
from the project's OpenAPI contract.

---

## Layering

Use three distinct kinds of Apex class, and keep each one to its
responsibility:

1. **Wrapper models** — plain classes representing request and response
   payloads, matching the OpenAPI schema field-for-field.
2. **Integration service** — one class per API resource, responsible for
   building the `HttpRequest`, executing the callout, and deserializing
   the response into a wrapper model.
3. **Controller (`@AuraEnabled` methods)** — the thin entry point the LWC
   calls. It delegates to the integration service and translates
   exceptions into a shape the LWC can present. It does not itself build
   HTTP requests.

Do not collapse these into a single class "for simplicity" — mixing HTTP
plumbing, deserialization, and the `@AuraEnabled` surface in one place
makes the class hard to test and easy to accidentally load with business
logic.

---

## Wrapper Models

- Match the contract's schema names and field names as closely as Apex
  naming conventions allow (PascalCase classes, camelCase fields).
- Mark fields `public` and use `@AuraEnabled` only on properties the LWC
  actually reads or writes.
- Use `JSON.deserialize(jsonString, WrapperClass.class)` (or
  `JSON.deserializeStrict` when the contract's shape is fully known and
  extra/missing fields should raise an error) rather than manually walking
  a `Map<String, Object>` — manual traversal is more error-prone and
  harder to keep in sync with the contract.
- Preserve the contract's nullable/required distinctions: do not default a
  field to a sentinel value (e.g., an empty string for a null date) to
  paper over a null the LWC should actually handle as "unknown."
- Do not add fields to a wrapper that the contract does not define, even
  if they seem like they would be convenient for the UI — compute
  presentation-only derived values in the LWC or a JS utility, not in the
  wrapper model.

---

## Building the Callout

- Reference the endpoint host exclusively through a Named Credential
  (`callout:My_Named_Credential/path`) — never hardcode a URL, API key, or
  bearer token in Apex. See
  [named-credentials.md](named-credentials.md).
- Set `Content-Type` and `Accept` headers explicitly rather than relying on
  defaults, matching what the contract's operation declares.
- Set an explicit timeout (`setTimeout`) appropriate to the endpoint,
  rather than relying on the platform default, when the implementation
  design specifies latency expectations.
- Serialize the request body with `JSON.serialize(wrapperInstance)`
  (`JSON.serialize(obj, true)` to suppress nulls, if the contract treats
  absent and null fields differently) rather than building a JSON string
  by hand.

---

## Executing the Callout

- Use a single shared `Http` invocation pattern (a small private/protected
  helper reused by every integration service) so retry, timeout, and
  logging behavior stay consistent across services.
- Wrap the `Http.send()` call so that `CalloutException` (e.g., timeout,
  unreachable endpoint) is caught at the integration-service boundary and
  translated into the same error shape used for HTTP-level errors — see
  [apex-error-handling.md](apex-error-handling.md).
- Do not call `Http.send()` directly from a controller method or from the
  LWC-facing `@AuraEnabled` method — always go through the integration
  service.

---

## Bulkification and Governor Limits

- Design each `@AuraEnabled` method to make the number of callouts the UI
  interaction actually requires — typically one per user action. Do not
  issue a callout inside a loop; if multiple resources must be fetched,
  either batch them into a single contract-defined endpoint (if one
  exists) or make the LWC issue calls in parallel via `Promise.all`
  against multiple imperative Apex calls, respecting the 100-callout
  limit.
- Be aware of the 120-second cumulative Apex callout timeout per
  transaction and the 100-callout-per-transaction limit; do not design a
  flow that would approach either without the implementation design
  explicitly calling for it.
- Avoid SOQL or DML inside a class whose job is HTTP integration unless
  the implementation design explicitly requires persisting or looking up
  Salesforce data as part of the flow — introducing it speculatively adds
  both complexity and governor-limit exposure that the specification did
  not ask for.

---

## Deserialization Safety

- Validate that a deserialized response is non-null and has the fields the
  calling code depends on before accessing them, rather than assuming the
  external API always returns a fully-populated object.
- When the contract defines a discriminated response (e.g., different
  shapes for different status codes), branch on the HTTP status code
  first, then deserialize into the wrapper type that status implies — do
  not attempt to deserialize every response into the same "happy path"
  wrapper.

---

## Reuse

- Put the shared HTTP-invocation helper, along with any shared header or
  timeout configuration, in one utility class reused by every integration
  service in the project — do not copy the same `Http`/`HttpRequest`
  boilerplate into each service.
- Reuse wrapper models across the controller and integration service; do
  not create a second, near-identical DTO for the `@AuraEnabled` boundary
  unless the contract's shape genuinely cannot be exposed to Lightning
  Web Components as-is (e.g., a type `@AuraEnabled` does not support).
