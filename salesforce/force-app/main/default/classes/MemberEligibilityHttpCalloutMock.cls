/**
 * HttpCalloutMock used by Apex tests to simulate responses from the
 * Member Eligibility Service without performing a real callout.
 * Payloads used by tests are drawn from contracts/member-eligibility.yaml
 * response examples. See references/salesforce-testing.md.
 */
@isTest
public class MemberEligibilityHttpCalloutMock implements HttpCalloutMock {
    private final Integer statusCode;
    private final String responseBody;
    private final Boolean simulateCalloutException;

    public MemberEligibilityHttpCalloutMock(Integer statusCode, String responseBody) {
        this.statusCode = statusCode;
        this.responseBody = responseBody;
        this.simulateCalloutException = false;
    }

    public MemberEligibilityHttpCalloutMock() {
        this.statusCode = null;
        this.responseBody = null;
        this.simulateCalloutException = true;
    }

    public HttpResponse respond(HttpRequest request) {
        if (simulateCalloutException) {
            throw new CalloutException(
                'Simulated timeout contacting the Member Eligibility Service.'
            );
        }

        HttpResponse response = new HttpResponse();
        response.setStatusCode(statusCode);
        response.setBody(responseBody);
        response.setHeader('Content-Type', 'application/json');
        return response;
    }
}
