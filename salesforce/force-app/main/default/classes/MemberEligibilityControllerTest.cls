/**
 * Covers MemberEligibilityController: the blank-memberId guard and
 * translation of MemberEligibilityIntegrationService outcomes into
 * AuraHandledException for the LWC. See references/salesforce-testing.md.
 */
@isTest
private class MemberEligibilityControllerTest {

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
        EligibilityVerificationResponse result = MemberEligibilityController.verifyEligibility('M100234');
        Test.stopTest();

        System.assertEquals('ELIGIBLE', result.eligibilityStatus);
    }

    @isTest
    static void testVerifyEligibility_ThrowsAuraHandledException_WhenMemberIdIsBlank() {
        Test.startTest();
        try {
            MemberEligibilityController.verifyEligibility('   ');
            System.assert(false, 'Expected an AuraHandledException.');
        } catch (AuraHandledException ex) {
            System.assertEquals('Member ID is required.', ex.getMessage());
        }
        Test.stopTest();
    }

    @isTest
    static void testVerifyEligibility_ThrowsAuraHandledException_WhenBackendReturns404() {
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
            MemberEligibilityController.verifyEligibility('M999999');
            System.assert(false, 'Expected an AuraHandledException.');
        } catch (AuraHandledException ex) {
            System.assertEquals(
                'No member found for memberId \'M999999\'.',
                ex.getMessage()
            );
        }
        Test.stopTest();
    }
}
