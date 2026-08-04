import { LightningElement } from 'lwc';
import verifyEligibility from '@salesforce/apex/MemberEligibilityController.verifyEligibility';

// Presentation-only label/icon mapping for the eligibilityStatus values
// enumerated in contracts/member-eligibility.yaml
// (components.schemas.EligibilityStatus). This does not decide the
// outcome - it only formats a decision the backend already made. See
// docs/03-architecture.md ("Salesforce does not evaluate eligibility").
const STATUS_LABELS = {
    ELIGIBLE: 'Eligible',
    INELIGIBLE: 'Not Eligible',
    UNABLE_TO_DETERMINE: 'Unable to Determine'
};

const STATUS_ICON_NAMES = {
    ELIGIBLE: 'utility:success',
    INELIGIBLE: 'utility:error',
    UNABLE_TO_DETERMINE: 'utility:warning'
};

const STATUS_THEMES = {
    ELIGIBLE: 'slds-theme_success',
    INELIGIBLE: 'slds-theme_error',
    UNABLE_TO_DETERMINE: 'slds-theme_warning'
};

// A member that cannot be found results in an HTTP 404 from the backend
// (contracts/member-eligibility.yaml), which Apex surfaces as a plain
// AuraHandledException message rather than a structured error code. This
// substring match is presentation-only - it does not change the message
// shown to the user, only how it is framed (icon/heading/color).
const MEMBER_NOT_FOUND_PATTERN = /no member found/i;

// Presentation-only reformatting of the ISO 8601 (YYYY-MM-DD) date strings
// the backend returns into a business-friendly display (e.g. "Jan 1,
// 2026"). Parsed and rendered as UTC calendar dates - never local time -
// so the displayed day never shifts with the viewer's timezone. This does
// not reinterpret the date's meaning; see EligibilityVerificationResponse.cls.
function formatBusinessDate(isoDate) {
    if (!isoDate) {
        return '';
    }
    const parts = isoDate.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return isoDate;
    }
    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
    }).format(date);
}

// The moment this browser received a result - not a business date, so it
// is formatted in the viewer's local time.
function formatVerificationTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

export default class MemberEligibilityVerification extends LightningElement {
    memberId = '';
    isLoading = false;
    errorMessage = '';
    result;
    verifiedAt;

    handleMemberIdChange(event) {
        this.memberId = event.target.value;
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleVerify();
        }
    }

    async handleVerify() {
        if (this.isLoading) {
            return;
        }

        const inputField = this.template.querySelector('lightning-input');
        if (inputField && inputField.reportValidity() === false) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.result = undefined;
        this.verifiedAt = undefined;

        try {
            this.result = await verifyEligibility({ memberId: this.memberId });
            this.verifiedAt = new Date();
        } catch (error) {
            this.result = undefined;
            this.errorMessage = this.extractErrorMessage(error);
        } finally {
            this.isLoading = false;
        }
    }

    extractErrorMessage(error) {
        if (error && error.body && error.body.message) {
            return error.body.message;
        }
        return 'An unexpected error occurred while verifying eligibility.';
    }

    get isVerifyDisabled() {
        return this.isLoading;
    }

    get showError() {
        return !this.isLoading && !!this.errorMessage;
    }

    get showResult() {
        return !this.isLoading && !this.errorMessage && !!this.result;
    }

    get showEmptyState() {
        return !this.isLoading && !this.errorMessage && !this.result;
    }

    get hasCoverageDetails() {
        return !!(
            this.result &&
            (this.result.coverageType || this.result.effectiveDate || this.result.terminationDate)
        );
    }

    get statusLabel() {
        return this.result ? STATUS_LABELS[this.result.eligibilityStatus] || this.result.eligibilityStatus : '';
    }

    get statusIconName() {
        return this.result ? STATUS_ICON_NAMES[this.result.eligibilityStatus] || 'utility:info' : '';
    }

    // UNABLE_TO_DETERMINE renders on a pale warning-yellow background,
    // where a white (inverse) icon loses contrast - the warning variant's
    // own dark-on-yellow icon color is the SLDS-documented pairing for
    // that theme. ELIGIBLE/INELIGIBLE render on fully saturated
    // green/red, where inverse (white) is the correct pairing.
    get statusIconVariant() {
        return this.result && this.result.eligibilityStatus === 'UNABLE_TO_DETERMINE' ? 'warning' : 'inverse';
    }

    get statusSummaryClass() {
        const theme = this.result ? STATUS_THEMES[this.result.eligibilityStatus] : null;
        return `slds-box slds-m-bottom_medium ${theme || 'slds-theme_shade'}`;
    }

    get formattedEvaluationDate() {
        return this.result ? formatBusinessDate(this.result.evaluationDate) : '';
    }

    get formattedEffectiveDate() {
        return this.result ? formatBusinessDate(this.result.effectiveDate) : '';
    }

    get formattedTerminationDate() {
        return this.result ? formatBusinessDate(this.result.terminationDate) : '';
    }

    get formattedVerificationTime() {
        return this.verifiedAt ? formatVerificationTime(this.verifiedAt) : '';
    }

    get isMemberNotFoundError() {
        return MEMBER_NOT_FOUND_PATTERN.test(this.errorMessage);
    }

    get errorHeading() {
        return this.isMemberNotFoundError ? 'Member Not Found' : 'Verification Error';
    }

    get errorIconName() {
        return this.isMemberNotFoundError ? 'utility:user' : 'utility:error';
    }

    get errorIconVariant() {
        return this.isMemberNotFoundError ? '' : 'error';
    }

    get errorSuggestion() {
        return this.isMemberNotFoundError
            ? 'Confirm the Member ID and try again.'
            : 'Please try again. If the issue continues, contact your Salesforce administrator.';
    }

    get errorNotificationClass() {
        const base = 'slds-scoped-notification slds-scoped-notification_light slds-p-around_medium';
        return this.isMemberNotFoundError ? `${base} notification_neutral` : `${base} notification_error`;
    }
}
