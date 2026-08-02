from datetime import date

from fastapi import APIRouter, Depends

from app.api.dependencies import get_eligibility_service, get_evaluation_date
from app.models.domain import EligibilityResult
from app.models.errors import ErrorResponse, ValidationErrorResponse
from app.models.requests import EligibilityVerificationRequest
from app.models.responses import EligibilityVerificationResponse
from app.services.eligibility_service import EligibilityService

router = APIRouter(prefix="/api/v1/eligibility", tags=["Eligibility"])


@router.post(
    "/verify",
    operation_id="verifyEligibility",
    response_model=EligibilityVerificationResponse,
    responses={
        400: {"model": ValidationErrorResponse, "description": "Invalid request."},
        404: {"model": ErrorResponse, "description": "Member not found."},
        500: {"model": ErrorResponse, "description": "Unexpected system error."},
    },
)
def verify_eligibility(
    request: EligibilityVerificationRequest,
    service: EligibilityService = Depends(get_eligibility_service),
    evaluation_date: date = Depends(get_evaluation_date),
) -> EligibilityVerificationResponse:
    result: EligibilityResult = service.evaluate(request.member_id, evaluation_date)
    return EligibilityVerificationResponse(
        member_id=result.member_id,
        member_name=result.member_name,
        eligibility_status=result.status,
        reason=result.reason,
        evaluation_date=result.evaluation_date,
        coverage_type=result.coverage_type,
        effective_date=result.effective_date,
        termination_date=result.termination_date,
    )
