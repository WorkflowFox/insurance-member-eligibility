# UI Design Guidelines

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference defines how a Lightning Web Component should present state
to the user. It is project-agnostic; the exact copy, labels, and layout
always come from the project's functional requirements.

---

## Use the Lightning Design System

- Build UI from `lightning/*` base components (`lightning-input`,
  `lightning-button`, `lightning-card`, `lightning-datatable`,
  `lightning-spinner`, etc.) rather than custom HTML/CSS, so the
  component automatically matches the org's theme, density, and
  accessibility behavior.
- Use SLDS utility classes (`slds-*`) for layout and spacing instead of
  custom CSS where an SLDS class already covers the need. Reserve a
  component's own CSS file for styling SLDS genuinely does not provide.
- Do not hardcode colors, spacing, or typography that duplicate what SLDS
  design tokens already express — this breaks visually when the org
  switches theme or density settings.

---

## Loading State

- Show a `lightning-spinner` (or a skeleton/placeholder pattern, if the
  functional requirements call for one) while an Apex call is in flight.
- Disable the triggering action (e.g., the submit button) while loading,
  so the user cannot fire a duplicate request.
- Never show the previous result or an empty shell as if it were current
  data while a new request is loading — the user must be able to tell the
  difference between "no data yet" and "data is refreshing."

---

## Success State

- Render returned data using components appropriate to its shape:
  `lightning-datatable` for tabular data, `lightning-formatted-*`
  components for individual fields (dates, phone numbers, addresses) so
  formatting matches the user's locale automatically.
- Do not reformat or reinterpret a field's meaning for display — if the
  contract returns an enum value, display it via a documented label
  mapping from the functional requirements, not an invented label.

---

## Empty State

- Distinguish "no results" from "error" and from "loading" — each needs
  its own distinct rendering. A blank card with no message is not an
  acceptable empty state.
- Use a brief, specific empty-state message appropriate to what the user
  was looking for (e.g., "No results found for the entered criteria"),
  sourced from the functional requirements rather than invented generic
  copy.

---

## Error State

- Present errors using `lightning-card` with an icon/`slds-theme_error`
  treatment, or a `lightning/messageService` toast for transient action
  errors — chosen based on whether the error is about a persistent
  section of the page or a one-off action, per the functional
  requirements.
- Error messages shown to the user must never include raw backend error
  text, stack traces, or internal identifiers unless the functional
  requirements explicitly call for surfacing a specific, user-safe error
  code.
- Every error state must give the user a next step where one exists (retry
  the action, correct the input) rather than a dead end.

---

## Forms and Input Validation

- Use each `lightning-input`/`lightning-combobox`'s built-in validation
  (`required`, `pattern`, `min`/`max`, `type`) for client-side constraints
  that mirror the contract's request schema, so the user gets immediate
  feedback before a callout is even made.
- Client-side validation is a UX convenience, not a substitute for the
  backend's validation — never skip surfacing a contract-defined 4xx
  validation error just because client-side checks also exist.
- Call `reportValidity()` (or the component's equivalent) before
  submitting, and focus the first invalid field, rather than silently
  ignoring an invalid submit attempt.
- Gate on an explicit `=== false`, not plain falsiness:
  `if (inputField.reportValidity() === false) { return; }`. Jest's base
  `lightning-input` stub returns `undefined` from `reportValidity()`
  (see [local-tooling-and-environment.md](local-tooling-and-environment.md)),
  and a falsy-only check (`!inputField.reportValidity()`) will silently
  block every test run — and would just as silently mask a real component
  bug where validation is never actually being consulted.

---

## Responsiveness

- Use SLDS grid utilities (`slds-grid`, `slds-col`, `slds-size_*-of-12`)
  so layouts adapt across the Salesforce app's supported form factors
  (desktop, and Salesforce mobile app where applicable), rather than
  fixed-pixel layouts.
- Verify a component remains usable at the narrowest width the target
  Salesforce page/app (e.g., a utility bar panel or a mobile page) will
  actually render it at, per the architecture document.

---

## Accessibility

- Every interactive element must be reachable and operable by keyboard
  alone (base Lightning components provide this by default — verify it
  is preserved if any custom markup is added).
- Color must never be the only signal for a state (e.g., pair an error
  color with an icon and text, not color alone) so the UI remains usable
  for colorblind users and matches WCAG 2.1 AA expectations.
- Provide meaningful `alt` text or `title` attributes for any icon that
  conveys information beyond decoration.
