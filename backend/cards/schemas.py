from ninja import Router, Schema, Field
from typing import Optional


class CreateCard(Schema):
    name: str = Field(..., min_length=1, required=True)
    price: str = Field(..., min_length=1, required=True)
    img: str = Field(..., min_length=1, required=True)
    
    target_url: str = Field(..., min_length=1, required=True)
    category: str = Field(..., min_length=1, required=True)
    shutdown_time: str = Field(..., min_length=1, required=True)
class AddFavor(Schema):
    card_id: int = Field(..., required=True)

class Error(Schema):
    details: str


class StatusOK(Schema):
    status: str

class CardSchema(Schema):
    id: int
    name: str
    category: str
    price: int
    url: str
    image: str


class UpdateCardSchema(Schema):
    id: int
    name: Optional[str]
    category: Optional[str]
    price: Optional[int]
    url: Optional[str]
    image: Optional[str]
