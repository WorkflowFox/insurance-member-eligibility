/**
 * Response wrapper for a successful (HTTP 200) eligibility evaluation.
 * Field-for-field mirror of contracts/member-eligibility.yaml
 * components.schemas.EligibilityVerificationResponse.
 *
 * coverageType, effectiveDate, and terminationDate are nullable per the
 * contract (they are absent when eligibilityStatus is UNABLE_TO_DETERMINE).
 * Date fields are typed as String rather than Apex Date to preserve the
 * exact ISO 8601 value returned by the backend without a locale- or
 * timezone-dependent conversion; the backend, not Salesforce, owns date
 * interpretation. See references/apex-integration-patterns.md.
 */
public class EligibilityVerificationResponse {
    @AuraEnabled public String memberId;
    @AuraEnabled public String memberName;
    @AuraEnabled public String eligibilityStatus;
    @AuraEnabled public String reason;
    @AuraEnabled public String evaluationDate;
    @AuraEnabled public String coverageType;
    @AuraEnabled public String effectiveDate;
    @AuraEnabled public String terminationDate;
}
