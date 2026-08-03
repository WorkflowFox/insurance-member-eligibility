# Permission Set Guidance

No Permission Set metadata is included in this package (this is
guidance, not a deployable artifact — the scope of this implementation
lists it as guidance, matching the `salesforce-integration-developer`
skill's rule against introducing unrequested metadata). Create it
declaratively in the target org as follows.

## Create the Permission Set

1. **Setup → Permission Sets → New.**
2. **Label:** `Member Eligibility Verification`.
   **API Name:** `Member_Eligibility_Verification`.
3. **Description:** "Grants Provider Relations representatives access to
   the Member Eligibility Verification Lightning Web Component and its
   supporting Apex and Named Credential."

## Grant Apex Class Access

Under **Apex Class Access**, add:

- `MemberEligibilityController`

Only the `@AuraEnabled` controller needs to be granted directly — Apex
classes it calls internally
(`MemberEligibilityIntegrationService`, `EligibilityVerificationRequest`,
`EligibilityVerificationResponse`, `EligibilityErrorResponse`,
`MemberEligibilityIntegrationException`) run under the same execution
context and do not require separate grants.

## Grant Named Credential Access

Under **External Credential Principal Access** / **Named Credential
Access** (naming varies by org/API version), grant access to:

- `Member_Eligibility_Service`

Without this grant, the callout in
`MemberEligibilityIntegrationService.cls` fails with an authorization
error even though the Apex class itself is accessible.

## Object and Field Permissions

None. This integration introduces no custom objects, fields, or DML —
see `docs/03-architecture.md` ("Apex does not contain business rules")
and the skill's rule against introducing SOQL/DML unless required. No
object or field-level security grants are needed.

## Component Visibility

If the `memberEligibilityVerification` Lightning Web Component is placed
on a Lightning App Page, Home Page, or App in a way that is gated by
visibility rules (rather than being available to all users by default),
grant this Permission Set's **App Visibility** and, if applicable, tab
visibility for the page it is placed on. The specifications do not
define a specific placement (App Page vs. Home Page vs. utility bar) —
confirm this with the target org's Lightning App configuration when
deploying.

## Assignment

Assign this Permission Set to the Provider Relations representative
user(s)/profile identified in `docs/02-functional-requirements.md`
("Primary Actor"). Do not grant broader access than these users need.
