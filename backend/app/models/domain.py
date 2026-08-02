from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Member:
    member_id: str
    first_name: str
    last_name: str
    date_of_birth: date


@dataclass(frozen=True)
class Coverage:
    member_id: str
    coverage_type: str
    effective_date: date
    termination_date: date


@dataclass(frozen=True)
class EligibilityResult:
    member_id: str
    member_name: str
    status: str
    reason: str
    evaluation_date: date
    coverage_type: str | None
    effective_date: date | None
    termination_date: date | None
