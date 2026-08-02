from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.models.domain import Coverage, Member
from app.repositories.coverage_repository import CoverageRepository
from app.repositories.member_repository import MemberRepository


class FakeMemberRepository(MemberRepository):
    """In-memory MemberRepository fake for deterministic tests."""

    def __init__(self, members: dict[str, Member]) -> None:
        self._members = members


class FakeCoverageRepository(CoverageRepository):
    """In-memory CoverageRepository fake for deterministic tests."""

    def __init__(self, coverage_by_member: dict[str, Coverage]) -> None:
        self._coverage_by_member = coverage_by_member


@pytest.fixture
def sarah_johnson() -> Member:
    return Member(
        member_id="M100234",
        first_name="Sarah",
        last_name="Johnson",
        date_of_birth=date(1985, 4, 12),
    )


@pytest.fixture
def active_coverage() -> Coverage:
    return Coverage(
        member_id="M100234",
        coverage_type="Medical",
        effective_date=date(2026, 1, 1),
        termination_date=date(2026, 12, 31),
    )


@pytest.fixture
def member_repository(sarah_johnson: Member) -> FakeMemberRepository:
    return FakeMemberRepository({sarah_johnson.member_id: sarah_johnson})


@pytest.fixture
def coverage_repository(active_coverage: Coverage) -> FakeCoverageRepository:
    return FakeCoverageRepository({active_coverage.member_id: active_coverage})


@pytest.fixture
def client() -> TestClient:
    from app.main import create_app

    return TestClient(create_app())
