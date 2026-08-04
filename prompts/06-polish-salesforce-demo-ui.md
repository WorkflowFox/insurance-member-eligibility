# WorkflowFox Showcase 1 - Salesforce UI Polish

You are a Senior Salesforce UX Engineer, Lightning Web Components expert, and Salesforce Lightning Design System (SLDS) specialist.

Your goal is to transform the existing Member Eligibility application into a polished, production-quality enterprise application suitable for customer demonstrations.

## IMPORTANT

This is **NOT** a rewrite.

The application already works.

Do NOT redesign the solution.

Do NOT modify the backend.

Do NOT modify the API contract.

Do NOT duplicate business logic.

Only improve the Salesforce user experience.

---

# Existing Architecture

Preserve the existing architecture.

```
Lightning Web Component
        ↓
Apex Controller
        ↓
Apex Integration Service
        ↓
Named Credential
        ↓
FastAPI
```

This architecture must remain unchanged.

---

# Design Goal

The application should look like a real internal healthcare application used by a Provider Relations representative.

Think:

- Salesforce Service Console
- Salesforce Record Pages
- Enterprise Healthcare
- Blue Cross
- Cigna
- United Healthcare

Avoid consumer-style UI.

Avoid flashy colors.

Avoid unnecessary animations.

Professional simplicity wins.

---

# Design Language

Use only native Salesforce technologies.

Use:

- Salesforce Lightning Design System (SLDS)
- Lightning Base Components
- Lightning Layout
- Lightning Card
- Lightning Icons
- Responsive SLDS Grid
- Standard Salesforce spacing
- Standard Salesforce typography

Do NOT introduce:

- Bootstrap
- Tailwind
- Material UI
- Third-party CSS
- Third-party JavaScript

The application should feel like it belongs inside Salesforce.

---

# Application Header

Create a professional page header.

Display:

Workflow Insurance

Member Eligibility Verification

Subtitle:

Verify current member eligibility and coverage information.

Include an appropriate Lightning icon.

Keep the header compact and clean.

---

# Search Section

Place the search inside a Lightning Card.

Improve spacing.

Include:

- Member ID label
- Helpful placeholder
- Search icon
- Primary Verify Eligibility button

Support:

- Pressing Enter
- Keyboard navigation

Disable the button while processing.

---

# Loading Experience

While verification is running:

- Display lightning-spinner
- Disable Verify button
- Prevent duplicate submissions
- Preserve entered Member ID

---

# Eligibility Result

Display the result inside a professional Lightning Card.

Do NOT display plain text.

Organize information into a clean layout.

Display:

Member

Member ID

Coverage

Eligibility Status

Reason

Effective Date

Termination Date

Evaluation Date

Use Lightning layout components.

---

# Status Display

Replace plain status text with professional visual indicators.

Examples:

Eligible

Green success badge

Shield or Success icon

Future Coverage

Yellow warning badge

Warning icon

Not Eligible

Red badge

Error icon

Member Not Found

Gray informational badge

Status should be immediately recognizable.

Do not rely only on color.

---

# Icons

Use Lightning icons where appropriate.

Examples:

utility:user

utility:search

utility:shield

utility:success

utility:warning

utility:error

utility:event

Do not overuse icons.

---

# Empty State

Before a search:

Do not display an empty result card.

Display a simple instruction.

Example:

"Enter a Member ID to verify eligibility."

---

# Error Handling

Provide polished user-friendly error messages.

Handle:

- Blank Member ID
- Member Not Found
- API unavailable
- Unexpected errors

Do not expose:

- Stack traces
- Apex exception names
- HTTP implementation details
- Internal endpoint information

---

# Accessibility

Maintain:

- Keyboard accessibility
- Screen-reader friendly labels
- Visible focus indicators
- Accessible status messages

Color must not be the only status indicator.

---

# Responsive Design

The page should work well on:

- Desktop
- Laptop
- Tablet

Avoid fixed-width layouts.

---

# Lightning Application

Inspect the existing Salesforce metadata.

If a Lightning App already exists:

Update it.

Otherwise create one.

Application:

Label:

Member Eligibility

Developer Name:

Member_Eligibility

Keep navigation minimal.

---

# Lightning App Page

Inspect existing metadata.

If an App Page already exists:

Reuse it.

Otherwise create one.

Place the existing Member Eligibility Lightning Web Component prominently on the page.

Activate the page for the Member Eligibility application.

Do not create duplicate metadata.

---

# Component Exposure

Verify the Lightning Web Component supports:

lightning__AppPage

Preserve any existing valid targets.

---

# Code Quality

Reuse existing code.

Refactor only where it improves readability.

Do not change:

- Apex APIs
- Named Credential usage
- HTTP contract
- Response models
- Backend business logic

---

# Testing

Update existing LWC Jest tests where necessary.

Verify:

- Initial page
- Loading state
- Eligible result
- Ineligible result
- Member not found
- Error handling
- Enter-key submission

Run tests.

---

# Deployment

Deploy only to:

dev-workflowfox

Always specify:

--target-org dev-workflowfox

Do not deploy anywhere else.

---

# Validation

Validate:

✓ Lightning App

✓ Lightning App Page

✓ LWC renders correctly

✓ Spinner works

✓ Button disables during processing

✓ Successful eligibility verification

✓ Error scenarios

✓ Responsive layout

✓ Accessibility

---

# Deliverables

Update only what is necessary.

Possible files include:

- LWC HTML
- LWC CSS
- LWC JavaScript
- LWC metadata
- Lightning App metadata
- Lightning App Page metadata
- Jest tests

Reuse existing metadata whenever possible.

Do not create duplicate applications or pages.

---

# Success Criteria

The final application should look like a polished enterprise Salesforce application that could be demonstrated to:

- Enterprise Architects
- CIOs
- Healthcare IT Leaders
- Salesforce Customers

A viewer should immediately think:

"This looks like a real enterprise application."

Keep the design elegant, restrained, and unmistakably native to Salesforce.