from pathlib import Path

import yaml

from app.main import create_app

CONTRACT_PATH = Path(__file__).resolve().parents[3] / "contracts" / "member-eligibility.yaml"


def load_contract() -> dict:
    return yaml.safe_load(CONTRACT_PATH.read_text())


def load_generated_schema() -> dict:
    return create_app().openapi()


def test_contract_file_is_present() -> None:
    assert CONTRACT_PATH.exists(), f"Expected OpenAPI contract at {CONTRACT_PATH}"


def test_generated_schema_exposes_the_same_paths_as_the_contract() -> None:
    contract = load_contract()
    generated = load_generated_schema()

    assert set(generated["paths"]) == set(contract["paths"])


def test_verify_eligibility_operation_matches_the_contract() -> None:
    contract = load_contract()
    generated = load_generated_schema()

    contract_op = contract["paths"]["/api/v1/eligibility/verify"]["post"]
    generated_op = generated["paths"]["/api/v1/eligibility/verify"]["post"]

    assert generated_op["operationId"] == contract_op["operationId"]
    assert set(generated_op["responses"]) == set(contract_op["responses"])


def test_request_schema_required_fields_match_the_contract() -> None:
    contract = load_contract()
    generated = load_generated_schema()

    contract_schema = contract["components"]["schemas"]["EligibilityVerificationRequest"]
    generated_schema = generated["components"]["schemas"]["EligibilityVerificationRequest"]

    assert set(generated_schema["required"]) == set(contract_schema["required"])
    assert "memberId" in generated_schema["properties"]


def test_eligibility_status_enum_matches_the_contract() -> None:
    contract = load_contract()
    generated = load_generated_schema()

    contract_values = set(contract["components"]["schemas"]["EligibilityStatus"]["enum"])
    generated_values = set(generated["components"]["schemas"]["EligibilityStatus"]["enum"])

    assert generated_values == contract_values


def test_response_schema_required_fields_match_the_contract() -> None:
    contract = load_contract()
    generated = load_generated_schema()

    contract_schema = contract["components"]["schemas"]["EligibilityVerificationResponse"]
    generated_schema = generated["components"]["schemas"]["EligibilityVerificationResponse"]

    assert set(generated_schema["required"]) == set(contract_schema["required"])
