"""
Static Pages API - Homepage, About, etc.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.static_content import PageSection, AccordionSection, AccordionItem
from app.services.media_service import MediaService
from typing import Dict, Any, List
import json

router = APIRouter()


def to_camel_case(snake_str: str) -> str:
    """Convert snake_case or kebab-case to camelCase"""
    # Replace hyphens with underscores first
    snake_str = snake_str.replace('-', '_')
    components = snake_str.split('_')
    # Keep first component lowercase, capitalize the rest
    return components[0] + ''.join(x.title() for x in components[1:])


@router.get("/{page_slug}")
async def get_page_content(
    page_slug: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get all sections for a page with resolved CDN URLs

    Pages: homepage, about-satyoga, about-shunyamurti, about-ashram, etc.
    """

    # Get all sections for this page
    sections = db.query(PageSection).filter(
        PageSection.page_slug == page_slug,
        PageSection.is_active == True
    ).order_by(PageSection.order_index).all()

    if not sections:
        raise HTTPException(status_code=404, detail=f"Page '{page_slug}' not found")

    # Initialize media service
    media_service = MediaService(db)

    # Build response
    result = {}

    for section in sections:
        section_data = {
            "section_type": section.section_type,
            "order_index": section.order_index
        }

        # Add content if exists
        if section.content:
            content = section.content

            # Basic fields
            if content.eyebrow:
                section_data["eyebrow"] = content.eyebrow
            if content.heading:
                section_data["heading"] = content.heading
            if content.subheading:
                section_data["subheading"] = content.subheading
            if content.tagline:
                section_data["tagline"] = content.tagline
            if content.quote:
                section_data["quote"] = content.quote
            if content.description:
                # Try to parse description as JSON if it looks like JSON
                desc = content.description
                if isinstance(desc, str) and (desc.startswith('[') or desc.startswith('{')):
                    try:
                        section_data["description"] = json.loads(desc)
                    except json.JSONDecodeError:
                        section_data["description"] = desc
                else:
                    section_data["description"] = desc
            if content.content:
                # Process content through media service to resolve image URLs
                section_data["content"] = media_service.resolve_dict(content.content) if isinstance(content.content, dict) else content.content

            # Video/Hero fields
            if content.video_url:
                section_data["videoUrl"] = media_service.resolve_url(content.video_url)
            if content.video_thumbnail:
                section_data["videoThumbnail"] = media_service.resolve_url(content.video_thumbnail)
            if content.video_type:
                section_data["videoType"] = content.video_type
            if content.logo_url:
                section_data["logoUrl"] = media_service.resolve_url(content.logo_url)
            if content.logo_alt:
                section_data["logoAlt"] = content.logo_alt
            if content.subtitle:
                section_data["subtitle"] = content.subtitle

            # Image fields
            if content.image_url:
                section_data["image"] = media_service.resolve_url(content.image_url)
            if content.image_alt:
                section_data["imageAlt"] = content.image_alt
            if content.background_image:
                section_data["backgroundImage"] = media_service.resolve_url(content.background_image)
            if content.background_decoration:
                section_data["backgroundDecoration"] = media_service.resolve_url(content.background_decoration)

            # Special handling for ashram section images
            if section.section_slug == "ashram" and content.image_url and content.secondary_images:
                section_data["images"] = {
                    "main": media_service.resolve_url(content.image_url),
                    "secondary": media_service.resolve_list(content.secondary_images)
                }
                # Remove individual image fields since we're using nested structure
                section_data.pop("image", None)
                section_data.pop("imageAlt", None)
            elif content.secondary_images:
                section_data["secondaryImages"] = media_service.resolve_list(content.secondary_images)

            # CTA fields
            if content.button_text:
                section_data["buttonText"] = content.button_text
            if content.button_link:
                section_data["buttonLink"] = content.button_link

            # Layout fields
            if content.gap:
                section_data["gap"] = content.gap
            if content.title_line_height:
                section_data["titleLineHeight"] = content.title_line_height
            if content.background_elements:
                section_data["backgroundElements"] = media_service.resolve_dict(content.background_elements)

        # Add tabs if exists
        if section.tabs:
            section_data["tabs"] = [
                {
                    "id": tab.tab_id,
                    "label": tab.label,
                    "tagline": tab.tagline,
                    "title": tab.title,
                    "description": tab.description,
                    "buttonText": tab.button_text,
                    "buttonLink": tab.button_link,
                    "image": media_service.resolve_url(tab.image_url) if tab.image_url else None
                }
                for tab in section.tabs
            ]

        # Add decorations if exists
        if section.decorations:
            section_data["backgroundDecorations"] = {
                dec.decoration_key: media_service.resolve_url(dec.decoration_url)
                for dec in section.decorations
            }

        # Fetch accordion items if this is an accordion section
        if section.section_type in ["two_pane_accordion", "accordion", "bulletaccordion"]:
            accordion_section = db.query(AccordionSection).filter(
                AccordionSection.page_slug == page_slug,
                AccordionSection.section_slug == section.section_slug
            ).first()

            if accordion_section:
                # Fetch accordion items ordered by order_index
                accordion_items = db.query(AccordionItem).filter(
                    AccordionItem.accordion_section_id == accordion_section.id
                ).order_by(AccordionItem.order_index).all()

                # Add accordion type and items to section data
                section_data["accordionType"] = accordion_section.type
                section_data["accordionItems"] = [
                    {
                        "id": item.item_id,
                        "title": item.title,
                        "heading": item.heading,
                        "content": item.content
                    }
                    for item in accordion_items
                ]

        # Use section_slug as key (convert to camelCase for frontend)
        section_key = to_camel_case(section.section_slug)
        result[section_key] = section_data

    return result


@router.get("/")
async def list_pages(db: Session = Depends(get_db)) -> List[str]:
    """List all available page slugs"""

    pages = db.query(PageSection.page_slug).distinct().filter(
        PageSection.is_active == True
    ).all()

    return [page[0] for page in pages]
