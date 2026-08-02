import json
from datetime import date
from pathlib import Path

from app.models.domain import Member


class MemberRepository:
    """Retrieves member records from the synthetic JSON data source."""

    def __init__(self, data_file: Path) -> None:
        self._members: dict[str, Member] = {
            record["memberId"]: Member(
                member_id=record["memberId"],
                first_name=record["firstName"],
                last_name=record["lastName"],
                date_of_birth=date.fromisoformat(record["dateOfBirth"]),
            )
            for record in json.loads(data_file.read_text())
        }

    def find_by_id(self, member_id: str) -> Member | None:
        return self._members.get(member_id)
