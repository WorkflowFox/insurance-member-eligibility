# Lightning Web Component Best Practices

> Generated from current Salesforce platform best practices for Lightning
> Web Components, Apex, Named Credentials, and REST integration. Update
> with organization-specific standards as needed.

This reference defines how a Lightning Web Component should be structured
when it exists to present a user experience backed by an Apex integration
service. It is project-agnostic; the exact fields, labels, and flows always
come from the project's functional requirements and OpenAPI contract.

---

## Component Responsibility

- A component's job is to collect input, call Apex, and render the
  result — nothing more.
- Do not compute a business outcome (eligibility, scoring, routing
  decisions) in JavaScript. If a decision is needed, it must come back
  from the API response; the component only displays it.
- Keep components small and single-purpose. Split a component that both
  collects input and renders a multi-section result into a container plus
  presentational children if the markup grows unwieldy.

---

## Calling Apex

- Prefer `@wire` for read-only data that should refresh reactively with
  its reactive parameters. Use imperative Apex calls (`import apexMethod
  from '@salesforce/apex/...'`, called from an event handler) for
  user-triggered actions like a form submission.
- Never call Apex methods that perform DML or callouts from a `@wire`
  property when the call is meant to be triggered by user action —
  `@wire` re-invokes on every reactive parameter change, which is the
  wrong trigger model for a "submit" action.
- Handle both branches of every Apex call: the success path and the error
  path. A component that only implements `.then()` and ignores rejection
  will render nothing (or throw silently) on failure.
- Do not catch and swallow Apex errors without surfacing them to the user
  in some form — see [ui-design-guidelines.md](ui-design-guidelines.md)
  for how to present error state.

---

## Reactivity and State

- Use `@track` (or plain class fields, which are reactive by default for
  primitives and reassigned objects/arrays in modern LWC) only for state
  that actually needs to re-render the template — do not mark everything
  reactive by default.
- Treat objects and arrays returned from Apex as immutable; reassign
  rather than mutate in place, so the reactivity system reliably detects
  the change.
- Keep a single source of truth for loading/success/error state (e.g., a
  small state enum or three booleans that are mutually exclusive) rather
  than inferring UI state from the shape of the data at render time.

---

## Component Communication

- Use `@api` properties for data a parent passes down, and custom events
  (`CustomEvent`) for data a child reports up. Do not reach into a child
  component's internals or use global mutable state to pass data between
  components.
- Name custom events with a lowercase, hyphen-free convention (e.g.,
  `submitted`, `selectionchange`) per LWC event naming rules.
- Keep event payloads minimal — pass only the data the listener needs, not
  the entire internal state of the firing component.

---

## Structure and Naming

- One component per distinct user-facing concern. Name components for
  what they show or do (e.g., `memberLookupForm`, `eligibilityResult`),
  not for the API endpoint they call.
- Keep the JavaScript controller thin: presentation logic and Apex
  orchestration only. Extract non-trivial formatting or mapping logic
  into a plain JS utility module if it grows past a few lines, so it can
  be unit tested independently of the DOM.
- Do not duplicate a utility already provided by `lightning/*` base
  components or the Lightning Design System — use the platform-provided
  component before writing a custom one.

---

## Error and Loading States

- Every component that calls Apex must have an explicit loading state
  shown while the call is in flight, and must not show stale or
  placeholder data as if it were real.
- Every component that calls Apex must have an explicit error state,
  distinct from the empty-result state (no error, but nothing to show)
  and the success state.
- See [ui-design-guidelines.md](ui-design-guidelines.md) for the visual
  treatment of these states.

---

## Accessibility

- Use semantic Lightning base components (`lightning-input`,
  `lightning-button`, `lightning-combobox`, etc.) so labeling, keyboard
  navigation, and ARIA attributes are handled by the platform.
- Every form input must have an associated, visible label — do not rely on
  placeholder text as a substitute for a label.
- Announce asynchronous state changes (loading complete, error occurred)
  in a way that is perceivable to assistive technology, not only through
  a visual change (e.g., use `lightning/messageService`-appropriate
  patterns or an `aria-live` region where a custom status message is
  used).
