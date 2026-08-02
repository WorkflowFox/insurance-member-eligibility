from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ELIGIBILITY_")

    app_name: str = "Member Eligibility Verification API"
    app_version: str = "1.0.0"
    members_file: Path = DEFAULT_DATA_DIR / "members.json"
    coverage_file: Path = DEFAULT_DATA_DIR / "coverage.json"


def get_settings() -> Settings:
    return Settings()
