import { createElement } from 'lwc';
import MemberEligibilityVerification from 'c/memberEligibilityVerification';
import verifyEligibility from '@salesforce/apex/MemberEligibilityController.verifyEligibility';

jest.mock(
    '@salesforce/apex/MemberEligibilityController.verifyEligibility',
    () => ({ default: jest.fn() }),
    { virtual: true }
);

const ELIGIBLE_RESPONSE = {
    memberId: 'M100234',
    memberName: 'Sarah Johnson',
    eligibilityStatus: 'ELIGIBLE',
    reason: 'Active coverage',
    evaluationDate: '2026-08-02',
    coverageType: 'Medical',
    effectiveDate: '2026-01-01',
    terminationDate: '2026-12-31'
};

const INELIGIBLE_RESPONSE = {
    memberId: 'M100555',
    memberName: 'Diego Ramirez',
    eligibilityStatus: 'INELIGIBLE',
    reason: 'Coverage terminated',
    evaluationDate: '2026-08-02',
    coverageType: 'Medical',
    effectiveDate: '2025-01-01',
    terminationDate: '2026-01-01'
};

const UNABLE_TO_DETERMINE_RESPONSE = {
    memberId: 'M100999',
    memberName: 'James Patel',
    eligibilityStatus: 'UNABLE_TO_DETERMINE',
    reason: 'Coverage information unavailable',
    evaluationDate: '2026-08-02',
    coverageType: null,
    effectiveDate: null,
    terminationDate: null
};

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

function enterMemberId(element, memberId) {
    const input = element.shadowRoot.querySelector('lightning-input');
    input.value = memberId;
    input.dispatchEvent(new CustomEvent('change'));
    return input;
}

function clickVerify(element) {
    element.shadowRoot.querySelector('lightning-button').click();
}

describe('c-member-eligibility-verification', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders the input and button with an instructional empty state before any search', () => {
        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('lightning-input')).not.toBeNull();
        expect(element.shadowRoot.querySelector('lightning-button')).not.toBeNull();
        expect(element.shadowRoot.querySelector('lightning-spinner')).toBeNull();
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
        expect(element.shadowRoot.textContent).toContain('Enter a Member ID to verify eligibility.');
    });

    it('shows a loading spinner while the Apex call is in flight and hides the empty state', async () => {
        let resolveCall;
        verifyEligibility.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveCall = resolve;
                })
        );

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100234');
        clickVerify(element);
        await Promise.resolve();

        expect(element.shadowRoot.querySelector('lightning-spinner')).not.toBeNull();
        expect(element.shadowRoot.textContent).not.toContain('Enter a Member ID to verify eligibility.');

        resolveCall(ELIGIBLE_RESPONSE);
        await flushPromises();

        expect(element.shadowRoot.querySelector('lightning-spinner')).toBeNull();
    });

    it('disables the Verify button and ignores duplicate submissions while loading', async () => {
        let resolveCall;
        verifyEligibility.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveCall = resolve;
                })
        );

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100234');
        clickVerify(element);
        await Promise.resolve();

        expect(element.shadowRoot.querySelector('lightning-button').disabled).toBe(true);

        clickVerify(element);
        await Promise.resolve();

        expect(verifyEligibility).toHaveBeenCalledTimes(1);

        resolveCall(ELIGIBLE_RESPONSE);
        await flushPromises();
    });

    it('passes the entered Member ID to Apex and renders a prominent eligible summary with sectioned details', async () => {
        verifyEligibility.mockResolvedValue(ELIGIBLE_RESPONSE);

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100234');
        clickVerify(element);
        await flushPromises();

        expect(verifyEligibility).toHaveBeenCalledWith({ memberId: 'M100234' });

        const text = element.shadowRoot.textContent;
        expect(text).toContain('Eligibility Summary');
        expect(text).toContain('Eligible');
        expect(text).toContain('Active coverage');
        expect(text).toContain('Member Information');
        expect(text).toContain('Sarah Johnson');
        expect(text).toContain('Coverage Details');
        expect(text).toContain('Medical');
        // Business-friendly date formatting, not raw ISO strings
        expect(text).toContain('Jan 1, 2026');
        expect(text).toContain('Dec 31, 2026');
        expect(text).toContain('Aug 2, 2026');
        expect(text).not.toContain('2026-01-01');
        // Secondary request metadata
        expect(text).toContain('Request Information');
        expect(text).toContain('Verification Time');
        expect(text).toContain('Response Source');
        expect(text).toContain('Member Eligibility Service');
    });

    it('renders an ineligible result with the Not Eligible status', async () => {
        verifyEligibility.mockResolvedValue(INELIGIBLE_RESPONSE);

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100555');
        clickVerify(element);
        await flushPromises();

        expect(element.shadowRoot.textContent).toContain('Not Eligible');
        expect(element.shadowRoot.textContent).toContain('Coverage terminated');
    });

    it('renders UNABLE_TO_DETERMINE without a coverage details section when fields are null', async () => {
        verifyEligibility.mockResolvedValue(UNABLE_TO_DETERMINE_RESPONSE);

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100999');
        clickVerify(element);
        await flushPromises();

        expect(element.shadowRoot.textContent).toContain('Unable to Determine');
        expect(element.shadowRoot.textContent).not.toContain('Coverage Details');
    });

    it('submits the search when Enter is pressed in the Member ID field', async () => {
        verifyEligibility.mockResolvedValue(ELIGIBLE_RESPONSE);

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        const input = enterMemberId(element, 'M100234');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await flushPromises();

        expect(verifyEligibility).toHaveBeenCalledWith({ memberId: 'M100234' });
        expect(element.shadowRoot.textContent).toContain('Eligible');
    });

    it('renders a distinct, actionable Member Not Found message when the backend cannot find the member', async () => {
        verifyEligibility.mockRejectedValue({
            body: { message: "No member found for memberId 'M999999'." }
        });

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M999999');
        clickVerify(element);
        await flushPromises();

        const alert = element.shadowRoot.querySelector('[role="alert"]');
        expect(alert).not.toBeNull();
        expect(alert.textContent).toContain('Member Not Found');
        expect(alert.textContent).toContain("No member found for memberId 'M999999'.");
        expect(alert.textContent).toContain('Confirm the Member ID and try again.');
        expect(element.shadowRoot.querySelector('lightning-spinner')).toBeNull();
    });

    it('renders an actionable error state with the backend message when the Apex call rejects for another reason', async () => {
        verifyEligibility.mockRejectedValue({
            body: { message: 'Unable to reach the Member Eligibility Service.' }
        });

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100234');
        clickVerify(element);
        await flushPromises();

        const alert = element.shadowRoot.querySelector('[role="alert"]');
        expect(alert).not.toBeNull();
        expect(alert.textContent).toContain('Verification Error');
        expect(alert.textContent).toContain('Unable to reach the Member Eligibility Service.');
        expect(alert.textContent).toContain('contact your Salesforce administrator');
    });

    it('falls back to a generic error message when the rejection has no body message', async () => {
        verifyEligibility.mockRejectedValue(new Error('network down'));

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100234');
        clickVerify(element);
        await flushPromises();

        const alert = element.shadowRoot.querySelector('[role="alert"]');
        expect(alert.textContent).toContain('An unexpected error occurred while verifying eligibility.');
    });
});
