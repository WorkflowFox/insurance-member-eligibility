from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_eligibility_service, get_evaluation_date
from app.main import create_app
from app.models.domain import Coverage, EligibilityResult, Member
from app.services.eligibility_service import EligibilityService
from tests.conftest import FakeCoverageRepository, FakeMemberRepository

FIXED_EVALUATION_DATE = date(2026, 8, 2)


@pytest.fixture
def api_client(sarah_johnson: Member, active_coverage: Coverage) -> TestClient:
    app = create_app()
    service = EligibilityService(
        FakeMemberRepository({sarah_johnson.member_id: sarah_johnson}),
        FakeCoverageRepository({active_coverage.member_id: active_coverage}),
    )
    app.dependency_overrides[get_eligibility_service] = lambda: service
    app.dependency_overrides[get_evaluation_date] = lambda: FIXED_EVALUATION_DATE
    return TestClient(app)


def test_verify_eligibility_returns_200_for_active_coverage(api_client: TestClient) -> None:
    response = api_client.post("/api/v1/eligibility/verify", json={"memberId": "M100234"})

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "memberId": "M100234",
        "memberName": "Sarah Johnson",
        "eligibilityStatus": "ELIGIBLE",
        "reason": "Active coverage",
        "evaluationDate": "2026-08-02",
        "coverageType": "Medical",
        "effectiveDate": "2026-01-01",
        "terminationDate": "2026-12-31",
    }


def test_verify_eligibility_returns_404_for_unknown_member(api_client: TestClient) -> None:
    response = api_client.post("/api/v1/eligibility/verify", json={"memberId": "M999999"})

    assert response.status_code == 404
    body = response.json()
    assert body["code"] == "MEMBER_NOT_FOUND"
    assert "M999999" in body["message"]
    assert "correlationId" in body
    assert "timestamp" in body


def test_verify_eligibility_returns_400_for_missing_member_id(api_client: TestClient) -> None:
    response = api_client.post("/api/v1/eligibility/verify", json={})

    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "INVALID_REQUEST"
    assert body["message"] == "memberId is required and cannot be empty."


def test_verify_eligibility_returns_400_for_empty_member_id(api_client: TestClient) -> None:
    response = api_client.post("/api/v1/eligibility/verify", json={"memberId": ""})

    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "INVALID_REQUEST"


def test_verify_eligibility_returns_400_for_unexpected_field(api_client: TestClient) -> None:
    response = api_client.post(
        "/api/v1/eligibility/verify", json={"memberId": "M100234", "extra": "field"}
    )

    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"


def test_verify_eligibility_returns_500_for_unexpected_failure(
    sarah_johnson: Member, active_coverage: Coverage
) -> None:
    app = create_app()

    class ExplodingService(EligibilityService):
        def evaluate(self, member_id: str, evaluation_date: date) -> EligibilityResult:
            raise RuntimeError("boom")

    app.dependency_overrides[get_eligibility_service] = lambda: ExplodingService(
        FakeMemberRepository({}), FakeCoverageRepository({})
    )
    client = TestClient(app, raise_server_exceptions=False)

    response = client.post("/api/v1/eligibility/verify", json={"memberId": "M100234"})

    assert response.status_code == 500
    body = response.json()
    assert body["code"] == "INTERNAL_SERVER_ERROR"
    assert "boom" not in body["message"]
