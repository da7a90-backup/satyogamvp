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
from app.models.blog_comment import BlogComment
from app.models.user import User
from app.schemas.blog import (
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    BlogPostListResponse,
    BlogCategoryCreate,
    BlogCategoryUpdate,
    BlogCategoryResponse,
    BlogCommentCreate,
    BlogCommentUpdate,
    BlogCommentResponse,
    BlogCommentListResponse,
)
from app.services.media_service import MediaService

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
@router.get("/posts")
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

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Build response with resolved media paths
    posts_data = []
    for post in posts:
        post_data = {
            "id": str(post.id),
            "slug": post.slug,
            "title": post.title,
            "excerpt": post.excerpt,
            "content": post.content,
            "featured_image": post.featured_image,
            "author_name": post.author_name,
            "author_image": post.author_image,
            "category_id": post.category_id,
            "category": {"id": post.category.id, "name": post.category.name, "slug": post.category.slug} if post.category else None,
            "read_time": post.read_time,
            "is_featured": post.is_featured,
            "is_published": post.is_published,
            "published_at": post.published_at.isoformat() if post.published_at else None,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "updated_at": post.updated_at.isoformat() if post.updated_at else None,
        }

        # Resolve all media paths to CDN URLs
        post_data = media_service.resolve_dict(post_data)
        posts_data.append(post_data)

    return {
        "posts": posts_data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/posts/slug/{slug}")
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

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Build response with resolved media paths
    post_data = {
        "id": str(post.id),
        "slug": post.slug,
        "title": post.title,
        "excerpt": post.excerpt,
        "content": post.content,
        "featured_image": post.featured_image,
        "author_name": post.author_name,
        "author_image": post.author_image,
        "category_id": post.category_id,
        "category": {"id": post.category.id, "name": post.category.name, "slug": post.category.slug} if post.category else None,
        "read_time": post.read_time,
        "is_featured": post.is_featured,
        "is_published": post.is_published,
        "published_at": post.published_at.isoformat() if post.published_at else None,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
    }

    # Resolve all media paths to CDN URLs
    post_data = media_service.resolve_dict(post_data)

    return post_data


@router.get("/posts/{post_id}")
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

    # Initialize media service for CDN URL resolution
    media_service = MediaService(db)

    # Build response with resolved media paths
    post_data = {
        "id": str(post.id),
        "slug": post.slug,
        "title": post.title,
        "excerpt": post.excerpt,
        "content": post.content,
        "featured_image": post.featured_image,
        "author_name": post.author_name,
        "author_image": post.author_image,
        "category_id": post.category_id,
        "category": {"id": post.category.id, "name": post.category.name, "slug": post.category.slug} if post.category else None,
        "read_time": post.read_time,
        "is_featured": post.is_featured,
        "is_published": post.is_published,
        "published_at": post.published_at.isoformat() if post.published_at else None,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
    }

    # Resolve all media paths to CDN URLs
    post_data = media_service.resolve_dict(post_data)

    return post_data


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


# Blog Comments Endpoints
@router.get("/posts/{post_id}/comments")
def get_post_comments(
    post_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    include_unapproved: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Get all comments for a blog post with pagination."""
    # Verify post exists
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    query = db.query(BlogComment).filter(
        BlogComment.blog_post_id == post_id,
        BlogComment.parent_comment_id == None  # Only get top-level comments
    )

    # Only show approved comments unless user is admin
    if not (current_user and current_user.role == "admin") and not include_unapproved:
        query = query.filter(BlogComment.is_approved == True)

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    comments = (
        query
        .order_by(BlogComment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = (total + page_size - 1) // page_size

    # Build response with nested replies
    comments_data = []
    for comment in comments:
        comment_dict = {
            "id": str(comment.id),
            "blog_post_id": str(comment.blog_post_id),
            "user_id": str(comment.user_id),
            "user": {
                "id": str(comment.user.id),
                "full_name": comment.user.full_name,
                "email": comment.user.email,
                "profile_image": comment.user.profile_image
            },
            "content": comment.content,
            "is_approved": comment.is_approved,
            "parent_comment_id": None,
            "created_at": comment.created_at.isoformat() if comment.created_at else None,
            "updated_at": comment.updated_at.isoformat() if comment.updated_at else None,
            "replies": []
        }

        # Get replies for this comment
        replies = db.query(BlogComment).filter(
            BlogComment.parent_comment_id == comment.id
        ).order_by(BlogComment.created_at.asc()).all()

        for reply in replies:
            if reply.is_approved or (current_user and current_user.role == "admin"):
                reply_dict = {
                    "id": str(reply.id),
                    "blog_post_id": str(reply.blog_post_id),
                    "user_id": str(reply.user_id),
                    "user": {
                        "id": str(reply.user.id),
                        "full_name": reply.user.full_name,
                        "email": reply.user.email,
                        "profile_image": reply.user.profile_image
                    },
                    "content": reply.content,
                    "is_approved": reply.is_approved,
                    "parent_comment_id": str(reply.parent_comment_id),
                    "created_at": reply.created_at.isoformat() if reply.created_at else None,
                    "updated_at": reply.updated_at.isoformat() if reply.updated_at else None,
                    "replies": []
                }
                comment_dict["replies"].append(reply_dict)

        comments_data.append(comment_dict)

    return {
        "comments": comments_data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post(
    "/posts/{post_id}/comments",
    response_model=BlogCommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: str,
    comment: BlogCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new comment on a blog post (authenticated users only)."""
    # Verify post exists
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    # If replying to a comment, verify parent exists
    if comment.parent_comment_id:
        parent = db.query(BlogComment).filter(
            BlogComment.id == comment.parent_comment_id
        ).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent comment not found"
            )

    # Create comment
    db_comment = BlogComment(
        blog_post_id=post_id,
        user_id=current_user.id,
        content=comment.content,
        parent_comment_id=comment.parent_comment_id,
        is_approved=False  # Comments require approval by default
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return db_comment


@router.put("/comments/{comment_id}", response_model=BlogCommentResponse)
def update_comment(
    comment_id: str,
    comment: BlogCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a comment (author or admin only)."""
    db_comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()

    if not db_comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Check authorization: only comment author or admin can update
    if db_comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment"
        )

    update_data = comment.model_dump(exclude_unset=True)

    # Only admins can approve comments
    if "is_approved" in update_data and current_user.role != "admin":
        del update_data["is_approved"]

    for field, value in update_data.items():
        setattr(db_comment, field, value)

    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a comment (author or admin only)."""
    db_comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()

    if not db_comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Check authorization: only comment author or admin can delete
    if db_comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )

    db.delete(db_comment)
    db.commit()


@router.put("/comments/{comment_id}/approve", response_model=BlogCommentResponse)
def approve_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Approve a comment (admin only)."""
    db_comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()

    if not db_comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    db_comment.is_approved = True
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.get("/comments", response_model=BlogCommentListResponse)
def get_all_comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_approved: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all comments across all posts (admin only) with pagination."""
    query = db.query(BlogComment)

    if is_approved is not None:
        query = query.filter(BlogComment.is_approved == is_approved)

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    comments = (
        query
        .order_by(BlogComment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = (total + page_size - 1) // page_size

    return {
        "comments": comments,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
