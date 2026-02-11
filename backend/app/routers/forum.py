"""Forum API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from typing import Optional, List
from datetime import datetime, timedelta
from slugify import slugify
import uuid
import os
import shutil

from app.core.database import get_db
from app.core.deps import get_forum_user, get_current_admin, get_current_user, get_optional_user
from app.models.user import User
from app.models.forum import (
    ForumCategory,
    ForumThread,
    ForumPost,
    ForumPostReaction,
    ForumPostAttachment,
    ForumReport,
    ForumUserBan,
    ForumMention,
    ReactionType,
    ReportStatus,
)
from app.schemas.forum import (
    # Category schemas
    ForumCategoryCreate,
    ForumCategoryUpdate,
    ForumCategoryResponse,
    ForumCategoryListResponse,
    # Thread schemas
    ForumThreadCreate,
    ForumThreadUpdate,
    ForumThreadSummary,
    ForumThreadResponse,
    ForumThreadDetail,
    ForumThreadListResponse,
    # Post schemas
    ForumPostCreate,
    ForumPostUpdate,
    ForumPostResponse,
    ForumPostListResponse,
    # Reaction schemas
    ForumReactionCreate,
    # Report schemas
    ForumReportCreate,
    ForumReportUpdate,
    ForumReportResponse,
    ForumReportListResponse,
    # Ban schemas
    ForumBanCreate,
    ForumBanResponse,
    # Mention schemas
    ForumMentionResponse,
    ForumMentionListResponse,
    # Moderation schemas
    ForumModerationAction,
    # User summary
    ForumUserSummary,
)

router = APIRouter()

# Upload directory for forum attachments
UPLOAD_DIR = "public/uploads/forum"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper function to build nested post structure
def build_nested_posts(posts: List[ForumPost], current_user_id: Optional[str], db: Session) -> List[dict]:
    """Build nested post structure for thread detail view."""
    # Create a dictionary of posts by ID
    post_dict = {str(post.id): post for post in posts}
    root_posts = []

    for post in posts:
        # Get reaction counts
        reaction_counts = {}
        for reaction in post.reactions:
            reaction_type = reaction.reaction_type.value
            reaction_counts[reaction_type] = reaction_counts.get(reaction_type, 0) + 1

        # Get user's reaction (only if logged in)
        user_reaction = None
        if current_user_id:
            for reaction in post.reactions:
                if str(reaction.user_id) == current_user_id:
                    user_reaction = reaction.reaction_type.value
                    break

        # Count direct replies
        reply_count = len([p for p in posts if p.parent_post_id == post.id])

        # Check permissions (only if logged in)
        can_edit = current_user_id and str(post.user_id) == current_user_id and not post.is_deleted
        can_delete = False
        if current_user_id:
            can_delete = str(post.user_id) == current_user_id or db.query(User).filter(
                User.id == current_user_id, User.is_admin == True
            ).first() is not None

        # Build post data
        post_data = {
            "id": str(post.id),
            "thread_id": str(post.thread_id),
            "user": {
                "id": str(post.user.id),
                "name": post.user.name,
                "membership_tier": post.user.membership_tier.value,
            },
            "parent_post_id": str(post.parent_post_id) if post.parent_post_id else None,
            "content": post.content if not post.is_deleted else "[This post has been deleted]",
            "is_deleted": post.is_deleted,
            "is_edited": post.is_edited,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "edited_at": post.edited_at,
            "reaction_counts": reaction_counts,
            "user_reaction": user_reaction,
            "reply_count": reply_count,
            "replies": [],
            "attachments": [
                {
                    "id": str(att.id),
                    "file_url": att.file_url,
                    "file_name": att.file_name,
                    "file_type": att.file_type,
                    "file_size": att.file_size,
                    "created_at": att.created_at,
                }
                for att in post.attachments
            ],
            "can_edit": can_edit,
            "can_delete": can_delete,
        }

        if post.parent_post_id is None:
            root_posts.append(post_data)
        else:
            parent_id = str(post.parent_post_id)
            if parent_id in post_dict:
                parent_data = next((p for p in root_posts if p["id"] == parent_id), None)
                if parent_data:
                    parent_data["replies"].append(post_data)

    return root_posts


# ============================================================================
# FILE UPLOAD ENDPOINTS
# ============================================================================

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_forum_user),
):
    """Upload a file/image for forum posts."""
    # Validate file type
    allowed_types = {
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
        "application/pdf", "text/plain"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed. Allowed types: images (jpg, png, gif, webp), PDF, text"
        )

    # Validate file size (max 10MB)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start

    max_size = 10 * 1024 * 1024  # 10MB
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size {file_size} exceeds maximum allowed size of {max_size} bytes (10MB)"
        )

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

    # Return file URL (relative path)
    file_url = f"/uploads/forum/{unique_filename}"

    return {
        "url": file_url,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": file_size,
    }


# ============================================================================
# CATEGORY ENDPOINTS
# ============================================================================

@router.get("/categories", response_model=ForumCategoryListResponse)
def get_categories(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get all active forum categories with thread counts (public endpoint)."""
    categories = db.query(ForumCategory).filter(
        ForumCategory.is_active == True
    ).order_by(ForumCategory.order).all()

    category_data = []
    for category in categories:
        # Count threads
        thread_count = db.query(func.count(ForumThread.id)).filter(
            ForumThread.category_id == category.id
        ).scalar() or 0

        # Count posts in threads
        post_count = db.query(func.count(ForumPost.id)).join(
            ForumThread, ForumPost.thread_id == ForumThread.id
        ).filter(ForumThread.category_id == category.id).scalar() or 0

        # Get latest thread
        latest_thread = db.query(ForumThread).filter(
            ForumThread.category_id == category.id
        ).order_by(desc(ForumThread.last_post_at)).first()

        category_response = {
            "id": str(category.id),
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "icon": category.icon,
            "order": category.order,
            "is_active": category.is_active,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "thread_count": thread_count,
            "post_count": post_count,
            "latest_thread": {
                "id": str(latest_thread.id),
                "title": latest_thread.title,
                "slug": latest_thread.slug,
                "user": {
                    "id": str(latest_thread.user.id),
                    "name": latest_thread.user.name,
                    "membership_tier": latest_thread.user.membership_tier.value,
                },
                "is_pinned": latest_thread.is_pinned,
                "is_locked": latest_thread.is_locked,
                "view_count": latest_thread.view_count,
                "post_count": latest_thread.post_count,
                "created_at": latest_thread.created_at,
                "last_post_at": latest_thread.last_post_at,
            } if latest_thread else None,
        }
        category_data.append(category_response)

    return {"categories": category_data, "total": len(category_data)}


