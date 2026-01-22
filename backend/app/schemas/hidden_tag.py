"""
Pydantic schemas for Hidden Tags
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from app.models.hidden_tag import EntityType


# Base schema with common fields
class HiddenTagBase(BaseModel):
    entity_id: UUID = Field(..., description="ID of the teaching/blog/product/retreat/event")
    entity_type: EntityType = Field(..., description="Type of entity (teaching, blog, product, retreat, event)")
    page_tag: str = Field(..., description="Page tag (e.g., 'homepage/teachings', 'about/satyoga/blog')")
    order_index: int = Field(default=0, description="Order within the page section")


# Schema for creating a new hidden tag
class HiddenTagCreate(HiddenTagBase):
    pass


# Schema for updating a hidden tag
class HiddenTagUpdate(BaseModel):
    entity_id: Optional[UUID] = None
    entity_type: Optional[EntityType] = None
    page_tag: Optional[str] = None
    order_index: Optional[int] = None


# Schema for response (includes all fields)
class HiddenTagResponse(HiddenTagBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Schema for bulk operations
class HiddenTagBulkCreate(BaseModel):
    tags: List[HiddenTagCreate]


# Schema for reordering tags within a page section
class HiddenTagReorder(BaseModel):
    tag_id: UUID
    new_order_index: int


class HiddenTagReorderBulk(BaseModel):
    page_tag: str
    reorders: List[HiddenTagReorder]


# Schema for response with entity details (enriched with actual entity data)
class HiddenTagWithEntity(HiddenTagResponse):
    """
    Response that includes the actual entity data (teaching, blog, product, etc.)
    This is used when fetching tags for display on marketing pages
    """
    entity_data: dict = Field(default_factory=dict, description="Full entity data from the respective table")

    class Config:
        from_attributes = True
