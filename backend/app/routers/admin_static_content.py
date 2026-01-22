"""
Admin API for Managing Static Content (Pages, Sections, Media)
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.static_content import (
    PageSection, SectionContent, AccordionSection, AccordionItem,
    SectionTab, SectionDecoration, MediaAsset, OnlineRetreat
)
from app.services.media_service import MediaService
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import json
import httpx
from datetime import datetime

router = APIRouter()


# Pydantic schemas for admin updates
class SectionContentUpdate(BaseModel):
    # Text fields
    eyebrow: Optional[str] = None
    heading: Optional[str] = None
    subheading: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    quote: Optional[str] = None
    content: Optional[Dict[str, Any]] = None

    # Video/Hero
    video_url: Optional[str] = None
    video_thumbnail: Optional[str] = None
    video_type: Optional[str] = None
    logo_url: Optional[str] = None
    logo_alt: Optional[str] = None
    subtitle: Optional[str] = None

    # Images
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    background_image: Optional[str] = None
    background_decoration: Optional[str] = None
    image_gravity: Optional[str] = None
    secondary_images: Optional[Dict[str, Any]] = None

    # CTA
    button_text: Optional[str] = None
    button_link: Optional[str] = None

    # Layout
    gap: Optional[str] = None
    title_line_height: Optional[str] = None
    background_elements: Optional[Dict[str, Any]] = None


class PageSectionUpdate(BaseModel):
    section_type: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None
    content: Optional[SectionContentUpdate] = None


class AccordionItemUpdate(BaseModel):
    title: Optional[str] = None
    heading: Optional[str] = None
    content: Optional[str] = None
    paragraphs: Optional[List[str]] = None
    order_index: Optional[int] = None


class AccordionSectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tagline: Optional[str] = None
    type: Optional[str] = None
    gap: Optional[str] = None
    title_line_height: Optional[str] = None
    background_elements: Optional[Dict[str, Any]] = None
    order_index: Optional[int] = None
    items: Optional[List[AccordionItemUpdate]] = None


# Get all available pages
@router.get("/pages")
async def list_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Dict[str, List[str]]:
    """List all available pages for admin management"""

    pages_query = db.query(PageSection.page_slug).distinct().all()
    pages = [p[0] for p in pages_query]

    # Add accordion pages
    accordion_query = db.query(AccordionSection.page_slug).distinct().all()
    accordion_pages = [p[0] for p in accordion_query]

    all_pages = list(set(pages + accordion_pages))

    return {
        "pages": sorted(all_pages)
    }


# Get page structure for editing
@router.get("/pages/{page_slug}")
async def get_page_for_edit(
    page_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Get full page structure for admin editing with resolved CDN URLs"""

    # Initialize media service for URL resolution
    media_service = MediaService(db)

    # Get all sections
    sections = db.query(PageSection).filter(
        PageSection.page_slug == page_slug
    ).order_by(PageSection.order_index).all()

    # Get accordion sections
    accordion_sections = db.query(AccordionSection).filter(
        AccordionSection.page_slug == page_slug
    ).order_by(AccordionSection.order_index).all()

    result = {
        "page_slug": page_slug,
        "sections": [],
        "accordion_sections": []
    }

    # Build sections list
    for section in sections:
        section_data = {
            "id": section.id,
            "section_slug": section.section_slug,
            "section_type": section.section_type,
            "order_index": section.order_index,
            "is_active": section.is_active,
            "content": {}
        }

        if section.content:
            content = section.content
            section_data["content"] = {
                "id": content.id,
                # Text fields
                "eyebrow": content.eyebrow,
                "heading": content.heading,
                "subheading": content.subheading,
                "tagline": content.tagline,
                "description": content.description,
                "quote": content.quote,
                "content": content.content,
                # Video/Hero - resolve URLs through media service
                "video_url": media_service.resolve_url(content.video_url) if content.video_url else None,
                "video_thumbnail": media_service.resolve_url(content.video_thumbnail) if content.video_thumbnail else None,
                "video_type": content.video_type,
                "logo_url": media_service.resolve_url(content.logo_url) if content.logo_url else None,
                "logo_alt": content.logo_alt,
                "subtitle": content.subtitle,
                # Images - resolve URLs through media service
                "image_url": media_service.resolve_url(content.image_url) if content.image_url else None,
                "image_alt": content.image_alt,
                "background_image": media_service.resolve_url(content.background_image) if content.background_image else None,
                "background_decoration": media_service.resolve_url(content.background_decoration) if content.background_decoration else None,
                "image_gravity": content.image_gravity,
                "secondary_images": media_service.resolve_dict(content.secondary_images) if content.secondary_images else None,
                # CTA
                "button_text": content.button_text,
                "button_link": content.button_link,
                # Layout
                "gap": content.gap,
                "title_line_height": content.title_line_height,
                "background_elements": content.background_elements,
            }

        # Add tabs if any - resolve image URLs
        if section.tabs:
            section_data["tabs"] = [
                {
                    "id": tab.id,
                    "tab_id": tab.tab_id,
                    "label": tab.label,
                    "tagline": tab.tagline,
                    "title": tab.title,
                    "description": tab.description,
                    "button_text": tab.button_text,
                    "button_link": tab.button_link,
                    "image_url": media_service.resolve_url(tab.image_url) if tab.image_url else None,
                    "order_index": tab.order_index
                }
                for tab in section.tabs
            ]

        # Add decorations if any - resolve decoration URLs
        if section.decorations:
            section_data["decorations"] = [
                {
                    "id": dec.id,
                    "decoration_key": dec.decoration_key,
                    "decoration_url": media_service.resolve_url(dec.decoration_url) if dec.decoration_url else None
                }
                for dec in section.decorations
            ]

        result["sections"].append(section_data)

    # Build accordion sections
    for accordion in accordion_sections:
        accordion_data = {
            "id": accordion.id,
            "section_slug": accordion.section_slug,
            "title": accordion.title,
            "description": accordion.description,
            "tagline": accordion.tagline,
            "type": accordion.type,
            "gap": accordion.gap,
            "title_line_height": accordion.title_line_height,
            "background_elements": accordion.background_elements,
            "order_index": accordion.order_index,
            "items": [
                {
                    "id": item.id,
                    "item_id": item.item_id,
                    "title": item.title,
                    "heading": item.heading,
                    "content": item.content,
                    "paragraphs": item.paragraphs,
                    "order_index": item.order_index
                }
                for item in accordion.items
            ]
        }
        result["accordion_sections"].append(accordion_data)

    return result


