from pydantic import BaseModel, ConfigDict, Field


class EligibilityVerificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    member_id: str = Field(alias="memberId", min_length=1)
