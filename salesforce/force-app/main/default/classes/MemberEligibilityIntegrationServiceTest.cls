/**
 * Covers MemberEligibilityIntegrationService against every response shape
 * documented in contracts/member-eligibility.yaml: a successful (200)
 * evaluation, each contract-defined error status (400/404/500), a
 * malformed/unexpected response, and a simulated transport failure. See
 * references/salesforce-testing.md.
 *
 * These tests assert that Salesforce correctly transports, deserializes,
 * and surfaces what the backend returned - they do not assert on the
 * eligibility decision itself, which is the backend's responsibility.
 */
@isTest
private class MemberEligibilityIntegrationServiceTest {

    @isTest
    static void testVerifyEligibility_ReturnsResponse_WhenBackendReturns200() {
        String body =
            '{' +
            '"memberId":"M100234",' +
            '"memberName":"Sarah Johnson",' +
            '"eligibilityStatus":"ELIGIBLE",' +
            '"reason":"Active coverage",' +
            '"evaluationDate":"2026-08-02",' +
            '"coverageType":"Medical",' +
            '"effectiveDate":"2026-01-01",' +
            '"terminationDate":"2026-12-31"' +
            '}';
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(200, body));

        Test.startTest();
        EligibilityVerificationResponse result = MemberEligibilityIntegrationService.verifyEligibility('M100234');
        Test.stopTest();

