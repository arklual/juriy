from ninja import Schema, Field, ModelSchema
from categories.models import Category

class CategorySchema(Schema):
    title: str

class CategoryInBody(Schema):
    category_name: str = Field(..., required=True)

class StatusOK(Schema):
    status: str

class Error(Schema):
    details: str
