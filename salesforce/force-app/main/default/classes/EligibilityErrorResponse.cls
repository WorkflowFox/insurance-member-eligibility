/**
 * Error wrapper for a non-2xx response.
 * Field-for-field mirror of contracts/member-eligibility.yaml
 * components.schemas.ErrorResponse.
 *
 * ValidationErrorResponse (HTTP 400) is defined in the contract as
 * `allOf: [ErrorResponse]` with no additional properties, so this single
 * wrapper also covers the 400 response body — a second, near-identical
 * class would duplicate rather than reuse. See
 * references/apex-integration-patterns.md ("Reuse").
 */
public class EligibilityErrorResponse {
    @AuraEnabled public String code;
    @AuraEnabled public String message;
    @AuraEnabled public String timestamp;
    @AuraEnabled public String correlationId;
}
