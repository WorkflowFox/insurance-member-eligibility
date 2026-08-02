from datetime import date
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class EligibilityStatus(StrEnum):
    ELIGIBLE = "ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"
    UNABLE_TO_DETERMINE = "UNABLE_TO_DETERMINE"


class EligibilityVerificationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    member_id: str = Field(alias="memberId")
    member_name: str = Field(alias="memberName")
    eligibility_status: EligibilityStatus = Field(alias="eligibilityStatus")
    reason: str
    evaluation_date: date = Field(alias="evaluationDate")
    coverage_type: str | None = Field(default=None, alias="coverageType")
    effective_date: date | None = Field(default=None, alias="effectiveDate")
    termination_date: date | None = Field(default=None, alias="terminationDate")
