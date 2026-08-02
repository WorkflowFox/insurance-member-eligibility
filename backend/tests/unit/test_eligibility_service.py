from datetime import date

import pytest

from app.core.exceptions import MemberNotFoundError
from app.models.domain import Coverage, Member
from app.services.eligibility_service import EligibilityService
from tests.conftest import FakeCoverageRepository, FakeMemberRepository


def make_service(
    members: dict[str, Member], coverage: dict[str, Coverage]
) -> EligibilityService:
    return EligibilityService(FakeMemberRepository(members), FakeCoverageRepository(coverage))


def test_br002_unknown_member_raises_not_found(sarah_johnson: Member) -> None:
    service = make_service({sarah_johnson.member_id: sarah_johnson}, {})

    with pytest.raises(MemberNotFoundError):
        service.evaluate("UNKNOWN", date(2026, 8, 2))


def test_br003_active_coverage_is_eligible(
    sarah_johnson: Member, active_coverage: Coverage
) -> None:
    service = make_service(
        {sarah_johnson.member_id: sarah_johnson}, {active_coverage.member_id: active_coverage}
    )

    result = service.evaluate("M100234", date(2026, 6, 15))

    assert result.status == "ELIGIBLE"
    assert result.reason == "Active coverage"
    assert result.member_name == "Sarah Johnson"
    assert result.coverage_type == "Medical"


@pytest.mark.parametrize(
    "evaluation_date",
    [date(2026, 1, 1), date(2026, 12, 31)],
    ids=["effective_date_boundary", "termination_date_boundary"],
)
def test_br003_boundary_dates_are_eligible_inclusive(
    sarah_johnson: Member, active_coverage: Coverage, evaluation_date: date
) -> None:
    service = make_service(
        {sarah_johnson.member_id: sarah_johnson}, {active_coverage.member_id: active_coverage}
    )

    result = service.evaluate("M100234", evaluation_date)

    assert result.status == "ELIGIBLE"


def test_br004_day_before_effective_date_is_ineligible(
    sarah_johnson: Member, active_coverage: Coverage
) -> None:
    service = make_service(
        {sarah_johnson.member_id: sarah_johnson}, {active_coverage.member_id: active_coverage}
    )

    result = service.evaluate("M100234", date(2025, 12, 31))

    assert result.status == "INELIGIBLE"
    assert result.reason == "Coverage Not Yet Effective"


def test_br005_day_after_termination_date_is_ineligible(
    sarah_johnson: Member, active_coverage: Coverage
) -> None:
    service = make_service(
        {sarah_johnson.member_id: sarah_johnson}, {active_coverage.member_id: active_coverage}
    )

    result = service.evaluate("M100234", date(2027, 1, 1))

    assert result.status == "INELIGIBLE"
    assert result.reason == "Coverage Terminated"


def test_br006_missing_coverage_is_unable_to_determine(sarah_johnson: Member) -> None:
    service = make_service({sarah_johnson.member_id: sarah_johnson}, {})

    result = service.evaluate("M100234", date(2026, 8, 2))

    assert result.status == "UNABLE_TO_DETERMINE"
    assert result.reason == "Coverage information unavailable"
    assert result.coverage_type is None
    assert result.effective_date is None
    assert result.termination_date is None
