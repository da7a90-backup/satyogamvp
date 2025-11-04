"""Blog API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional
from datetime import datetime
import os
import uuid
from slugify import slugify

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin
from app.models.blog import BlogPost, BlogCategory
from app.models.user import User
from app.schemas.blog import (
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    BlogPostListResponse,
    BlogCategoryCreate,
    BlogCategoryUpdate,
    BlogCategoryResponse,
)

router = APIRouter()

# Upload directory for blog images
UPLOAD_DIR = "public/uploads/blog"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Blog Categories Endpoints
@router.get("/categories", response_model=list[BlogCategoryResponse])
def get_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get all blog categories."""
    categories = db.query(BlogCategory).offset(skip).limit(limit).all()
    return categories


@router.post(
    "/categories",
    response_model=BlogCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category: BlogCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new blog category (admin only)."""
    # Check if category with same name or slug exists
    existing = db.query(BlogCategory).filter(
        or_(
            BlogCategory.name == category.name,
            BlogCategory.slug == category.slug
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name or slug already exists"
        )

    db_category = BlogCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/categories/{category_id}", response_model=BlogCategoryResponse)
def update_category(
    category_id: str,
    category: BlogCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update a blog category (admin only)."""
    db_category = db.query(BlogCategory).filter(BlogCategory.id == category_id).first()

    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    update_data = category.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)

    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a blog category (admin only)."""
    db_category = db.query(BlogCategory).filter(BlogCategory.id == category_id).first()

    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    db.delete(db_category)
    db.commit()


# Blog Posts Endpoints
@router.get("/posts", response_model=BlogPostListResponse)
def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_published: Optional[bool] = True,  # Default to only published posts
    db: Session = Depends(get_db),
):
    """Get all blog posts with pagination and filters."""
    query = db.query(BlogPost)

    # Apply filters
    if search:
        query = query.filter(
            or_(
                BlogPost.title.ilike(f"%{search}%"),
                BlogPost.excerpt.ilike(f"%{search}%"),
                BlogPost.content.ilike(f"%{search}%"),
            )
        )

    if category_id:
        query = query.filter(BlogPost.category_id == category_id)

    if is_featured is not None:
        query = query.filter(BlogPost.is_featured == is_featured)

    if is_published is not None:
        query = query.filter(BlogPost.is_published == is_published)

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    posts = (
        query
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = (total + page_size - 1) // page_size

    return BlogPostListResponse(
        posts=posts,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/posts/slug/{slug}", response_model=BlogPostResponse)
def get_post_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get a single blog post by slug."""
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    # Only show published posts to non-admin users
    # (Admin check would need to be added for preview functionality)
    if not post.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    return post


@router.get("/posts/{post_id}", response_model=BlogPostResponse)
def get_post(
    post_id: str,
    db: Session = Depends(get_db),
):
    """Get a single blog post by ID."""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    return post


@router.post(
    "/posts",
    response_model=BlogPostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    post: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new blog post (admin only)."""
    # Check if post with same slug exists
    existing = db.query(BlogPost).filter(BlogPost.slug == post.slug).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog post with this slug already exists"
        )

    # Create post
    post_data = post.model_dump()
    
    # Set published_at if publishing
    if post_data.get("is_published") and not post_data.get("published_at"):
        post_data["published_at"] = datetime.now()

    db_post = BlogPost(**post_data)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/posts/{post_id}", response_model=BlogPostResponse)
def update_post(
    post_id: str,
    post: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update a blog post (admin only)."""
    db_post = db.query(BlogPost).filter(BlogPost.id == post_id).first()

    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    update_data = post.model_dump(exclude_unset=True)
    
    # Set published_at if publishing for the first time
    if update_data.get("is_published") and not db_post.published_at:
        update_data["published_at"] = datetime.now()
    
    # Clear published_at if unpublishing
    if "is_published" in update_data and not update_data["is_published"]:
        update_data["published_at"] = None

    for field, value in update_data.items():
        setattr(db_post, field, value)

    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a blog post (admin only)."""
    db_post = db.query(BlogPost).filter(BlogPost.id == post_id).first()

    if not db_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    db.delete(db_post)
    db.commit()


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
):
    """Upload an image for blog posts (admin only)."""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed"
        )

    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Return URL
    file_url = f"/uploads/blog/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}
