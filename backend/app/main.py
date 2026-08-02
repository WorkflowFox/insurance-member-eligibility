import uuid
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

from app.api.eligibility import router as eligibility_router
from app.core.config import get_settings
from app.core.exceptions import MemberNotFoundError
from app.core.logging import configure_logging, get_logger
from app.models.errors import ErrorResponse

logger = get_logger(__name__)


def _error_body(code: str, message: str, correlation_id: str) -> dict:
    return ErrorResponse(
        code=code,
        message=message,
        timestamp=datetime.now(UTC),
        correlationId=correlation_id,
    ).model_dump(mode="json", by_alias=True)


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version=settings.app_version)

    app.include_router(eligibility_router)

    def custom_openapi() -> dict:
        if app.openapi_schema:
            return app.openapi_schema
        schema = get_openapi(title=app.title, version=app.version, routes=app.routes)
        # The app's RequestValidationError handler returns 400, not FastAPI's
        # default 422, so drop the auto-generated 422 entry to keep the
        # published schema truthful to actual runtime behavior.
        for path in schema.get("paths", {}).values():
            for operation in path.values():
                operation.get("responses", {}).pop("422", None)
        app.openapi_schema = schema
        return app.openapi_schema

    app.openapi = custom_openapi

    @app.middleware("http")
    async def add_correlation_id(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        correlation_id = str(uuid.uuid4())
        request.state.correlation_id = correlation_id
        logger.info("Incoming request %s %s [%s]", request.method, request.url.path, correlation_id)
        return await call_next(request)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        correlation_id = getattr(request.state, "correlation_id", str(uuid.uuid4()))
        member_id_error = any("memberId" in str(error.get("loc", "")) for error in exc.errors())
        message = (
            "memberId is required and cannot be empty."
            if member_id_error
            else "The request was invalid."
        )
        logger.info("Validation error [%s]: %s", correlation_id, message)
        return JSONResponse(
            status_code=400,
            content=_error_body("INVALID_REQUEST", message, correlation_id),
        )

    @app.exception_handler(MemberNotFoundError)
    async def handle_member_not_found(
        request: Request, exc: MemberNotFoundError
    ) -> JSONResponse:
        correlation_id = getattr(request.state, "correlation_id", str(uuid.uuid4()))
        logger.info("Member not found [%s]: %s", correlation_id, exc.member_id)
        return JSONResponse(
            status_code=404,
            content=_error_body("MEMBER_NOT_FOUND", str(exc), correlation_id),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        correlation_id = getattr(request.state, "correlation_id", str(uuid.uuid4()))
        logger.error("Unexpected error [%s]", correlation_id, exc_info=exc)
        return JSONResponse(
            status_code=500,
            content=_error_body(
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred while processing the request.",
                correlation_id,
            ),
        )

    return app


app = create_app()
