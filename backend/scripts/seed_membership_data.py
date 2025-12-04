#!/usr/bin/env python3
"""
Seed membership pricing and benefits data from ORIGINAL frontend hardcoded content
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import (
    MembershipPricing, MembershipFeature, MembershipDiscountItem,
    MembershipBenefits, MembershipBenefitItem
)


def seed_membership_pricing(db: Session):
    """Seed membership pricing tiers with features - ORIGINAL CONTENT"""
    print("\n💰 Seeding membership pricing...")

    # Check if already seeded
    existing = db.query(MembershipPricing).count()
    if existing > 0:
        print(f"⏭  Membership pricing already seeded ({existing} tiers)")
        return

    # ====================
    # GYANI TIER - ORIGINAL
    # ====================
    print("  Creating Gyani tier...")
    gyani = MembershipPricing(
        tier_name="Gyani",
        tier_slug="gyani",
        monthly_price=20,
        yearly_price=15,
        yearly_savings="60$",
        description="Open the Gate! Access weekly teachings, guided meditations, and meaningful connection with our global community.",
        trial_badge="10 days  Gyani free trial",
        recommended=False,
        yearly_only=False,
        highlight_box=None,
        order_index=1,
        is_active=True
    )
    db.add(gyani)
    db.flush()

    # Gyani features - ORIGINAL
    gyani_features = [
        {"type": "standard", "content": "Your personal dashboard, seamlessly responsive across all devices", "order": 1},
        {"type": "standard", "content": "Exclusive Wisdom Library with 1,000+ publications", "order": 2},
        {"type": "standard", "content": "New Weekly Teachings", "order": 3},
        {"type": "standard", "content": "Shunyamurti Book Study", "order": 4},
        {"type": "standard", "content": "Shunyamurti Recommendations to Deepen Your Knowledge", "order": 5},
        {"type": "standard", "content": "Community Forum", "order": 6},
        {"type": "standard", "content": "Live Sunday Group Meditation", "order": 7},
        {"type": "discount", "title": "Exclusive Gyani Discounts", "content": "", "order": 8}
    ]

    for feat in gyani_features:
        feature = MembershipFeature(
            tier_slug="gyani",
            feature_type=feat["type"],
            title=feat.get("title"),
            content=feat.get("content") or "",
            order_index=feat["order"]
        )
        db.add(feature)

        # Add discount items for the discount feature
        if feat["type"] == "discount":
            db.flush()
            discount_items = [
                {"text": "5% off Onsite Retreats", "order": 1},
                {"text": "10% off all Digital Products", "order": 2}
            ]
            for item in discount_items:
                db.add(MembershipDiscountItem(
                    feature_id=feature.id,
                    item_text=item["text"],
                    order_index=item["order"]
                ))

    # ====================
    # PRAGYANI TIER - ORIGINAL
    # ====================
    print("  Creating Pragyani tier...")
    pragyani = MembershipPricing(
        tier_name="Pragyani",
        tier_slug="pragyani",
        monthly_price=100,
        yearly_price=83,
        yearly_savings="200$",
        description="Virtual Ashram Experience: Join live satsangs with Shunyamurti, participate in study groups, and engage deeply with a living path of wisdom.",
        trial_badge=None,
        recommended=True,
        yearly_only=False,
        highlight_box=None,
        order_index=2,
        is_active=True
    )
    db.add(pragyani)
    db.flush()

    # Pragyani features - ORIGINAL
    pragyani_features = [
        {"type": "standard", "content": "Your personal dashboard, seamlessly responsive across all devices", "order": 1},
        {"type": "standard", "content": "Exclusive Wisdom Library with 1,000+ publications", "order": 2},
        {"type": "standard", "content": "New Weekly Teachings", "order": 3},
        {"type": "standard", "content": "Shunyamurti Book Study", "order": 4},
        {"type": "standard", "content": "Shunyamurti Recommendations to Deepen Your Knowledge", "order": 5},
        {"type": "standard", "content": "Community Forum", "order": 6},
        {"type": "standard", "content": "Live Sunday Group Meditation", "order": 7},
        {"type": "standard", "content": "Live Surprise Satsangs with Shunyamurti", "order": 8},
        {"type": "standard", "content": "Live Sunday Study Group with Radha Ma", "order": 9},
        {"type": "standard", "content": "Live Monthly Teaching Discussions", "order": 10},
        {"type": "standard", "content": "Book Groups", "order": 11},
        {"type": "standard", "content": "Pragyani Exclusive Teachings", "order": 12},
        {"type": "standard", "content": "Study Group Review", "order": 13},
        {"type": "standard", "content": "Ask Shunyamurti", "order": 14},
        {"type": "standard", "content": "Your Questions Prioritized during ALL live events with Shunyamurti", "order": 15},
        {"type": "discount", "title": "Exclusive Pragyani Discounts", "content": "", "order": 16}
    ]

    for feat in pragyani_features:
        feature = MembershipFeature(
            tier_slug="pragyani",
            feature_type=feat["type"],
            title=feat.get("title"),
            content=feat.get("content") or "",
            order_index=feat["order"]
        )
        db.add(feature)

        if feat["type"] == "discount":
            db.flush()
            discount_items = [
                {"text": "30% off all Digital Products", "order": 1},
                {"text": "10% off Onsite Retreats", "order": 2}
            ]
            for item in discount_items:
                db.add(MembershipDiscountItem(
                    feature_id=feature.id,
                    item_text=item["text"],
                    order_index=item["order"]
                ))

    # ====================
    # PRAGYANI+ TIER - ORIGINAL
    # ====================
    print("  Creating Pragyani+ tier...")
    pragyani_plus = MembershipPricing(
        tier_name="Pragyani+",
        tier_slug="pragyani-plus",
        monthly_price=None,
        yearly_price=142,
        yearly_savings="1170$",
        description="Activate the Full Transmission: Lifetime access to all online retreats and direct guidance from Shunyamurti on the journey to Self-realization.",
        trial_badge=None,
        recommended=False,
        yearly_only=True,
        highlight_box="Lifetime VIP Access to All Online Retreats led by Shunyamurti (Valued at $1,970 per year)",
        order_index=3,
        is_active=True
    )
    db.add(pragyani_plus)
    db.flush()

    # Pragyani+ features - ORIGINAL
    pragyani_plus_features = [
        {"type": "standard", "content": "Custom dashboard available on your phone, tablet and desktop", "order": 1},
        {"type": "standard", "content": "Exclusive Wisdom Library with 1,000+ publications", "order": 2},
        {"type": "standard", "content": "New Weekly Teachings", "order": 3},
        {"type": "standard", "content": "Shunyamurti Book Study", "order": 4},
        {"type": "standard", "content": "Shunyamurti Recommendations to Deepen Your Knowledge", "order": 5},
        {"type": "standard", "content": "Community Forum", "order": 6},
        {"type": "standard", "content": "Live Sunday Group Meditation", "order": 7},
        {"type": "standard", "content": "Live Surprise Satsangs with Shunyamurti", "order": 8},
        {"type": "standard", "content": "Live Sunday Study Group with Radha Ma", "order": 9},
        {"type": "standard", "content": "Live Monthly Teaching Discussions", "order": 10},
        {"type": "standard", "content": "Book Groups", "order": 11},
        {"type": "standard", "content": "Pragyani Exclusive Teachings", "order": 12},
        {"type": "standard", "content": "Study Group Review", "order": 13},
        {"type": "standard", "content": "Ask Shunyamurti", "order": 14},
        {"type": "standard", "content": "Your Questions Prioritized during ALL live events with Shunyamurti", "order": 15},
        {"type": "discount", "title": "Exclusive Pragyani Discounts", "content": "", "order": 16}
    ]

    for feat in pragyani_plus_features:
        feature = MembershipFeature(
            tier_slug="pragyani-plus",
            feature_type=feat["type"],
            title=feat.get("title"),
            content=feat.get("content") or "",
            order_index=feat["order"]
        )
        db.add(feature)

        if feat["type"] == "discount":
            db.flush()
            discount_items = [
                {"text": "30% off all Digital Products", "order": 1},
                {"text": "10% off Onsite Retreats", "order": 2}
            ]
            for item in discount_items:
                db.add(MembershipDiscountItem(
                    feature_id=feature.id,
                    item_text=item["text"],
                    order_index=item["order"]
                ))

    db.commit()
    print("✅ Membership pricing seeded successfully with ORIGINAL content!")


def seed_membership_benefits(db: Session):
    """Seed membership benefits accordion data - ORIGINAL"""
    print("\n📄 Seeding membership benefits...")

    # Check if already seeded
    existing = db.query(MembershipBenefits).count()
    if existing > 0:
        print(f"⏭  Membership benefits already seeded ({existing} configs)")
        return

    # Create benefits config - ORIGINAL
    benefits_config = MembershipBenefits(
        background_color='#FAF8F1',
        left_pane_title='Details',
        left_pane_description="Have a question before signing up? We're here to help—reach out anytime.",
        left_pane_buttons=[
            {
                "text": "Contact",
                "url": "/contact?queryType=membership",
                "variant": "secondary"
            },
            {
                "text": "Start Now",
                "url": "/membership",
                "variant": "primary"
            }
        ],
        is_active=True
    )
    db.add(benefits_config)
    db.flush()

    # Create accordion items - ORIGINAL from membershipBenefitsData.ts
    accordion_items = [
        {
            "title": "Personal Dashboard",
            "content": "Access the Sat Yoga teachings anytime, anywhere through our seamlessly responsive Dashboard. Pick up exactly where you left off, bookmark favorite teachings, revisit past retreats, or navigate our fully searchable wisdom library. Your live calendar keeps you connected to upcoming classes and events in real time, with all content automatically syncing across devices.",
            "order": 0
        },
        {
            "title": "Wisdom Library with 1,000+ Publications",
            "content": "Gain access to an exclusive collection of full-length teachings not available on YouTube, (guided meditations, profound essays, and Q&A sessions with Shunyamurti—all specially selected and easily searchable to accelerate your spiritual awakening).",
            "order": 1
        },
        {
            "title": "New Publications Added Weekly",
            "content": "Stay engaged with fresh content added to the Wisdom Library every week, including full-length video teachings, audio recordings, transcripts, guided meditations, and insightful Q&A sessions with Shunyamurti.",
            "order": 2
        },
        {
            "title": "Pragyani Exclusive Teachings",
            "content": "As a Pragyani, gain access to rare and advanced teachings designed for the most dedicated seekers. Immerse yourself in profound transmissions and become part of the spiritual renaissance unfolding at the Ashram.",
            "order": 3
        },
        {
            "title": "Shunyamurti's Recommended Resources",
            "content": "Take a peek into Shunyamurti's personal library, getting recommendations on books to deepen your knowledge across a vast variety of topics. Follow along with the Ashram's studies by exploring documentary films screened with the Sangha—each chosen to support your journey to higher knowledge and spiritual realization.",
            "order": 4
        },
        {
            "title": "Shunyamurti Book Study",
            "content": "Study Shunyamurti's books alongside the author himself, unraveling the intricate layers of meaning in The Dao of the Final Days. Further your exploration of the psychological dimensions of his teachings with Radha Ma, who leads an in-depth study of Gems of Wisdom Volume One, Coming Full Circle: The Secret of the Singularity, revealing its transformative insights.",
            "order": 5
        },
        {
            "title": "Book Group Review",
            "content": "Join Shunyamurti for fourteen transformative classes (each over 90 minutes long) as he unpacks and expands upon The Flight of the Garuda, a profound series of Dzogchen poems. Or explore the psychological and spiritual dimensions of Overcoming Narcissism in an illuminating 11-class series, led by Radha Ma, offering deep insights and powerful tools for transformation.",
            "order": 6
        },
        {
            "title": "Study Group Review",
            "content": "Embark on a profound journey through some of Shunyamurti's most essential yet rarely explored teachings. Radha Ma carefully revisits and unpacks these classical transmissions. With over 22 classes so far, this ongoing series delves into key units such as: \"Transforming the Imaginary,\" \"Cultivating the Will,\" \"Potencies,\" \"The Structure of Experience,\" and \"Brain Sludge.\"",
            "order": 7
        },
        {
            "title": "Community Forum",
            "content": "Engage in deep, meaningful discussions with a global community of truth-seekers. Share insights, ask questions, and express your creative spirit in an uplifting space dedicated to spiritual growth and exploration.",
            "order": 8
        },
        {
            "title": "Live Sunday Group Meditation",
            "content": "Join the Sat Yoga Ashram Sangha every Sunday for our community meditation that amplifies your energy field, deepens your inner stillness, and aligns your consciousness with the divine presence.",
            "order": 9
        },
        {
            "title": "Live Surprise Satsangs with Shunyamurti",
            "content": "Be present for spontaneous, live transmissions from Shunyamurti. You will have the opportunity to join live teachings and Q&A sessions, receiving wisdom directly from the divine source.",
            "order": 10
        },
        {
            "title": "Live Study Group with Radha Ma",
            "content": "Deepen your understanding of Shunyamurti's teachings with Radha Ma, who offers advanced explanations and guidance on integrating these profound insights into your spiritual practice.",
            "order": 11
        },
        {
            "title": "Live Teaching Discussion Group",
            "content": "Join the Sat Yoga Teaching Team for an in-depth exploration of Shunyamurti's teachings. Each session begins with a selected video teaching or essay, serving as a springboard for profound study and discussion. Engage in meaningful dialogue and expand your understanding in a supportive group setting.",
            "order": 12
        },
        {
            "title": "Ask Shunyamurti",
            "content": "A dedicated space for Pragyani and Pragyani+ members to submit personal questions via email and receive direct, insightful responses from Shunyamurti, offering guidance and clarity on the spiritual path.",
            "order": 13
        },
        {
            "title": "Lifetime Access to All Online Retreats",
            "content": "As a Pragyani+ member, receive unlimited VIP access to Shunyamurti's transformative retreats (valued at $1,970/year). These profound gatherings form the pinnacle of our wisdom school curriculum. These retreats are a rare opportunity to ask Shunyamurti the most precious questions from your heart, receive direct guidance on the path to Self-Realization, and raise the vibrational frequency of the morphogenic field.",
            "order": 14
        }
    ]

    for item_data in accordion_items:
        item = MembershipBenefitItem(
            benefits_id=benefits_config.id,
            title=item_data["title"],
            content=item_data["content"],
            order_index=item_data["order"]
        )
        db.add(item)

    db.commit()
    print("✅ Membership benefits seeded successfully with ORIGINAL content!")


def main():
    """Run all membership seeders with ORIGINAL content"""
    print("🌱 Starting membership data seeding with ORIGINAL CONTENT...")

    db = SessionLocal()
    try:
        seed_membership_pricing(db)
        seed_membership_benefits(db)
        print("\n✨ All membership data seeded successfully with ORIGINAL CONTENT!\n")
    except Exception as e:
        print(f"\n❌ Error seeding data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