        System.assertEquals('M100234', result.memberId);
        System.assertEquals('Sarah Johnson', result.memberName);
        System.assertEquals('ELIGIBLE', result.eligibilityStatus);
        System.assertEquals('Active coverage', result.reason);
        System.assertEquals('2026-08-02', result.evaluationDate);
        System.assertEquals('Medical', result.coverageType);
        System.assertEquals('2026-01-01', result.effectiveDate);
        System.assertEquals('2026-12-31', result.terminationDate);
    }

    @isTest
    static void testVerifyEligibility_ReturnsResponse_WithNullFields_WhenUnableToDetermine() {
        String body =
            '{' +
            '"memberId":"M100999",' +
            '"memberName":"James Patel",' +
            '"eligibilityStatus":"UNABLE_TO_DETERMINE",' +
            '"reason":"Coverage information unavailable",' +
            '"evaluationDate":"2026-08-02",' +
            '"coverageType":null,' +
            '"effectiveDate":null,' +
            '"terminationDate":null' +
            '}';
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(200, body));

        Test.startTest();
        EligibilityVerificationResponse result = MemberEligibilityIntegrationService.verifyEligibility('M100999');
        Test.stopTest();

        System.assertEquals('UNABLE_TO_DETERMINE', result.eligibilityStatus);
        System.assertEquals(null, result.coverageType);
        System.assertEquals(null, result.effectiveDate);
        System.assertEquals(null, result.terminationDate);
    }

    @isTest
    static void testVerifyEligibility_ThrowsException_WhenBackendReturns400() {
        String body =
            '{' +
            '"code":"INVALID_REQUEST",' +
            '"message":"memberId is required and cannot be empty.",' +
            '"timestamp":"2026-08-02T14:32:10Z",' +
            '"correlationId":"1b9d6bcd-bbfd-4b2e-8b19-c9c8b3e6f1a2"' +
            '}';
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(400, body));

        Test.startTest();
        try {
            MemberEligibilityIntegrationService.verifyEligibility('');
            System.assert(false, 'Expected a MemberEligibilityIntegrationException.');
        } catch (MemberEligibilityIntegrationException ex) {
            System.assertEquals(400, ex.statusCode);
            System.assertEquals('INVALID_REQUEST', ex.errorCode);
            System.assertEquals('memberId is required and cannot be empty.', ex.getMessage());
            System.assertEquals('1b9d6bcd-bbfd-4b2e-8b19-c9c8b3e6f1a2', ex.correlationId);
        }
        Test.stopTest();
    }

    @isTest
    static void testVerifyEligibility_ThrowsException_WhenBackendReturns404() {
        String body =
            '{' +
            '"code":"MEMBER_NOT_FOUND",' +
            '"message":"No member found for memberId \'M999999\'.",' +
            '"timestamp":"2026-08-02T14:33:45Z",' +
            '"correlationId":"2c8e5a3f-2b8b-4e5b-9c9e-1a6d8f0e4b7a"' +
            '}';
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(404, body));

        Test.startTest();
        try {
            MemberEligibilityIntegrationService.verifyEligibility('M999999');
            System.assert(false, 'Expected a MemberEligibilityIntegrationException.');
        } catch (MemberEligibilityIntegrationException ex) {
            System.assertEquals(404, ex.statusCode);
            System.assertEquals('MEMBER_NOT_FOUND', ex.errorCode);
        }
        Test.stopTest();
    }

    @isTest
    static void testVerifyEligibility_ThrowsException_WhenBackendReturns500() {
        String body =
            '{' +
            '"code":"INTERNAL_SERVER_ERROR",' +
            '"message":"An unexpected error occurred while processing the request.",' +
            '"timestamp":"2026-08-02T14:35:12Z",' +
            '"correlationId":"3d7f2b1a-4c5e-4f6a-8b9c-0d1e2f3a4b5c"' +
            '}';
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(500, body));

        Test.startTest();
        try {
            MemberEligibilityIntegrationService.verifyEligibility('M100234');
            System.assert(false, 'Expected a MemberEligibilityIntegrationException.');
        } catch (MemberEligibilityIntegrationException ex) {
            System.assertEquals(500, ex.statusCode);
            System.assertEquals('INTERNAL_SERVER_ERROR', ex.errorCode);
        }
        Test.stopTest();
    }

    @isTest
    static void testVerifyEligibility_ThrowsException_WithFallbackMessage_WhenErrorBodyHasNoMessage() {
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(404, '{}'));

        Test.startTest();
        try {
            MemberEligibilityIntegrationService.verifyEligibility('M999999');
            System.assert(false, 'Expected a MemberEligibilityIntegrationException.');
        } catch (MemberEligibilityIntegrationException ex) {
            System.assertEquals(404, ex.statusCode);
            System.assertEquals(
                'The Member Eligibility Service returned status 404.',
                ex.getMessage()
            );
        }
        Test.stopTest();
    }

    @isTest
    static void testVerifyEligibility_ThrowsException_WhenResponseBodyIsMalformed() {
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(404, 'not valid json'));

        Test.startTest();
        try {
            MemberEligibilityIntegrationService.verifyEligibility('M999999');
            System.assert(false, 'Expected a MemberEligibilityIntegrationException.');
        } catch (MemberEligibilityIntegrationException ex) {
            System.assertEquals(404, ex.statusCode);
            System.assertEquals('UNEXPECTED_RESPONSE', ex.errorCode);
        }
        Test.stopTest();
    }

    @isTest
    static void testVerifyEligibility_ThrowsException_WhenStatusCodeIsUndocumented() {
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock(503, '{}'));

        Test.startTest();
        try {
            MemberEligibilityIntegrationService.verifyEligibility('M100234');
            System.assert(false, 'Expected a MemberEligibilityIntegrationException.');
        } catch (MemberEligibilityIntegrationException ex) {
            System.assertEquals(503, ex.statusCode);
            System.assertEquals('UNEXPECTED_RESPONSE', ex.errorCode);
        }
        Test.stopTest();
    }

    @isTest
    static void testVerifyEligibility_ThrowsException_OnCalloutException() {
        Test.setMock(HttpCalloutMock.class, new MemberEligibilityHttpCalloutMock());

        Test.startTest();
        try {
            MemberEligibilityIntegrationService.verifyEligibility('M100234');
            System.assert(false, 'Expected a MemberEligibilityIntegrationException.');
        } catch (MemberEligibilityIntegrationException ex) {
            System.assertEquals('CALLOUT_FAILURE', ex.errorCode);
        }
        Test.stopTest();
    }
}
