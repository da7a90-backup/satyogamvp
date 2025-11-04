#!/usr/bin/env python3
"""
Seed about/satyoga page data
Migrates from data.ts: whatIsSatYogaData, methodologyData, atmanologyData
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent, AccordionSection, AccordionItem

db = SessionLocal()

try:
    print("🌱 Seeding about/satyoga page...")

    # 1. HERO SECTION (stored in page_sections for consistency)
    hero_section = PageSection(
        page_slug="about-satyoga",
        section_slug="hero",
        section_type="hero",
        order_index=1,
        is_active=True
    )
    db.add(hero_section)
    db.flush()

    hero_content = SectionContent(
        section_id=hero_section.id,
        tagline="About",
        heading="Sat Yoga",
        subheading="Wisdom School",
        background_image="/aboutbanner.jpg"
    )
    db.add(hero_content)

    # 2. WHAT IS SAT YOGA SECTION (TwoPaneComponent with bulletaccordion)
    what_is_section = PageSection(
        page_slug="about-satyoga",
        section_slug="what-is-sat-yoga",
        section_type="two_pane_accordion",
        order_index=2,
        is_active=True
    )
    db.add(what_is_section)
    db.flush()

    what_is_content = SectionContent(
        section_id=what_is_section.id,
        heading="What is Sat Yoga?",
        title_line_height="120%",
        description="The ancient Sanskrit term Sat refers to what is absolutely Real and thus implicitly imperishable. The term Yoga means union, or realization of oneness. To live in oneness with the eternally present Absolute Real is both the way and the goal of Sat Yoga."
    )
    db.add(what_is_content)

    # Create accordion items for whatIsSatYoga
    accordion_what_is = AccordionSection(
        page_slug="about-satyoga",
        section_slug="what-is-sat-yoga",
        type="bulletaccordion",
        order_index=2
    )
    db.add(accordion_what_is)
    db.flush()

    what_is_items = [
        {
            "id": 0,
            "title": "A Treasure Map",
            "content": "To help the seeker of Truth fully understand what that means, Sat Yoga has elaborated a user-friendly map of the hidden treasures of reality, encompassing the entire spectrum of consciousness. We have also developed empowering operations for taking command of the mind. We offer these online and at our ashram, a self-sustaining spiritual community in the rural mountains of southern Costa Rica, where those seeking a shorter or longer retreat (or a permanent refuge) from this dying world can awaken latent powers and live joyously in Total Presence."
        },
        {
            "id": 1,
            "title": "An Agency for Intelligence Amplification",
            "content": "The original Sat Yoga was already functioning as a means of increasing intelligence at the beginning of recorded history. It was deployed not only for wisdom but also for developing paranormal powers (siddhis). Yoga has served as the basis and engine of all religions, as well as the mystical, magical, and shamanic orders. In recent times, however, the term Yoga has been appropriated by the ego and has been diluted, commercialized, and too often diverted from its original purpose. Our approach returns to the ancient tradition of offering Darshan (direct transmission from the Source of Power), Diksha (initiation), Gyana (knowledge), and Sadhana (praxis). But we have re-engineered the process to enable you to reinforce your will power and courage to transcend the known. Our focus is on activating the capacity for immediate illumination."
        },
        {
            "id": 2,
            "title": "A Range of Processes and Non-Practice",
            "content": "Because everyone requires an approach appropriate to their level of maturity, educational background, and conceptual intelligence, we employ a range of processes for those not ready for the ultimate non-practice of immediate Self-realization. These include not only direct encounters with our teacher (a master of dharma combat, or zen dialogue), but also individual alchemical counseling sessions with an adept mentor. The latter provide a safe space in which to uproot projections, transform emotions, and release the residue of trauma as well as attachments to obsolete thinking and behavior patterns. We also offer powerful meditation methods. Once you have tasted the ecstasy of inner silence and serenity, you will not stop short of obtaining life's grand prize. Along with that, you will know the joy of altruism, devotion, artistic expression, and embodying the paradoxical wisdom of the Avadhutas (those who live in complete freedom)."
        }
    ]

    for idx, item in enumerate(what_is_items):
        accordion_item = AccordionItem(
            accordion_section_id=accordion_what_is.id,
            item_id=item["id"],
            title=item["title"],
            content=item["content"],
            order_index=idx
        )
        db.add(accordion_item)

    # 3. METHODOLOGY SECTION (TwoPaneComponent with accordion)
    methodology_section = PageSection(
        page_slug="about-satyoga",
        section_slug="methodology",
        section_type="two_pane_accordion",
        order_index=3,
        is_active=True
    )
    db.add(methodology_section)
    db.flush()

    methodology_content = SectionContent(
        section_id=methodology_section.id,
        heading="Methodology"
    )
    db.add(methodology_content)

    # Create accordion items for methodology
    accordion_methodology = AccordionSection(
        page_slug="about-satyoga",
        section_slug="methodology",
        type="accordion",
        order_index=3
    )
    db.add(accordion_methodology)
    db.flush()

    methodology_items = [
        {
            "id": 0,
            "title": "The Integration of Raja Yoga and Gyana Yoga",
            "content": "Meditation is the gradual path to Self-sovereignty (in Sanskrit, Raja Yoga). Gaining mastery over the chattering mind and scattered attention may require the use of centering techniques, of which we have many. Understanding how the ego functions may help you change its tendency to self-sabotage. That is one aspect of Gyana Yoga. For those ready to activate their crown chakra, the higher Gyana (knowledge) will do the job."
        },
        {
            "id": 1,
            "title": "Kundalini Yoga: Re-Tuning the Radio",
            "content": "Let's face it: Nearly all of us suffer from stunted intellectual development. This is not our fault. We are products of a narcissistic and nihilistic social system that never taught us our true potential for genius. Here we offer a step-by-step process to repair the damage to our attention span, intellectual curiosity, and capacity to descend into our innermost Being in order to attune to the infinite intelligence."
        },
        {
            "id": 2,
            "title": "Bhakti Yoga: Devotion and Surrender",
            "content": "Open your Heart! That's the simplest way to reach God-consciousness. It is a cliché to say that God is love, but it is still the Truth. The more you resonate with the all-pervading Presence—which is felt as blissful love without an object or a subject—the easier it is to let go of all contractions, delusions, and karmic symptoms."
        },
        {
            "id": 3,
            "title": "Karma Yoga: Serving the Real",
            "content": "True service of the Real requires attunement to the Real. Karma Yoga brings poise; lightness; accurate intention and timing of action; and glitch-free relations with people, the realm of Nature, and the social order."
        }
    ]

    for idx, item in enumerate(methodology_items):
        accordion_item = AccordionItem(
            accordion_section_id=accordion_methodology.id,
            item_id=item["id"],
            title=item["title"],
            content=item["content"],
            order_index=idx
        )
        db.add(accordion_item)

    # 4. ATMANOLOGY SECTION (TwoPaneComponent with paragraphs)
    atmanology_section = PageSection(
        page_slug="about-satyoga",
        section_slug="atmanology",
        section_type="two_pane_paragraphs",
        order_index=4,
        is_active=True
    )
    db.add(atmanology_section)
    db.flush()

    atmanology_content = SectionContent(
        section_id=atmanology_section.id,
        heading="Atmanology: Beyond Psychology",
        title_line_height="120%",
        content=[
            "The Atman is the original yogic term for the uncreated Self. The Atman projects a soul, which then constructs an embodied ego. The ego mind, or psyche, is internally fragmented. Whereas psychology functions at the ego level, we work at the level of soul, from which the ego program can be more rapidly upgraded. The soul can then return to the Atman.<br /><br />Atmanology is offered in private one-to-one sessions. Here you will engage in creative mono-dialogue, in which you will feel the joy and release of being able to speak freely and openly from the heart, in a reverie state, as an act of Self-discovery rather than as a preconceived presentation of a persona to an Other.<br /><br />The Atmanologist will perceive the blind spots, the points of incoherence, and the contradictions that arise in your stream of consciousness, thus helping you draw out their hidden meanings. At key moments, the adept Atmanologist will intervene with an unexpected question or observation that suddenly breaks apart the ego's discourse, revealing a deeper, unknown intelligence. Superego voices may also appear, as well as the notorious Shadow lurking in the subconscious. Finally, an even more subtle presence will be unveiled: that of the soul. This will catapult your awareness to the Superconscious Atman.<br /><br />An Atmanologist has learned to interpret the language of dreams using the capacity to creatively unpack the symbols that arise, not only in one's remembered night dreams, but also in the world dream—especially in the physical and emotional symptoms and the daily synchronicities that reveal one's conscious internal narratives to be dream messages from the soul. These insights bring re-connection to the Atman—the Real Self. You can then awaken to the real beauty and poetry of life."
        ]
    )
    db.add(atmanology_content)

    # 5. QUOTE SECTION
    quote_section = PageSection(
        page_slug="about-satyoga",
        section_slug="quote",
        section_type="quote",
        order_index=5,
        is_active=True
    )
    db.add(quote_section)
    db.flush()

    quote_content = SectionContent(
        section_id=quote_section.id,
        quote="A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."
    )
    db.add(quote_content)

    # 6. TEACHINGS SECTION (StandardSection)
    teachings_section = PageSection(
        page_slug="about-satyoga",
        section_slug="teachings",
        section_type="standard_section",
        order_index=6,
        is_active=True
    )
    db.add(teachings_section)
    db.flush()

    teachings_content = SectionContent(
        section_id=teachings_section.id,
        tagline="FREE TEACHINGS LIBRARY",
        heading="Unlock Your Inner Genius",
        description="This selection of some of Shunyamurti's most empowering ideas will be both healing and liberating. These videos, guided meditations, and essays include some from our public channels and others that are only available to members.",
        button_text="Learn more",
        button_link="/teachings"
    )
    db.add(teachings_content)

    db.commit()
    print("✅ about/satyoga page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding about/satyoga: {e}")
    import traceback
    traceback.print_exc()
    raise
finally:
    db.close()
