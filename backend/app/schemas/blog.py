"""Pydantic schemas for blog models."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Blog Category Schemas
class BlogCategoryBase(BaseModel):
    """Base blog category schema."""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class BlogCategoryCreate(BlogCategoryBase):
    """Schema for creating a blog category."""
    pass


class BlogCategoryUpdate(BaseModel):
    """Schema for updating a blog category."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class BlogCategoryResponse(BlogCategoryBase):
    """Schema for blog category response."""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Blog Post Schemas
class BlogPostBase(BaseModel):
    """Base blog post schema."""
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    excerpt: Optional[str] = None
    content: str = Field(..., min_length=1)
    featured_image: Optional[str] = None
    author_name: Optional[str] = None
    author_image: Optional[str] = None
    read_time: Optional[int] = None
    is_featured: bool = False
    is_published: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    category_id: Optional[str] = None


class BlogPostCreate(BlogPostBase):
    """Schema for creating a blog post."""
    pass


class BlogPostUpdate(BaseModel):
    """Schema for updating a blog post."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    excerpt: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    featured_image: Optional[str] = None
    author_name: Optional[str] = None
    author_image: Optional[str] = None
    read_time: Optional[int] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    category_id: Optional[str] = None


class BlogPostResponse(BlogPostBase):
    """Schema for blog post response."""
    id: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[BlogCategoryResponse] = None

    class Config:
        from_attributes = True


class BlogPostListResponse(BaseModel):
    """Schema for paginated blog posts list."""
    posts: list[BlogPostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Blog Comment Schemas
class BlogCommentBase(BaseModel):
    """Base blog comment schema."""
    content: str = Field(..., min_length=1)
    parent_comment_id: Optional[str] = None


class BlogCommentCreate(BlogCommentBase):
    """Schema for creating a blog comment."""
    pass


class BlogCommentUpdate(BaseModel):
    """Schema for updating a blog comment."""
    content: Optional[str] = Field(None, min_length=1)
    is_approved: Optional[bool] = None


class BlogCommentUserInfo(BaseModel):
    """Schema for user info in comment response."""
    id: str
    full_name: str
    email: str
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class BlogCommentResponse(BlogCommentBase):
    """Schema for blog comment response."""
    id: str
    blog_post_id: str
    user_id: str
    user: BlogCommentUserInfo
    is_approved: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    replies: list['BlogCommentResponse'] = []

    class Config:
        from_attributes = True


# Update forward reference
BlogCommentResponse.model_rebuild()


class BlogCommentListResponse(BaseModel):
    """Schema for paginated blog comments list."""
    comments: list[BlogCommentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