# Update section content
@router.put("/sections/{section_id}")
async def update_section(
    section_id: int,
    section_update: PageSectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Update a page section with defensive field handling and logging"""

    section = db.query(PageSection).filter(PageSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    # Log the update for debugging
    print(f"[Admin Content] Updating section {section_id} ({section.page_slug}/{section.section_slug})")

    # Update section fields
    if section_update.section_type is not None:
        section.section_type = section_update.section_type
    if section_update.order_index is not None:
        section.order_index = section_update.order_index
    if section_update.is_active is not None:
        section.is_active = section_update.is_active

    section.updated_at = datetime.utcnow()

    # Update content if provided
    if section_update.content:
        if not section.content:
            # Create new content
            section.content = SectionContent(section_id=section.id)
            print(f"[Admin Content] Created new content for section {section_id}")

        content = section.content
        content_data = section_update.content.model_dump(exclude_unset=True)

        # Log which fields are being updated
        updated_fields = list(content_data.keys())
        print(f"[Admin Content] Updating fields: {updated_fields}")

        # Defensive update: only update fields that are explicitly set and not None
        for key, value in content_data.items():
            old_value = getattr(content, key, None)
            if value is not None or old_value is not None:
                setattr(content, key, value)
                if old_value != value:
                    print(f"[Admin Content]   {key}: {repr(old_value)} → {repr(value)}")

        content.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(section)

    print(f"[Admin Content] Section {section_id} updated successfully")

    return {
        "message": "Section updated successfully",
        "section_id": section.id,
        "page_slug": section.page_slug,
        "section_slug": section.section_slug,
        "cache_hint": "Changes may take up to 1 hour to appear due to caching. Visit /?preview=true to see changes immediately."
    }


# Update accordion section
@router.put("/accordion-sections/{accordion_id}")
async def update_accordion_section(
    accordion_id: int,
    accordion_update: AccordionSectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Update an accordion section"""

    accordion = db.query(AccordionSection).filter(AccordionSection.id == accordion_id).first()
    if not accordion:
        raise HTTPException(status_code=404, detail="Accordion section not found")

    # Update accordion fields
    update_data = accordion_update.model_dump(exclude_unset=True, exclude={"items"})
    for key, value in update_data.items():
        setattr(accordion, key, value)

    # Update items if provided
    if accordion_update.items is not None:
        # Clear existing items
        for item in accordion.items:
            db.delete(item)

        # Add new items
        for item_data in accordion_update.items:
            new_item = AccordionItem(
                accordion_section_id=accordion.id,
                **item_data.model_dump(exclude_unset=True)
            )
            db.add(new_item)

    db.commit()
    db.refresh(accordion)

    return {"message": "Accordion section updated successfully", "accordion_id": accordion.id}


# Upload image/video to Cloudflare and create media asset
@router.post("/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    context: Optional[str] = None,
    alt_text: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """
    Upload image/video to Cloudflare (R2 for videos, Images for images) and create media asset record
    """

    import uuid
    from app.services.cloudflare_service import cloudflare_service

    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)

        # Determine if file is video or image
        is_video = file.content_type and file.content_type.startswith('video/')
        is_image = file.content_type and file.content_type.startswith('image/')

        print(f"[Admin Content] Uploading {file.content_type} file: {file.filename} ({file_size} bytes)")

        if is_video:
            # Upload video to Cloudflare R2
            # Generate unique filename to prevent conflicts
            file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'mp4'
            unique_filename = f"{uuid.uuid4()}.{file_ext}"

            try:
                result = await cloudflare_service.upload_video_to_r2(
                    file_content=file_content,
                    filename=unique_filename
                )

                cdn_url = result["r2_url"]
                storage_type = "r2"
                storage_id = unique_filename

                print(f"[Admin Content] Video uploaded to R2: {cdn_url}")

            except Exception as e:
                print(f"[Admin Content] R2 upload failed: {e}")
                # Fallback: Return error with instructions
                raise HTTPException(
                    status_code=500,
                    detail=f"Video upload failed: {str(e)}. Please ensure Cloudflare R2 credentials are configured."
                )

        elif is_image:
            # Upload image to Cloudflare Images
            try:
                result = await cloudflare_service.upload_image(
                    file_content=file_content,
                    filename=file.filename,
                    alt_text=alt_text
                )

                cdn_url = result["url"]
                storage_type = "cloudflare_images"
                storage_id = result.get("image_id", str(uuid.uuid4()))

                print(f"[Admin Content] Image uploaded to Cloudflare Images: {cdn_url}")

            except Exception as e:
                print(f"[Admin Content] Cloudflare Images upload failed: {e}")
                # Fallback: Return error with instructions
                raise HTTPException(
                    status_code=500,
                    detail=f"Image upload failed: {str(e)}. Please ensure Cloudflare Images credentials are configured."
                )

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload an image or video file."
            )

        # Create media asset record
        original_path = file.filename
        media_asset = MediaAsset(
            original_path=original_path,
            storage_type=storage_type,
            storage_id=storage_id,
            cdn_url=cdn_url,
            file_type=file.content_type,
            file_size=file_size,
            alt_text=alt_text,
            context=context
        )

        db.add(media_asset)
        db.commit()
        db.refresh(media_asset)

        return {
            "id": media_asset.id,
            "original_path": original_path,
            "cdn_url": cdn_url,
            "file_type": file.content_type,
            "file_size": file_size,
            "storage_type": storage_type,
            "message": f"{'Video' if is_video else 'Image'} uploaded successfully to Cloudflare"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Admin Content] Upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


