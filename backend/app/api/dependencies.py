from datetime import date
from functools import lru_cache

from app.core.config import Settings, get_settings
from app.repositories.coverage_repository import CoverageRepository
from app.repositories.member_repository import MemberRepository
from app.services.eligibility_service import EligibilityService


@lru_cache
def get_member_repository() -> MemberRepository:
    settings: Settings = get_settings()
    return MemberRepository(settings.members_file)


@lru_cache
def get_coverage_repository() -> CoverageRepository:
    settings: Settings = get_settings()
    return CoverageRepository(settings.coverage_file)


def get_eligibility_service() -> EligibilityService:
    return EligibilityService(get_member_repository(), get_coverage_repository())


def get_evaluation_date() -> date:
    return date.today()
