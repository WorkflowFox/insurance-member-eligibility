/**
 * Request wrapper for POST /api/v1/eligibility/verify.
 * Field-for-field mirror of contracts/member-eligibility.yaml
 * components.schemas.EligibilityVerificationRequest.
 */
public class EligibilityVerificationRequest {
    @AuraEnabled
    public String memberId;

    public EligibilityVerificationRequest(String memberId) {
        this.memberId = memberId;
    }
}
