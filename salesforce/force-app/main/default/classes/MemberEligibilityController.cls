/**
 * @AuraEnabled entry point the Lightning Web Component calls to verify
 * member eligibility. Delegates to MemberEligibilityIntegrationService and
 * translates its exceptions into an AuraHandledException the LWC can
 * catch and present. Contains no eligibility business rules - see
 * docs/03-architecture.md ("Apex does not contain business rules").
 */
public with sharing class MemberEligibilityController {

    @AuraEnabled(cacheable=false)
    public static EligibilityVerificationResponse verifyEligibility(String memberId) {
        if (String.isBlank(memberId)) {
            throw newAuraHandledException('Member ID is required.');
        }

        try {
            return MemberEligibilityIntegrationService.verifyEligibility(memberId);
        } catch (MemberEligibilityIntegrationException ex) {
            throw newAuraHandledException(ex.getMessage());
        }
    }

    private static AuraHandledException newAuraHandledException(String message) {
        AuraHandledException ahe = new AuraHandledException(message);
        // AuraHandledException.getMessage() returns "Script-thrown exception"
        // unless setMessage() is called explicitly - see
        // references/apex-error-handling.md.
        ahe.setMessage(message);
        return ahe;
    }
}
