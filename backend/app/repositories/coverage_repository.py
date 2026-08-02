import json
from datetime import date
from pathlib import Path

from app.models.domain import Coverage


class CoverageRepository:
    """Retrieves coverage records from the synthetic JSON data source."""

    def __init__(self, data_file: Path) -> None:
        self._coverage_by_member: dict[str, Coverage] = {
            record["memberId"]: Coverage(
                member_id=record["memberId"],
                coverage_type=record["coverageType"],
                effective_date=date.fromisoformat(record["effectiveDate"]),
                termination_date=date.fromisoformat(record["terminationDate"]),
            )
            for record in json.loads(data_file.read_text())
        }

    def find_by_member_id(self, member_id: str) -> Coverage | None:
        return self._coverage_by_member.get(member_id)
