from datetime import date

from app.core.exceptions import MemberNotFoundError
from app.core.logging import get_logger
from app.models.domain import Coverage, EligibilityResult, Member
from app.repositories.coverage_repository import CoverageRepository
from app.repositories.member_repository import MemberRepository

logger = get_logger(__name__)

ELIGIBLE = "ELIGIBLE"
INELIGIBLE = "INELIGIBLE"
UNABLE_TO_DETERMINE = "UNABLE_TO_DETERMINE"

REASON_ACTIVE_COVERAGE = "Active coverage"
REASON_NOT_YET_EFFECTIVE = "Coverage Not Yet Effective"
REASON_TERMINATED = "Coverage Terminated"
REASON_COVERAGE_UNAVAILABLE = "Coverage information unavailable"


class EligibilityService:
    """Owns all eligibility business rules (BR-002 through BR-006)."""

    def __init__(self, members: MemberRepository, coverage: CoverageRepository) -> None:
        self._members = members
        self._coverage = coverage

    def evaluate(self, member_id: str, evaluation_date: date) -> EligibilityResult:
        member = self._members.find_by_id(member_id)
        logger.info("Member lookup for %s: %s", member_id, "found" if member else "not found")
        if member is None:
            raise MemberNotFoundError(member_id)

        coverage = self._coverage.find_by_member_id(member_id)
        result = self._evaluate_for_member(member, coverage, evaluation_date)
        logger.info("Eligibility result for %s: %s", member_id, result.status)
        return result

    def _evaluate_for_member(
        self, member: Member, coverage: Coverage | None, evaluation_date: date
    ) -> EligibilityResult:
        member_name = f"{member.first_name} {member.last_name}"

        if coverage is None:
            return EligibilityResult(
                member_id=member.member_id,
                member_name=member_name,
                status=UNABLE_TO_DETERMINE,
                reason=REASON_COVERAGE_UNAVAILABLE,
                evaluation_date=evaluation_date,
                coverage_type=None,
                effective_date=None,
                termination_date=None,
            )

        if evaluation_date < coverage.effective_date:
            status, reason = INELIGIBLE, REASON_NOT_YET_EFFECTIVE
        elif evaluation_date > coverage.termination_date:
            status, reason = INELIGIBLE, REASON_TERMINATED
        else:
            status, reason = ELIGIBLE, REASON_ACTIVE_COVERAGE

        return EligibilityResult(
            member_id=member.member_id,
            member_name=member_name,
            status=status,
            reason=reason,
            evaluation_date=evaluation_date,
            coverage_type=coverage.coverage_type,
            effective_date=coverage.effective_date,
            termination_date=coverage.termination_date,
        )
