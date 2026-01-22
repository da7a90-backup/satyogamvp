"""
Unified Search API
Search across teachings, courses, products, retreats, and static pages
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Dict, Any, List, Optional
from app.core.database import get_db
from app.models.teaching import Teaching
from app.models.course import Course
from app.models.product import Product
from app.models.retreat import Retreat
from app.models.static_content import PageSection, SectionContent
from app.models.blog import BlogPost
from app.services.media_service import MediaService

router = APIRouter()


def get_page_url(page_slug: str) -> str:
    """Map page slugs to their frontend URLs"""
    # Direct page slug mapping
    page_url_map = {
        "homepage": "/",
        "about-satyoga": "/about/satyoga",
        "about-shunyamurti": "/about/shunyamurti",
        "about-ashram": "/about/ashram",
        "membership": "/membership",
        "contact": "/contact",
        "donate": "/donate",
        "faq": "/faq",
        "courses-page": "/courses",
        "teachings-page": "/teachings",
        "store-page": "/store",
        "store": "/store",
        "blog": "/blog",
        "calendar": "/calendar",
        "retreats-ashram": "/retreats/ashram",
        "retreats-online": "/retreats/online",
    }

    return page_url_map.get(page_slug, f"/pages/{page_slug}")


def get_static_navigation_pages():
    """
    Return hardcoded navigation pages that might not be in PageSection table
    These correspond to the main navigation structure
    """
    return [
        {
            "page_slug": "homepage",
            "title": "Home",
            "description": "Welcome to Sat Yoga - Spiritual teachings and retreats",
            "url": "/"
        },
        {
            "page_slug": "about-satyoga",
            "title": "About Sat Yoga",
            "description": "Learn about Sat Yoga spiritual community and teachings",
            "url": "/about/satyoga"
        },
        {
            "page_slug": "about-shunyamurti",
            "title": "About Shunyamurti",
            "description": "Meet Shunyamurti, spiritual teacher and founder",
            "url": "/about/shunyamurti"
        },
        {
            "page_slug": "about-ashram",
            "title": "Our Ashram",
            "description": "Visit our spiritual retreat center in Costa Rica",
            "url": "/about/ashram"
        },
        {
            "page_slug": "retreats-ashram",
            "title": "Ashram Retreats",
            "description": "Onsite spiritual retreats at our Costa Rica ashram",
            "url": "/retreats/ashram"
        },
        {
            "page_slug": "retreats-online",
            "title": "Online Retreats",
            "description": "Join our transformative online spiritual retreats",
            "url": "/retreats/online"
        },
        {
            "page_slug": "teachings",
            "title": "Free Teachings Library",
            "description": "Explore our library of spiritual teachings and meditations",
            "url": "/teachings"
        },
        {
            "page_slug": "courses",
            "title": "Courses",
            "description": "Structured spiritual learning courses and programs",
            "url": "/courses"
        },
        {
            "page_slug": "membership",
            "title": "Membership",
            "description": "Join our spiritual community with exclusive access",
            "url": "/membership"
        },
        {
            "page_slug": "calendar",
            "title": "Calendar",
            "description": "View upcoming events, retreats, and programs",
            "url": "/calendar"
        },
        {
            "page_slug": "store",
            "title": "Store - Dharma Bandhara",
            "description": "Books, courses, and spiritual resources",
            "url": "/store"
        },
        {
            "page_slug": "blog",
            "title": "Blog",
            "description": "Spiritual articles, teachings, and insights",
            "url": "/blog"
        },
        {
            "page_slug": "contact",
            "title": "Contact Us",
            "description": "Get in touch with Sat Yoga community",
            "url": "/contact"
        },
        {
            "page_slug": "donate",
            "title": "Donate",
            "description": "Support our spiritual mission and community",
            "url": "/donate"
        },
    ]


@router.get("")
async def search(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(5, ge=1, le=20, description="Results per category"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Unified search across all content types

    Searches:
    - Teachings (title, description, category)
    - Courses (title, description)
    - Products (title, description, categories)
    - Retreats (title, description)
    - Blog Posts (title, excerpt, content)
    - Static Pages (page headings, descriptions)
    """

    search_pattern = f"%{q}%"
    media_service = MediaService(db)

    # ===== SEARCH TEACHINGS =====
    teachings_query = db.query(Teaching).filter(
        or_(
            Teaching.title.ilike(search_pattern),
            Teaching.description.ilike(search_pattern),
            Teaching.category.ilike(search_pattern)
        )
    ).limit(limit).all()

    teachings_results = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description[:150] + "..." if t.description and len(t.description) > 150 else t.description,
            "thumbnail_url": media_service.resolve_url(t.thumbnail_url) if t.thumbnail_url else None,
            "slug": t.slug,
            "url": f"/teachings/{t.slug}",
            "type": "teaching",
            "category": t.category
        }
        for t in teachings_query
    ]

    # ===== SEARCH COURSES =====
    courses_query = db.query(Course).filter(
        or_(
            Course.title.ilike(search_pattern),
            Course.description.ilike(search_pattern)
        ),
        Course.is_published == True
    ).limit(limit).all()

    courses_results = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description[:150] + "..." if c.description and len(c.description) > 150 else c.description,
            "thumbnail_url": media_service.resolve_url(c.thumbnail_url) if c.thumbnail_url else None,
            "slug": c.slug,
            "url": f"/courses/{c.slug}",
            "type": "course",
            "price": float(c.price) if c.price else None
        }
        for c in courses_query
    ]

    # ===== SEARCH PRODUCTS =====
    products_query = db.query(Product).filter(
        or_(
            Product.title.ilike(search_pattern),
            Product.description.ilike(search_pattern),
            Product.short_description.ilike(search_pattern)
        ),
        Product.published == True
    ).limit(limit).all()

    products_results = [
        {
            "id": p.id,
            "title": p.title,
            "description": p.short_description[:150] + "..." if p.short_description and len(p.short_description) > 150 else p.short_description,
            "thumbnail_url": media_service.resolve_url(p.thumbnail_url) if p.thumbnail_url else None,
            "slug": p.slug,
            "url": f"/store/{p.slug}",
            "type": "product",
            "price": float(p.price) if p.price else None
        }
        for p in products_query
    ]

    # ===== SEARCH RETREATS =====
    retreats_query = db.query(Retreat).filter(
        or_(
            Retreat.title.ilike(search_pattern),
            Retreat.description.ilike(search_pattern)
        ),
        Retreat.is_published == True
    ).limit(limit).all()

    retreats_results = [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description[:150] + "..." if r.description and len(r.description) > 150 else r.description,
            "thumbnail_url": media_service.resolve_url(r.thumbnail_url) if r.thumbnail_url else None,
            "slug": r.slug,
            "url": f"/retreats/online/{r.slug}" if r.type == "online" else f"/retreats/ashram",
            "type": "retreat",
            "retreat_type": r.type,
            "price": float(r.price_lifetime) if r.price_lifetime else None
        }
        for r in retreats_query
    ]

    # ===== SEARCH BLOG POSTS =====
    blogs_query = db.query(BlogPost).filter(
        or_(
            BlogPost.title.ilike(search_pattern),
            BlogPost.excerpt.ilike(search_pattern),
            BlogPost.content.ilike(search_pattern)
        ),
        BlogPost.is_published == True
    ).limit(limit).all()

    blogs_results = [
        {
            "id": b.id,
            "title": b.title,
            "description": b.excerpt[:150] + "..." if b.excerpt and len(b.excerpt) > 150 else b.excerpt,
            "thumbnail_url": media_service.resolve_url(b.featured_image) if b.featured_image else None,
            "slug": b.slug,
            "url": f"/blog/{b.slug}",
            "type": "blog",
            "author": b.author_name,
            "read_time": b.read_time
        }
        for b in blogs_query
    ]

    # ===== SEARCH STATIC PAGES =====
    # Get all static navigation pages (hardcoded)
    all_static_pages = get_static_navigation_pages()

    # Filter static pages by search pattern
    pages_results = []
    for page in all_static_pages:
        # Search in page_slug, title, or description
        if (q.lower() in page["page_slug"].lower() or
            q.lower() in page["title"].lower() or
            q.lower() in page["description"].lower()):

            pages_results.append({
                "id": page["page_slug"],
                "title": page["title"],
                "description": page["description"],
                "thumbnail_url": None,
                "slug": page["page_slug"],
                "url": page["url"],
                "type": "page",
                "eyebrow": None
            })

            # Limit results
            if len(pages_results) >= limit:
                break

    # Calculate total results
    total_results = (
        len(teachings_results) +
        len(courses_results) +
        len(products_results) +
        len(retreats_results) +
        len(blogs_results) +
        len(pages_results)
    )

    return {
        "query": q,
        "total_results": total_results,
        "results": {
            "teachings": teachings_results,
            "courses": courses_results,
            "products": products_results,
            "retreats": retreats_results,
            "blogs": blogs_results,
            "pages": pages_results
        }
    }


