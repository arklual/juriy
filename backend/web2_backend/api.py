from django.http import Http404
from ninja import NinjaAPI
from django.db.utils import IntegrityError
from ninja.errors import ValidationError

from profiles.api import router as profiles_router
from categories.api import router as categories_router
from cards.api import router as cards_router


api = NinjaAPI(
    title="Web 2",
    description="This is an API for WB parsing site.",
    csrf=False
)

api.add_router('/', profiles_router)
api.add_router('/', categories_router)
api.add_router('/', cards_router)




@api.exception_handler(IntegrityError)
def integruty_error(request, exc):
    return api.create_response(
        request,
        {"details": f"Already exist: {exc}"},
        status=409
    )

@api.exception_handler(ValueError)
def value_error(request, exc):
    return api.create_response(
        request,
        {"details": f"Value is not valid: {exc}"},
        status=400
    )


@api.exception_handler(Http404)
def handle_404(request, exc):
    return api.create_response(
        request,
        {"details": "Not found or data is not correct"},
        status=400
    )

@api.exception_handler(ValidationError)
def handle_validation_error(request, exc):
    return api.create_response(
        request,
        {"details": f"Some data is not valid: {exc}"},
        status=400
    )