# Get media assets
@router.get("/media")
async def list_media(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """List all media assets"""

    total = db.query(MediaAsset).filter(MediaAsset.is_active == True).count()
    media = db.query(MediaAsset).filter(
        MediaAsset.is_active == True
    ).order_by(MediaAsset.uploaded_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "media": [
            {
                "id": m.id,
                "original_path": m.original_path,
                "cdn_url": m.cdn_url,
                "storage_type": m.storage_type,
                "file_type": m.file_type,
                "alt_text": m.alt_text,
                "context": m.context,
                "uploaded_at": m.uploaded_at.isoformat() if m.uploaded_at else None
            }
            for m in media
        ]
    }


# Cache revalidation endpoint
@router.post("/revalidate/{page_slug}")
async def revalidate_page(
    page_slug: str,
    current_user: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """
    Trigger Next.js revalidation for a specific page

    This endpoint calls Next.js revalidate API to clear the cache for the specified page.
    Requires the Next.js app to have a revalidation API route set up.
    """

    # Get frontend URL from environment
    import os
    frontend_url = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:3000").replace(":8000", ":3000")

    # Map page slugs to their actual routes
    route_map = {
        "homepage": "/",
        "about-satyoga": "/about/satyoga",
        "about-shunyamurti": "/about/shunyamurti",
        "about-ashram": "/about/ashram"
    }

    route = route_map.get(page_slug, f"/{page_slug}")

    try:
        # Call Next.js revalidation endpoint
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{frontend_url}/api/revalidate",
                json={"path": route},
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                print(f"[Admin Content] Successfully revalidated {route}")
                return {
                    "message": f"Page '{page_slug}' revalidated successfully",
                    "route": route,
                    "status": "success"
                }
            else:
                print(f"[Admin Content] Revalidation failed: {response.status_code}")
                return {
                    "message": f"Revalidation returned status {response.status_code}",
                    "route": route,
                    "status": "warning",
                    "hint": "Revalidation endpoint may not be configured"
                }

    except httpx.RequestError as e:
        print(f"[Admin Content] Revalidation request failed: {e}")
        return {
            "message": "Could not connect to Next.js revalidation endpoint",
            "route": route,
            "status": "error",
            "hint": "Make sure Next.js dev server is running and has /api/revalidate route"
        }