@router.get("/routes")
async def get_all_routes(db: Session = Depends(get_db)) -> Dict[str, List[Dict[str, str]]]:
    """
    Get all available routes for sitemap generation
    Returns all teaching, course, product, retreat, and page routes
    """

    media_service = MediaService(db)

    # Get all teaching routes
    teachings = db.query(Teaching).filter(Teaching.is_published == True).all()
    teaching_routes = [
        {
            "path": f"/teachings/{t.slug}",
            "title": t.title,
            "type": "teaching",
            "updated_at": t.updated_at.isoformat() if t.updated_at else None
        }
        for t in teachings
    ]

    # Get all course routes
    courses = db.query(Course).filter(Course.is_published == True).all()
    course_routes = [
        {
            "path": f"/courses/{c.slug}",
            "title": c.title,
            "type": "course",
            "updated_at": c.updated_at.isoformat() if c.updated_at else None
        }
        for c in courses
    ]

    # Get all product routes
    products = db.query(Product).filter(Product.published == True).all()
    product_routes = [
        {
            "path": f"/store/{p.slug}",
            "title": p.title,
            "type": "product",
            "updated_at": p.updated_at.isoformat() if p.updated_at else None
        }
        for p in products
    ]

    # Get all retreat routes
    retreats = db.query(Retreat).filter(Retreat.is_published == True).all()
    retreat_routes = [
        {
            "path": f"/retreats/online/{r.slug}" if r.type == "online" else f"/retreats/ashram",
            "title": r.title,
            "type": "retreat",
            "updated_at": r.updated_at.isoformat() if hasattr(r, 'updated_at') and r.updated_at else None
        }
        for r in retreats
    ]

    # Get all blog routes
    blogs = db.query(BlogPost).filter(BlogPost.is_published == True).all()
    blog_routes = [
        {
            "path": f"/blog/{b.slug}",
            "title": b.title,
            "type": "blog",
            "updated_at": b.updated_at.isoformat() if b.updated_at else None
        }
        for b in blogs
    ]

    # Get all static page routes
    pages = db.query(PageSection.page_slug).distinct().filter(
        PageSection.is_active == True
    ).all()

    page_routes = [
        {
            "path": get_page_url(page[0]),
            "title": page[0].replace("-", " ").title(),
            "type": "page",
            "updated_at": None
        }
        for page in pages
    ]

    return {
        "teachings": teaching_routes,
        "courses": course_routes,
        "products": product_routes,
        "retreats": retreat_routes,
        "blogs": blog_routes,
        "pages": page_routes
    }
