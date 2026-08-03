# Salesforce Testing

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference defines how Apex and Lightning Web Component tests should
be structured for a Salesforce client that integrates with an external
REST API. It is project-agnostic; the exact payloads and scenarios always
come from the project's OpenAPI contract and functional requirements.

---

## Apex Testing: Mocking Callouts

- Never allow a test to perform a real HTTP callout. Implement
  `HttpCalloutMock` (or `Test.setMock` with a class implementing it) for
  every integration service under test, and call `Test.setMock(HttpCalloutMock.class, mockInstance)`
  before invoking the code under test.
- Build mock responses from representative payloads derived from the
  OpenAPI contract's examples/schemas — do not invent response shapes the
  contract does not describe.
- Prefer one reusable mock class per API resource (implementing
  `HttpCalloutMock`, returning different canned responses based on the
  requested endpoint or a constructor parameter) over duplicating mock
  logic in every test method.

---

## Apex Testing: Scenarios to Cover

For each integration service, cover at minimum:

1. **Successful callout** — mock returns a contract-valid success
   response; assert the wrapper model is populated correctly and the
   `@AuraEnabled` method returns it.
2. **Contract-defined error responses** — mock returns each documented
   non-2xx status the contract specifies for the operation; assert the
   error is translated per
   [apex-error-handling.md](apex-error-handling.md), not silently
   swallowed.
3. **Unexpected/malformed responses** — mock returns a response the
   contract does not describe (unexpected status code, malformed JSON);
   assert the code fails gracefully rather than throwing an unhandled
   exception that surfaces a stack trace to the user.
4. **Timeout / callout exception** — simulate a `CalloutException` (a mock
   that throws) and assert it is caught and translated consistently with
   the other error paths.

Do not write an Apex test that asserts on a business decision (e.g., "the
member is eligible") — that assertion belongs in the backend service's own
test suite. Apex tests here assert that Salesforce correctly transports,
deserializes, and presents whatever the mocked backend returned.

---

## Apex Testing: Coverage and Structure

- Use `@isTest` classes and methods, with `@testSetup` for shared test
  data only when actually needed (a client with no SOQL/DML dependencies
  often needs no test data at all beyond mock HTTP responses).
- Name test methods for the scenario, not the method under test alone
  (e.g., `testGetEligibility_ReturnsWrapper_WhenBackendReturns200`, not
  `testGetEligibility1`).
- Assert on specific field values from the deserialized wrapper, not just
  "no exception was thrown" — a test that only checks for absence of an
  exception will not catch a field-mapping regression.
- Target meaningful coverage of every branch in the integration service
  and controller (success, each documented error status, and the
  unexpected/timeout path) rather than chasing an org-wide percentage
  number with superficial tests.

---

## Lightning Web Component Testing: Setup

- Use the Lightning Web Components Jest testing framework
  (`sfdx-lwc-jest`). Import the component under test and mock the
  `@salesforce/apex/...` module with `jest.mock(...)`, resolving or
  rejecting a promise to simulate the Apex response.
- Reset mocks between tests (`jest.clearAllMocks()` or equivalent in
  `afterEach`) so one test's mocked resolution/rejection cannot leak into
  another.
- Use `createElement` from `lwc` to instantiate the component in each
  test, and `document.body.appendChild` to attach it, matching the
  standard LWC Jest pattern.
- Exclude `__tests__/` from metadata deployment with a `.forceignore`
  entry (`**/__tests__/**`). Without it, a metadata deploy will try to
  compile Jest test files as if they were component source and fail on
  Jest-only syntax (e.g., `import { createElement } from 'lwc'`) — see
  [assets/lwc-project-template.md](../assets/lwc-project-template.md).
- Component code that gates on a base-component validation method (e.g.,
  `reportValidity()`) must check for an explicit `false`, not plain
  falsiness — `sfdx-lwc-jest`'s stubs return `undefined` from these
  methods, and a falsy-only check silently blocks every test run. See
  [local-tooling-and-environment.md](local-tooling-and-environment.md)
  and [ui-design-guidelines.md](ui-design-guidelines.md).
- If a full local Jest run hangs with no output, check whether the
  project's working directory is inside an actively-synchronized cloud
  storage folder (iCloud Drive, OneDrive, Dropbox) before assuming a code
  defect — see
  [local-tooling-and-environment.md](local-tooling-and-environment.md).
- If Jest fails to parse with `SyntaxError: Unexpected token 'export'`
  inside `@lwc/engine-dom`, this is a known `sfdx-lwc-jest` resolver/ESM
  incompatibility, not a project defect — see
  [local-tooling-and-environment.md](local-tooling-and-environment.md)
  for the `jest.config.js` fix.

---

## Lightning Web Component Testing: Scenarios to Cover

For each component that calls Apex, cover at minimum:

1. **Loading state** — the component shows its loading indicator while the
   mocked Apex promise is pending.
2. **Success state** — the mocked Apex call resolves with a contract-valid
   payload; assert the relevant DOM elements render the expected data.
3. **Empty state** — the mocked Apex call resolves with a payload the
   component's functional requirements define as "nothing to show" (e.g.,
   an empty list); assert the empty-state message renders, not a blank or
   broken layout.
4. **Error state** — the mocked Apex call rejects (or resolves with a
   contract-defined error payload, depending on how the controller
   surfaces errors); assert the error state renders and no stale data is
   shown.
5. **User input capture** — simulate user input (`dispatchEvent` on an
   input element) and assert the value is correctly passed to the mocked
   Apex call's arguments.

Do not write an LWC test that re-implements or asserts on backend business
logic — the mock defines what "the backend said," and the test only
verifies the component reacts to it correctly.

---

## Test Data

- Use synthetic, contract-shaped test data only. Never use real member,
  customer, or otherwise sensitive data in a test file, mock, or fixture.
- Keep mock payloads close to the test that uses them (inline or in a
  small local fixture module) rather than a large shared fixture file that
  obscures which scenario a given test is exercising, unless several tests
  genuinely share the same exact payload.
