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

    it('renders the input and button with no result, error, or spinner before any search', () => {
        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('lightning-input')).not.toBeNull();
        expect(element.shadowRoot.querySelector('lightning-button')).not.toBeNull();
        expect(element.shadowRoot.querySelector('lightning-spinner')).toBeNull();
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
    });

    it('shows a loading spinner while the Apex call is in flight', async () => {
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

        resolveCall(ELIGIBLE_RESPONSE);
        await flushPromises();

        expect(element.shadowRoot.querySelector('lightning-spinner')).toBeNull();
    });

    it('passes the entered Member ID to Apex and renders a successful eligible result', async () => {
        verifyEligibility.mockResolvedValue(ELIGIBLE_RESPONSE);

        const element = createElement('c-member-eligibility-verification', {
            is: MemberEligibilityVerification
        });
        document.body.appendChild(element);

        enterMemberId(element, 'M100234');
        clickVerify(element);
        await flushPromises();

        expect(verifyEligibility).toHaveBeenCalledWith({ memberId: 'M100234' });
        expect(element.shadowRoot.textContent).toContain('Eligible');
        expect(element.shadowRoot.textContent).toContain('Sarah Johnson');
        expect(element.shadowRoot.textContent).toContain('Active coverage');
        expect(element.shadowRoot.textContent).toContain('Medical');
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
        expect(element.shadowRoot.textContent).not.toContain('Coverage Type:');
    });

    it('renders the error state with the backend message when the Apex call rejects', async () => {
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
        expect(alert.textContent).toContain("No member found for memberId 'M999999'.");
        expect(element.shadowRoot.querySelector('lightning-spinner')).toBeNull();
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