@router.post(
    "/categories",
    response_model=ForumCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category: ForumCategoryCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Create a new forum category (admin only)."""
    # Check if category exists
    existing = db.query(ForumCategory).filter(
        or_(
            ForumCategory.name == category.name,
            ForumCategory.slug == category.slug
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name or slug already exists"
        )

    db_category = ForumCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return {
        **db_category.__dict__,
        "thread_count": 0,
        "post_count": 0,
        "latest_thread": None,
    }


@router.get("/categories/{category_id}", response_model=ForumCategoryResponse)
def get_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get a single category by ID (public endpoint)."""
    category = db.query(ForumCategory).filter(ForumCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Count threads and posts
    thread_count = db.query(func.count(ForumThread.id)).filter(
        ForumThread.category_id == category.id
    ).scalar() or 0

    post_count = db.query(func.count(ForumPost.id)).join(
        ForumThread, ForumPost.thread_id == ForumThread.id
    ).filter(ForumThread.category_id == category.id).scalar() or 0

    latest_thread = db.query(ForumThread).filter(
        ForumThread.category_id == category.id
    ).order_by(desc(ForumThread.last_post_at)).first()

    return {
        **category.__dict__,
        "thread_count": thread_count,
        "post_count": post_count,
        "latest_thread": latest_thread,
    }


# ============================================================================
# THREAD ENDPOINTS
# ============================================================================

@router.get("/threads", response_model=ForumThreadListResponse)
def get_threads(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get threads with pagination, filtering, and search (public endpoint)."""
    query = db.query(ForumThread)

    # Filter by category
    if category_id:
        query = query.filter(ForumThread.category_id == category_id)

    # Search
    if search:
        query = query.filter(ForumThread.title.ilike(f"%{search}%"))

    # Order: pinned first, then by last post date
    query = query.order_by(desc(ForumThread.is_pinned), desc(ForumThread.last_post_at))

    # Count total
    total = query.count()

    # Paginate
    threads = query.offset(skip).limit(limit).all()

    thread_summaries = [
        {
            "id": str(thread.id),
            "title": thread.title,
            "slug": thread.slug,
            "user": {
                "id": str(thread.user.id),
                "name": thread.user.name,
                "membership_tier": thread.user.membership_tier.value,
            },
            "is_pinned": thread.is_pinned,
            "is_locked": thread.is_locked,
            "view_count": thread.view_count,
            "post_count": thread.post_count,
            "created_at": thread.created_at,
            "last_post_at": thread.last_post_at,
        }
        for thread in threads
    ]

    return {
        "threads": thread_summaries,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.post(
    "/threads",
    response_model=ForumThreadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_thread(
    thread: ForumThreadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Create a new forum thread with initial post."""
    # Verify category exists
    category = db.query(ForumCategory).filter(ForumCategory.id == thread.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Create slug from title
    base_slug = slugify(thread.title)
    slug = base_slug
    counter = 1
    while db.query(ForumThread).filter(ForumThread.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Create thread
    db_thread = ForumThread(
        category_id=thread.category_id,
        user_id=current_user.id,
        title=thread.title,
        slug=slug,
    )
    db.add(db_thread)
    db.flush()

    # Create initial post
    db_post = ForumPost(
        thread_id=db_thread.id,
        user_id=current_user.id,
        content=thread.initial_post_content,
    )
    db.add(db_post)

    # Update thread post count
    db_thread.post_count = 1

    db.commit()
    db.refresh(db_thread)

    return {
        "id": str(db_thread.id),
        "title": db_thread.title,
        "slug": db_thread.slug,
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "membership_tier": current_user.membership_tier.value,
        },
        "is_pinned": db_thread.is_pinned,
        "is_locked": db_thread.is_locked,
        "view_count": db_thread.view_count,
        "post_count": db_thread.post_count,
        "created_at": db_thread.created_at,
        "last_post_at": db_thread.last_post_at,
        "category": category,
        "updated_at": db_thread.updated_at,
    }


@router.get("/threads/{thread_id}", response_model=ForumThreadDetail)
def get_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get thread details with all posts (public endpoint, but posting requires auth)."""
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    # Increment view count
    thread.view_count += 1
    db.commit()

    # Get all posts for this thread
    posts = db.query(ForumPost).filter(
        ForumPost.thread_id == thread_id
    ).order_by(ForumPost.created_at).all()

    # Build nested structure
    current_user_id = str(current_user.id) if current_user else None
    nested_posts = build_nested_posts(posts, current_user_id, db)

    return {
        "id": str(thread.id),
        "title": thread.title,
        "slug": thread.slug,
        "user": {
            "id": str(thread.user.id),
            "name": thread.user.name,
            "membership_tier": thread.user.membership_tier.value,
        },
        "is_pinned": thread.is_pinned,
        "is_locked": thread.is_locked,
        "view_count": thread.view_count,
        "post_count": thread.post_count,
        "created_at": thread.created_at,
        "last_post_at": thread.last_post_at,
        "category": thread.category,
        "updated_at": thread.updated_at,
        "posts": nested_posts,
    }


@router.patch("/threads/{thread_id}", response_model=ForumThreadResponse)
def update_thread(
    thread_id: str,
    thread_update: ForumThreadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Update a thread (own thread or admin)."""
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    # Check permissions
    if str(thread.user_id) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to edit this thread")

    # Update fields
    update_data = thread_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "title":
            # Regenerate slug if title changed
            thread.slug = slugify(value)
        setattr(thread, field, value)

    db.commit()
    db.refresh(thread)

    return thread


@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Delete a thread (own thread or admin)."""
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    # Check permissions
    if str(thread.user_id) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this thread")

    db.delete(thread)
    db.commit()


@router.post("/threads/{thread_id}/pin", response_model=ForumThreadResponse)
def toggle_pin_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Pin/unpin a thread (admin only)."""
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    thread.is_pinned = not thread.is_pinned
    db.commit()
    db.refresh(thread)

    return thread


@router.post("/threads/{thread_id}/lock", response_model=ForumThreadResponse)
def toggle_lock_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Lock/unlock a thread (admin only)."""
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    thread.is_locked = not thread.is_locked
    db.commit()
    db.refresh(thread)

    return thread


# ============================================================================
# POST ENDPOINTS
# ============================================================================

@router.post(
    "/posts",
    response_model=ForumPostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    post: ForumPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Create a new post or reply."""
    # Verify thread exists
    thread = db.query(ForumThread).filter(ForumThread.id == post.thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    # Check if thread is locked
    if thread.is_locked and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="This thread is locked")

    # Verify parent post exists if replying
    if post.parent_post_id:
        parent = db.query(ForumPost).filter(ForumPost.id == post.parent_post_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent post not found")

    # Create post
    db_post = ForumPost(
        thread_id=post.thread_id,
        user_id=current_user.id,
        parent_post_id=post.parent_post_id,
        content=post.content,
    )
    db.add(db_post)
    db.flush()

    # Create attachments if provided
    attachments_list = []
    if post.attachments:
        for att_data in post.attachments:
            # att_data should be a dict with url, filename, content_type, size
            if isinstance(att_data, str):
                # If it's just a URL, create attachment with minimal info
                attachment = ForumPostAttachment(
                    post_id=db_post.id,
                    file_url=att_data,
                    file_name="attachment",
                    file_type="unknown",
                    file_size=0,
                )
            else:
                # Full attachment data
                attachment = ForumPostAttachment(
                    post_id=db_post.id,
                    file_url=att_data.get('url', att_data),
                    file_name=att_data.get('filename', 'attachment'),
                    file_type=att_data.get('content_type', 'unknown'),
                    file_size=att_data.get('size', 0),
                )
            db.add(attachment)
            attachments_list.append(attachment)

    # Create mentions if provided
    if post.mentioned_user_ids:
        for user_id in post.mentioned_user_ids:
            mention = ForumMention(
                post_id=db_post.id,
                mentioned_user_id=user_id,
            )
            db.add(mention)

    # Update thread stats
    thread.post_count += 1
    thread.last_post_at = datetime.utcnow()

    db.commit()
    db.refresh(db_post)

    return {
        "id": str(db_post.id),
        "thread_id": str(db_post.thread_id),
        "user": {
            "id": str(current_user.id),
            "name": current_user.name,
            "membership_tier": current_user.membership_tier.value,
        },
        "parent_post_id": str(db_post.parent_post_id) if db_post.parent_post_id else None,
        "content": db_post.content,
        "is_deleted": db_post.is_deleted,
        "is_edited": db_post.is_edited,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
        "edited_at": db_post.edited_at,
        "reaction_counts": {},
        "user_reaction": None,
        "reply_count": 0,
        "replies": [],
        "attachments": [],
        "can_edit": True,
        "can_delete": True,
    }


@router.patch("/posts/{post_id}", response_model=ForumPostResponse)
def update_post(
    post_id: str,
    post_update: ForumPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Update a post (own post, within 15 minutes)."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check ownership
    if str(post.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")

    # Check 15-minute edit window
    time_since_creation = datetime.utcnow() - post.created_at
    if time_since_creation > timedelta(minutes=15) and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Posts can only be edited within 15 minutes of creation"
        )

    # Update content
    post.content = post_update.content
    post.is_edited = True
    post.edited_at = datetime.utcnow()

    db.commit()
    db.refresh(post)

    return post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Delete a post (own post or admin). Soft delete to preserve thread structure."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check permissions
    if str(post.user_id) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    # Soft delete
    post.is_deleted = True
    post.content = "[This post has been deleted]"

    db.commit()


# ============================================================================
# REACTION ENDPOINTS
# ============================================================================

@router.post("/posts/{post_id}/react", response_model=dict)
def toggle_reaction(
    post_id: str,
    reaction_type: ReactionType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Toggle a reaction on a post."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if user already reacted with this type
    existing = db.query(ForumPostReaction).filter(
        ForumPostReaction.post_id == post_id,
        ForumPostReaction.user_id == current_user.id,
        ForumPostReaction.reaction_type == reaction_type,
    ).first()

    if existing:
        # Remove reaction
        db.delete(existing)
        db.commit()
        return {"message": "Reaction removed", "action": "removed"}
    else:
        # Add reaction (remove any other reaction types first)
        db.query(ForumPostReaction).filter(
            ForumPostReaction.post_id == post_id,
            ForumPostReaction.user_id == current_user.id,
        ).delete()

        new_reaction = ForumPostReaction(
            post_id=post_id,
            user_id=current_user.id,
            reaction_type=reaction_type,
        )
        db.add(new_reaction)
        db.commit()
        return {"message": "Reaction added", "action": "added", "reaction_type": reaction_type.value}


# ============================================================================
# REPORT ENDPOINTS
# ============================================================================

@router.post("/reports", response_model=ForumReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report: ForumReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Report a post for moderation."""
    post = db.query(ForumPost).filter(ForumPost.id == report.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if user already reported this post
    existing = db.query(ForumReport).filter(
        ForumReport.post_id == report.post_id,
        ForumReport.reporter_id == current_user.id,
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You have already reported this post")

    db_report = ForumReport(
        post_id=report.post_id,
        reporter_id=current_user.id,
        reason=report.reason,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report


@router.get("/reports", response_model=ForumReportListResponse)
def get_reports(
    status_filter: Optional[ReportStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Get all reports (admin only)."""
    query = db.query(ForumReport)

    if status_filter:
        query = query.filter(ForumReport.status == status_filter)

    query = query.order_by(desc(ForumReport.created_at))

    total = query.count()
    reports = query.offset(skip).limit(limit).all()

    return {
        "reports": reports,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.patch("/reports/{report_id}", response_model=ForumReportResponse)
def update_report(
    report_id: str,
    report_update: ForumReportUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Update a report status (admin only)."""
    report = db.query(ForumReport).filter(ForumReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = report_update.status
    if report_update.admin_notes:
        report.admin_notes = report_update.admin_notes

    if report_update.status in [ReportStatus.RESOLVED, ReportStatus.DISMISSED]:
        report.resolved_by = current_admin.id
        report.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(report)

    return report


# ============================================================================
# BAN ENDPOINTS (Admin)
# ============================================================================

@router.post("/bans", response_model=ForumBanResponse, status_code=status.HTTP_201_CREATED)
def ban_user(
    ban: ForumBanCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Ban a user from the forum (admin only)."""
    # Verify user exists
    user = db.query(User).filter(User.id == ban.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already banned
    existing_ban = db.query(ForumUserBan).filter(
        ForumUserBan.user_id == ban.user_id,
        (ForumUserBan.is_permanent == True) | (ForumUserBan.expires_at > datetime.utcnow())
    ).first()

    if existing_ban:
        raise HTTPException(status_code=400, detail="User is already banned")

    db_ban = ForumUserBan(
        user_id=ban.user_id,
        banned_by=current_admin.id,
        reason=ban.reason,
        is_permanent=ban.is_permanent,
        expires_at=ban.expires_at,
    )
    db.add(db_ban)
    db.commit()
    db.refresh(db_ban)

    return db_ban


@router.delete("/bans/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def unban_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Remove all active bans for a user (admin only)."""
    bans = db.query(ForumUserBan).filter(
        ForumUserBan.user_id == user_id,
        (ForumUserBan.is_permanent == True) | (ForumUserBan.expires_at > datetime.utcnow())
    ).all()

    for ban in bans:
        db.delete(ban)

    db.commit()


# ============================================================================
# MENTION ENDPOINTS
# ============================================================================

@router.get("/mentions", response_model=ForumMentionListResponse)
def get_mentions(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Get user's mentions/notifications."""
    query = db.query(ForumMention).filter(
        ForumMention.mentioned_user_id == current_user.id
    )

    if unread_only:
        query = query.filter(ForumMention.is_read == False)

    mentions = query.order_by(desc(ForumMention.created_at)).all()
    unread_count = db.query(func.count(ForumMention.id)).filter(
        ForumMention.mentioned_user_id == current_user.id,
        ForumMention.is_read == False,
    ).scalar()

    return {
        "mentions": mentions,
        "unread_count": unread_count,
        "total": len(mentions),
    }


@router.patch("/mentions/{mention_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_mention_read(
    mention_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Mark a mention as read."""
    mention = db.query(ForumMention).filter(
        ForumMention.id == mention_id,
        ForumMention.mentioned_user_id == current_user.id,
    ).first()

    if not mention:
        raise HTTPException(status_code=404, detail="Mention not found")

    mention.is_read = True
    db.commit()


# ============================================================================
# USER ACTIVITY ENDPOINTS
# ============================================================================

@router.get("/my-threads", response_model=ForumThreadListResponse)
def get_my_threads(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Get current user's threads."""
    query = db.query(ForumThread).filter(
        ForumThread.user_id == current_user.id
    ).order_by(desc(ForumThread.created_at))

    total = query.count()
    threads = query.offset(skip).limit(limit).all()

    thread_summaries = [
        {
            "id": str(thread.id),
            "title": thread.title,
            "slug": thread.slug,
            "user": {
                "id": str(thread.user.id),
                "name": thread.user.name,
                "membership_tier": thread.user.membership_tier.value,
            },
            "is_pinned": thread.is_pinned,
            "is_locked": thread.is_locked,
            "view_count": thread.view_count,
            "post_count": thread.post_count,
            "created_at": thread.created_at,
            "last_post_at": thread.last_post_at,
        }
        for thread in threads
    ]

    return {
        "threads": thread_summaries,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/my-posts", response_model=ForumPostListResponse)
def get_my_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_forum_user),
):
    """Get current user's posts."""
    query = db.query(ForumPost).filter(
        ForumPost.user_id == current_user.id
    ).order_by(desc(ForumPost.created_at))

    total = query.count()
    posts = query.offset(skip).limit(limit).all()

    return {
        "posts": posts,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit,
    }
