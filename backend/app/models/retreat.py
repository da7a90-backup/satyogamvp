from sqlalchemy import Column, String, Integer, Numeric, Text, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy import String
from ..core.db_types import UUID_TYPE, JSON_TYPE
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..core.database import Base


class RetreatType(str, enum.Enum):
    ONLINE = "online"
    ONSITE_DARSHAN = "onsite_darshan"
    ONSITE_SHAKTI = "onsite_shakti"
    ONSITE_SEVADHARI = "onsite_sevadhari"


class AccessType(str, enum.Enum):
    LIFETIME = "lifetime"
    LIMITED_12DAY = "limited_12day"


class RegistrationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class ForumCategory(str, enum.Enum):
    GENERAL = "general"
    QUESTIONS = "questions"
    INSIGHTS = "insights"
    EXPERIENCES = "experiences"
    MEDITATION = "meditation"
    TEACHINGS = "teachings"


class Retreat(Base):
    __tablename__ = "retreats"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    subtitle = Column(Text, nullable=True)  # Selling page subtitle
    description = Column(Text, nullable=True)
    type = Column(Enum(RetreatType), nullable=False, index=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    price_lifetime = Column(Numeric(10, 2), nullable=True)  # for online retreats
    price_limited = Column(Numeric(10, 2), nullable=True)  # 12-day access
    price_onsite = Column(Numeric(10, 2), nullable=True)  # for onsite retreats
    price_options = Column(JSON_TYPE, nullable=True)  # Multiple pricing options
    member_discount_percentage = Column(Integer, nullable=True)
    scholarship_available = Column(Boolean, default=False, nullable=False)
    scholarship_deadline = Column(String(200), nullable=True)
    application_url = Column(String(500), nullable=True)
    # application_form_slug = Column(String(255), nullable=True)  # Slug of the form template for applications - Commented out: column not in DB
    product_component_data = Column(JSON_TYPE, nullable=True)  # Data for ProductComponent (booking widget)
    location = Column(String(255), nullable=True)
    max_participants = Column(Integer, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)

    # Selling Page Content Sections
    booking_tagline = Column(Text, nullable=True)  # Card tagline
    intro1_title = Column(Text, nullable=True)
    intro1_content = Column(JSON_TYPE, nullable=True)  # Array of paragraphs
    intro2_title = Column(Text, nullable=True)
    intro2_content = Column(JSON_TYPE, nullable=True)
    intro3_title = Column(Text, nullable=True)
    intro3_content = Column(JSON_TYPE, nullable=True)
    intro3_media = Column(String(500), nullable=True)
    agenda_title = Column(Text, nullable=True)
    agenda_items = Column(JSON_TYPE, nullable=True)
    included_title = Column(Text, nullable=True)
    included_items = Column(JSON_TYPE, nullable=True)

    # Schedule (for selling page - shows retreat schedule)
    schedule_tagline = Column(String(200), nullable=True)
    schedule_title = Column(String(500), nullable=True)
    schedule_items = Column(JSON_TYPE, nullable=True)

    # Media
    hero_background = Column(String(500), nullable=True)
    images = Column(JSON_TYPE, nullable=True)  # Array of image objects
    video_url = Column(String(500), nullable=True)
    video_thumbnail = Column(String(500), nullable=True)
    video_type = Column(String(50), nullable=True)

    # Testimonials
    testimonial_tagline = Column(String(200), nullable=True)
    testimonial_heading = Column(String(500), nullable=True)
    testimonial_data = Column(JSON_TYPE, nullable=True)

    # Portal/Selling Page Data (Overview tab)
    invitation_video_url = Column(String(500), nullable=True)  # Video from Shunyamurti
    announcement = Column(Text, nullable=True)  # Announcement section content
    about_content = Column(Text, nullable=True)  # About the retreat content
    about_image_url = Column(String(500), nullable=True)  # About section image
    overview_sections = Column(JSON_TYPE, nullable=True)  # Additional overview sections: [{image_url, content}]
    # Preparation instructions - Array of objects with:
    # {title, content (str|array), contentPreview, bullets, image, imageCaption,
    #  videoUrl, videoType, teachingId, expandable, icon}
    preparation_instructions = Column(JSON_TYPE, nullable=True)
    faq_data = Column(JSON_TYPE, nullable=True)  # Array of {question, answer}
    live_schedule = Column(JSON_TYPE, nullable=True)  # Live schedule with sessions

    # Card Display Fields
    duration_days = Column(Integer, nullable=True)  # "3 days" badge
    has_audio = Column(Boolean, default=True, nullable=False)  # Show audio badge
    has_video = Column(Boolean, default=True, nullable=False)  # Show video badge

    # Forum Control
    forum_enabled = Column(Boolean, default=False, nullable=False)  # Admin toggle for forum access

    # Past Retreat Portal Media (for store publishing)
    past_retreat_portal_media = Column(JSON_TYPE, nullable=True)  # Admin-edited media: [{title, subtitle, description, video_url, audio_url, order}]
    is_published_to_store = Column(Boolean, default=False, nullable=False)  # Flag for Dharma Bandhara store
    store_product_id = Column(UUID_TYPE, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)  # Linked store product

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    portals = relationship("RetreatPortal", back_populates="retreat", cascade="all, delete-orphan")
    registrations = relationship("RetreatRegistration", back_populates="retreat", cascade="all, delete-orphan")
    forum_posts = relationship("RetreatForumPost", back_populates="retreat", cascade="all, delete-orphan")
    store_product = relationship("Product", foreign_keys=[store_product_id])


class RetreatPortal(Base):
    """Content/portal for online retreats."""
    __tablename__ = "retreat_portals"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    retreat_id = Column(UUID_TYPE, ForeignKey("retreats.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(JSON_TYPE, nullable=True)  # videos, materials, sessions, etc.
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    retreat = relationship("Retreat", back_populates="portals")


class RetreatRegistration(Base):
    __tablename__ = "retreat_registrations"
    __table_args__ = (
        UniqueConstraint('user_id', 'retreat_id', name='uq_user_retreat'),
    )

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    retreat_id = Column(UUID_TYPE, ForeignKey("retreats.id", ondelete="CASCADE"), nullable=False, index=True)
    access_type = Column(Enum(AccessType), nullable=True)  # for online retreats
    payment_id = Column(UUID_TYPE, ForeignKey("payments.id"), nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    access_expires_at = Column(DateTime, nullable=True)  # for 12-day access
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING, nullable=False)
    application_data = Column(JSON_TYPE, nullable=True)  # for onsite retreat applications

    # Relationships
    user = relationship("User", back_populates="retreat_registrations")
    retreat = relationship("Retreat", back_populates="registrations")
    payment = relationship("Payment")


class RetreatForumPost(Base):
    """Forum posts for retreat discussions."""
    __tablename__ = "retreat_forum_posts"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4, index=True)
    retreat_id = Column(UUID_TYPE, ForeignKey("retreats.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(UUID_TYPE, ForeignKey("retreat_forum_posts.id", ondelete="CASCADE"), nullable=True)  # for replies
    title = Column(String(500), nullable=True)  # Required for top-level posts, null for replies
    category = Column(Enum(ForumCategory, values_callable=lambda obj: [e.value for e in obj]), nullable=True, index=True)  # Only for top-level posts
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    retreat = relationship("Retreat", back_populates="forum_posts")
    user = relationship("User")
    replies = relationship("RetreatForumPost", foreign_keys=[parent_id], remote_side=[id])
    likes = relationship("RetreatForumPostLike", back_populates="post", cascade="all, delete-orphan")


class RetreatForumPostLike(Base):
    """Likes for forum posts and replies."""
    __tablename__ = "retreat_forum_post_likes"

    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID_TYPE, ForeignKey("retreat_forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID_TYPE, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Unique constraint: user can only like a post once
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uq_post_user_like'),
    )

    # Relationships
    post = relationship("RetreatForumPost", back_populates="likes")
    user = relationship("User")
