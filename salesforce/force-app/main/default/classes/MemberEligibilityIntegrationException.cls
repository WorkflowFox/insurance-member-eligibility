/**
 * Represents a translated failure from a call to the Member Eligibility
 * Service: a transport failure (timeout/unreachable host), a
 * contract-defined error response (400/404/500), or an unexpected
 * response shape. See references/apex-error-handling.md.
 *
 * This is an integration-layer failure only. It is never thrown to
 * represent a business outcome (ELIGIBLE/INELIGIBLE/UNABLE_TO_DETERMINE) -
 * those are normal, successful EligibilityVerificationResponse values.
 */
public class MemberEligibilityIntegrationException extends Exception {
    public Integer statusCode;
    public String errorCode;
    public String correlationId;

    public MemberEligibilityIntegrationException withDetails(
        Integer statusCode,
        String errorCode,
        String correlationId
    ) {
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.correlationId = correlationId;
        return this;
    }
}
