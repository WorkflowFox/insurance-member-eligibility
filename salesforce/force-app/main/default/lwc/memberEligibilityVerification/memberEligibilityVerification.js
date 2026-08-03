import { LightningElement } from 'lwc';
import verifyEligibility from '@salesforce/apex/MemberEligibilityController.verifyEligibility';

// Presentation-only label/icon mapping for the eligibilityStatus values
// enumerated in contracts/member-eligibility.yaml
// (components.schemas.EligibilityStatus). This does not decide the
// outcome - it only formats a decision the backend already made. See
// docs/03-architecture.md ("Salesforce does not evaluate eligibility").
const STATUS_LABELS = {
    ELIGIBLE: 'Eligible',
    INELIGIBLE: 'Ineligible',
    UNABLE_TO_DETERMINE: 'Unable to Determine'
};

const STATUS_ICON_NAMES = {
    ELIGIBLE: 'utility:success',
    INELIGIBLE: 'utility:error',
    UNABLE_TO_DETERMINE: 'utility:warning'
};

const STATUS_VARIANTS = {
    ELIGIBLE: 'success',
    INELIGIBLE: 'error',
    UNABLE_TO_DETERMINE: 'warning'
};

export default class MemberEligibilityVerification extends LightningElement {
    memberId = '';
    isLoading = false;
    errorMessage = '';
    result;

    handleMemberIdChange(event) {
        this.memberId = event.target.value;
    }

    async handleVerify() {
        const inputField = this.template.querySelector('lightning-input');
        if (inputField && inputField.reportValidity() === false) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.result = undefined;

        try {
            this.result = await verifyEligibility({ memberId: this.memberId });
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

    get statusIconVariant() {
        return this.result ? STATUS_VARIANTS[this.result.eligibilityStatus] || 'inverse' : 'inverse';
    }

    get statusTextClass() {
        const variant = this.result ? STATUS_VARIANTS[this.result.eligibilityStatus] || 'default' : 'default';
        return `slds-text-heading_small slds-text-color_${variant}`;
    }
}
