class MemberNotFoundError(Exception):
    """Raised when no member exists for a supplied Member ID (BR-002)."""

    def __init__(self, member_id: str) -> None:
        self.member_id = member_id
        super().__init__(f"No member found for memberId '{member_id}'.")
