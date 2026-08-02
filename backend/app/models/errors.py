from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    code: str
    message: str
    timestamp: datetime
    correlation_id: str = Field(alias="correlationId")


class ValidationErrorResponse(ErrorResponse):
    """Same shape as ErrorResponse; the contract defines no additional fields."""
