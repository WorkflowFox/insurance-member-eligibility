/**
 * Calls POST /api/v1/eligibility/verify on the Member Eligibility Service
 * (contracts/member-eligibility.yaml) and translates the HTTP response
 * into either a EligibilityVerificationResponse (HTTP 200) or a
 * MemberEligibilityIntegrationException (transport failure, contract-
 * defined error, or unexpected response).
 *
 * This class performs integration only - it builds the request, executes
 * the callout, and deserializes the response. It does not evaluate
 * eligibility; that decision is made entirely by the backend service.
 * See docs/03-architecture.md ("Apex does not contain business rules").
 */
public with sharing class MemberEligibilityIntegrationService {

    private static final String NAMED_CREDENTIAL = 'callout:Member_Eligibility_Service';
    private static final String RESOURCE_PATH = '/api/v1/eligibility/verify';
    private static final Integer TIMEOUT_MS = 10000;

    public static EligibilityVerificationResponse verifyEligibility(String memberId) {
        HttpRequest request = buildRequest(memberId);
        HttpResponse response;

        try {
            response = new Http().send(request);
        } catch (CalloutException ex) {
            throw new MemberEligibilityIntegrationException(
                'Unable to reach the Member Eligibility Service: ' + ex.getMessage()
            ).withDetails(null, 'CALLOUT_FAILURE', null);
        }

        return parseResponse(response);
    }

    private static HttpRequest buildRequest(String memberId) {
        EligibilityVerificationRequest payload = new EligibilityVerificationRequest(memberId);

        HttpRequest request = new HttpRequest();
        request.setEndpoint(NAMED_CREDENTIAL + RESOURCE_PATH);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setTimeout(TIMEOUT_MS);
        request.setBody(JSON.serialize(payload));
        return request;
    }

    private static EligibilityVerificationResponse parseResponse(HttpResponse response) {
        Integer statusCode = response.getStatusCode();

        if (statusCode == 200) {
            return (EligibilityVerificationResponse) JSON.deserialize(
                response.getBody(),
                EligibilityVerificationResponse.class
            );
        }

        if (statusCode == 400 || statusCode == 404 || statusCode == 500) {
            throw toIntegrationException(response, statusCode);
        }

        throw new MemberEligibilityIntegrationException(
            'The Member Eligibility Service returned an unexpected status code: ' + statusCode
        ).withDetails(statusCode, 'UNEXPECTED_RESPONSE', null);
    }

    private static MemberEligibilityIntegrationException toIntegrationException(
        HttpResponse response,
        Integer statusCode
    ) {
        EligibilityErrorResponse errorBody;

        try {
            errorBody = (EligibilityErrorResponse) JSON.deserialize(
                response.getBody(),
                EligibilityErrorResponse.class
            );
        } catch (JSONException ex) {
            return new MemberEligibilityIntegrationException(
                'The Member Eligibility Service returned status ' + statusCode +
                ' with a response body that could not be parsed.'
            ).withDetails(statusCode, 'UNEXPECTED_RESPONSE', null);
        }

        String message = (errorBody != null && String.isNotBlank(errorBody.message))
            ? errorBody.message
            : 'The Member Eligibility Service returned status ' + statusCode + '.';
        String errorCode = (errorBody != null) ? errorBody.code : null;
        String correlationId = (errorBody != null) ? errorBody.correlationId : null;

        return new MemberEligibilityIntegrationException(message)
            .withDetails(statusCode, errorCode, correlationId);
    }
}
