"""
SQLAlchemy models for static content (homepage, about pages, retreats, etc.)
These tables store data migrated from frontend to enable dynamic content management
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, DECIMAL, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.db_types import JSON_TYPE
from datetime import datetime


class MediaAsset(Base):
    """Cloudflare Images & R2 CDN URLs"""
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True)
    original_path = Column(String(500), unique=True, nullable=False)
    storage_type = Column(String(20), nullable=False)
    storage_id = Column(String(200))
    cdn_url = Column(Text, nullable=False)
    variants = Column(JSONB)
    file_type = Column(String(50))
    file_size = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    alt_text = Column(Text)
    context = Column(String(200))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        CheckConstraint(
            "storage_type IN ('cloudflare_images', 'r2')",
            name='check_storage_type'
        ),
    )


class PageSection(Base):
    """Page sections for homepage, about pages, etc."""
    __tablename__ = "page_sections"

    id = Column(Integer, primary_key=True)
    page_slug = Column(String(100), nullable=False)
    section_slug = Column(String(100), nullable=False)
    section_type = Column(String(50), nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    content = relationship("SectionContent", back_populates="section", uselist=False, cascade="all, delete-orphan")
    tabs = relationship("SectionTab", back_populates="section", order_by="SectionTab.order_index", cascade="all, delete-orphan")
    decorations = relationship("SectionDecoration", back_populates="section", cascade="all, delete-orphan")


class SectionContent(Base):
    """Content for page sections"""
    __tablename__ = "section_content"

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("page_sections.id", ondelete="CASCADE"))

    # Text content
    eyebrow = Column(String(200))
    heading = Column(Text)
    subheading = Column(Text)
    tagline = Column(String(200))
    content = Column(JSONB)
    quote = Column(Text)
    description = Column(Text)

    # Video/Hero
    video_url = Column(String(500))
    video_thumbnail = Column(String(500))
    video_type = Column(String(50))
    logo_url = Column(String(500))
    logo_alt = Column(String(200))
    subtitle = Column(Text)

    # Images
    image_url = Column(String(500))
    image_alt = Column(String(200))
    background_image = Column(String(500))
    background_decoration = Column(String(500))
    secondary_images = Column(JSONB)

    # CTA
    button_text = Column(String(100))
    button_link = Column(String(500))

    # Layout
    gap = Column(String(50))
    title_line_height = Column(String(50))
    background_elements = Column(JSONB)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    section = relationship("PageSection", back_populates="content")


class SectionTab(Base):
    """Tabs within page sections"""
    __tablename__ = "section_tabs"

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("page_sections.id", ondelete="CASCADE"))
    tab_id = Column(String(100), nullable=False)
    label = Column(String(200), nullable=False)
    tagline = Column(String(200))
    title = Column(Text)
    description = Column(Text)
    button_text = Column(String(100))
    button_link = Column(String(500))
    image_url = Column(String(500))
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    section = relationship("PageSection", back_populates="tabs")


class SectionDecoration(Base):
    """Background decorations for sections"""
    __tablename__ = "section_decorations"

    id = Column(Integer, primary_key=True)
    section_id = Column(Integer, ForeignKey("page_sections.id", ondelete="CASCADE"))
    decoration_key = Column(String(100), nullable=False)
    decoration_url = Column(String(500), nullable=False)

    # Relationships
    section = relationship("PageSection", back_populates="decorations")


class AccordionSection(Base):
    """Accordion sections for about pages"""
    __tablename__ = "accordion_sections"

    id = Column(Integer, primary_key=True)
    page_slug = Column(String(100), nullable=False)
    section_slug = Column(String(100), nullable=False)
    title = Column(String(500))
    description = Column(Text)
    tagline = Column(String(200))
    type = Column(String(50))
    gap = Column(String(50))
    title_line_height = Column(String(50))
    background_elements = Column(JSONB)
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    items = relationship("AccordionItem", back_populates="accordion_section", order_by="AccordionItem.order_index", cascade="all, delete-orphan")


class AccordionItem(Base):
    """Items within accordion sections"""
    __tablename__ = "accordion_items"

    id = Column(Integer, primary_key=True)
    accordion_section_id = Column(Integer, ForeignKey("accordion_sections.id", ondelete="CASCADE"))
    item_id = Column(Integer)
    title = Column(Text)
    heading = Column(Text)
    content = Column(Text, nullable=False)
    paragraphs = Column(JSONB)
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    accordion_section = relationship("AccordionSection", back_populates="items")


class OnlineRetreat(Base):
    """Online retreat data"""
    __tablename__ = "online_retreats"

    id = Column(Integer, primary_key=True)
    slug = Column(String(100), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    subtitle = Column(Text)

    # Scheduling
    fixed_date = Column(String(200))
    location = Column(String(100))
    duration = Column(String(50))

    # Pricing (multiple options)
    base_price = Column(DECIMAL(10, 2))
    price_options = Column(JSONB)
    member_discount_percentage = Column(Integer)
    scholarship_available = Column(Boolean, default=False)
    scholarship_deadline = Column(String(200))
    application_url = Column(String(500))

    # Content sections
    booking_tagline = Column(Text)
    intro1_title = Column(Text)
    intro1_content = Column(JSONB)
    intro2_title = Column(Text)
    intro2_content = Column(JSONB)
    intro3_title = Column(Text)
    intro3_content = Column(JSONB)
    intro3_media = Column(String(500))
    agenda_title = Column(Text)
    agenda_items = Column(JSONB)
    included_title = Column(Text)
    included_items = Column(JSONB)

    # Schedule
    schedule_tagline = Column(String(200))
    schedule_title = Column(String(500))
    schedule_items = Column(JSONB)

    # Media
    hero_background = Column(String(500))
    images = Column(JSONB)
    video_url = Column(String(500))
    video_thumbnail = Column(String(500))
    video_type = Column(String(50))

    # Testimonials
    testimonial_tagline = Column(String(200))
    testimonial_heading = Column(String(500))
    testimonial_data = Column(JSONB)

    # Meta
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RetreatInfo(Base):
    """Onsite retreat information"""
    __tablename__ = "retreat_info"

    id = Column(Integer, primary_key=True)
    slug = Column(String(100), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    duration = Column(String(100))
    type = Column(String(100))
    category = Column(String(200))
    description = Column(Text)
    short_description = Column(Text)
    icon_url = Column(String(500))
    image_url = Column(String(500))
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FAQCategory(Base):
    """FAQ categories"""
    __tablename__ = "faq_categories"

    id = Column(Integer, primary_key=True)
    category_id = Column(String(100), unique=True, nullable=False)
    label = Column(String(200), nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    faqs = relationship("FAQ", back_populates="category", order_by="FAQ.order_index")


class FAQ(Base):
    """FAQ items"""
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True)
    category_id = Column(String(100), ForeignKey("faq_categories.category_id"), nullable=False)
    page = Column(String(100))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("FAQCategory", back_populates="faqs")


class Gallery(Base):
    """Image galleries"""
    __tablename__ = "galleries"

    id = Column(Integer, primary_key=True)
    page = Column(String(100), nullable=False)
    section = Column(String(100))
    name = Column(String(200))
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    images = relationship("GalleryImage", back_populates="gallery", order_by="GalleryImage.order_index", cascade="all, delete-orphan")


class GalleryImage(Base):
    """Images within galleries"""
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True)
    gallery_id = Column(Integer, ForeignKey("galleries.id", ondelete="CASCADE"))
    src = Column(String(500), nullable=False)
    alt = Column(Text, nullable=False)
    size = Column(String(50))
    order_index = Column(Integer, nullable=False)

    # Relationships
    gallery = relationship("Gallery", back_populates="images")


class ContactInfo(Base):
    """Contact page information"""
    __tablename__ = "contact_info"

    id = Column(Integer, primary_key=True)
    tagline = Column(Text)
    heading = Column(Text)
    description = Column(Text)
    email = Column(String(200), nullable=False)
    phone = Column(String(50))
    address = Column(Text)
    hero_image = Column(String(500))  # URL to hero/banner image
    map_image = Column(String(500))  # URL to map image
    form_fields = Column(JSON_TYPE, default=[])  # Form field configurations
    privacy_policy_text = Column(Text)
    privacy_policy_link = Column(String(500))
    submit_button_text = Column(String(100))
    success_message = Column(Text)
    error_message = Column(Text)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FormField(Base):
    """Form field configurations"""
    __tablename__ = "form_fields"

    id = Column(Integer, primary_key=True)
    form_type = Column(String(100), nullable=False)
    field_id = Column(String(100), nullable=False)
    label = Column(String(200), nullable=False)
    field_type = Column(String(50), nullable=False)
    placeholder = Column(Text)
    required = Column(Boolean, default=False)
    options = Column(JSONB)
    rows = Column(Integer)
    grid_column = Column(String(10))
    validation_rules = Column(JSONB)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)


class MembershipPricing(Base):
    """Membership tier pricing"""
    __tablename__ = "membership_pricing"

    id = Column(Integer, primary_key=True)
    tier_name = Column(String(100), unique=True, nullable=False)
    tier_slug = Column(String(100), unique=True, nullable=False)
    monthly_price = Column(DECIMAL(10, 2))
    yearly_price = Column(DECIMAL(10, 2), nullable=False)
    yearly_savings = Column(String(50))
    description = Column(Text)
    trial_badge = Column(String(200))
    recommended = Column(Boolean, default=False)
    yearly_only = Column(Boolean, default=False)
    highlight_box = Column(Text)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    features = relationship("MembershipFeature", back_populates="tier", order_by="MembershipFeature.order_index", cascade="all, delete-orphan")


class MembershipFeature(Base):
    """Features for membership tiers"""
    __tablename__ = "membership_features"

    id = Column(Integer, primary_key=True)
    tier_slug = Column(String(100), ForeignKey("membership_pricing.tier_slug"), nullable=False)
    feature_type = Column(String(50))
    title = Column(Text)
    content = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)

    # Relationships
    tier = relationship("MembershipPricing", back_populates="features")
    discount_items = relationship("MembershipDiscountItem", back_populates="feature", order_by="MembershipDiscountItem.order_index", cascade="all, delete-orphan")


class MembershipDiscountItem(Base):
    """Discount items within membership features"""
    __tablename__ = "membership_discount_items"

    id = Column(Integer, primary_key=True)
    feature_id = Column(Integer, ForeignKey("membership_features.id", ondelete="CASCADE"))
    item_text = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)

    # Relationships
    feature = relationship("MembershipFeature", back_populates="discount_items")


class DonationProject(Base):
    """Donation projects"""
    __tablename__ = "donation_projects"

    id = Column(Integer, primary_key=True)
    project_id = Column(String(100), unique=True, nullable=False)
    project_name = Column(String(200), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(500))
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CoursePageSection(Base):
    """Courses page sections"""
    __tablename__ = "course_page_sections"

    id = Column(Integer, primary_key=True)
    section_type = Column(String(100), nullable=False)
    data = Column(JSONB, nullable=False)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
