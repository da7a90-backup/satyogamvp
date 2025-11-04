#!/usr/bin/env python3
"""
Seed about/shunyamurti page data
Migrates from data.ts: whatIsShunyamurtiData, curriculumVitaeData
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import PageSection, SectionContent

db = SessionLocal()

try:
    print("🌱 Seeding about/shunyamurti page...")

    # 1. HERO SECTION
    hero_section = PageSection(
        page_slug="about-shunyamurti",
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
        heading="Shunyamurti",
        subheading="",
        background_image="/aboutshunyabanner.jpg"
    )
    db.add(hero_content)

    # 2. WHAT IS SHUNYAMURTI SECTION (TwoPaneComponent with paragraphs)
    what_is_section = PageSection(
        page_slug="about-shunyamurti",
        section_slug="what-is-shunyamurti",
        section_type="two_pane_paragraphs",
        order_index=2,
        is_active=True
    )
    db.add(what_is_section)
    db.flush()

    what_is_content = SectionContent(
        section_id=what_is_section.id,
        heading="What is Shunyamurti?",
        title_line_height="120%",
        content=[
            "To answer that, we must begin by understanding his chosen yogic name. Shunya means \"empty,\" while murti means \"form.\" In fact, all of us are empty forms, but most stay in denial of that. He wants to express and live in Truth.<br /><br />Emptiness is a central term, not only in Buddhism but in all the Asian wisdom schools. It signifies that the bodily character is unreal, a mere appearance in a holographic light show disguised as a world. Because one's persona is fictional, its suffering is empty of reality. This light show, or dream field, is made of the Light of Infinite Consciousness. Once there has been recognition of the emptiness of all forms, then the Real Self underlying, pervading, and dreaming this whole cosmic play can be realized. At that point, the other side of emptiness is revealed as the unmanifest, formless Fullness of eternal and unlimited freedom and joy.<br /><br />The One Intelligence is dreaming all of us and is the inmost Self of each apparent entity. In Shunyamurti's case, recognition of the fictional nature of the world and of people came early in life. That freed him from conventional constraints, enabling him to resist temptations to settle for anything less than the full unfoldment of the potency of Consciousness. Life became a quest for the Real.<br /><br />Grace comes as the power to silence the mind. In the stillness of Total Presence, energy and information from the Infinite Self can be channelled through the bodily icon. The teachings of Sat Yoga have come from that Source."
        ]
    )
    db.add(what_is_content)

    # 3. QUOTE SECTION
    quote_section = PageSection(
        page_slug="about-shunyamurti",
        section_slug="quote",
        section_type="quote",
        order_index=3,
        is_active=True
    )
    db.add(quote_section)
    db.flush()

    quote_content = SectionContent(
        section_id=quote_section.id,
        quote="A seeker of the Real should not follow a beaten path..."
    )
    db.add(quote_content)

    # 4. CURRICULUM VITAE SECTION (TwoPaneComponent with sections)
    cv_section = PageSection(
        page_slug="about-shunyamurti",
        section_slug="curriculum-vitae",
        section_type="two_pane_sections",
        order_index=4,
        is_active=True
    )
    db.add(cv_section)
    db.flush()

    cv_content = SectionContent(
        section_id=cv_section.id,
        tagline="ABOUT",
        heading="Shunyamurti's Curriculum Vitae",
        content=[
            {
                "heading": "Early Inspirations",
                "paragraphs": [
                    "For Shunyamurti, consciousness awakened early. As a child, he would spend afternoons outdoors contemplating and writing poetry. This led to reading classic poetry and discovering the world of literature. He was active in sports, especially martial arts such as judo and aikido. Political consciousness awakened with the news of the murder of President Kennedy. He became an activist opposing the U.S. war in Vietnam, and that brought him to study Gandhi, the Bhagavad Gita, and the Upanishads—which explained his own inner states. His search culminated in the discovery of the books of Sri Ramana Maharshi, who most clearly exemplified the eternal Truths. By then, no doubt remained."
                ]
            },
            {
                "heading": "Encountering Baba Hari Dass",
                "paragraphs": [
                    "The fullness of life in that period inevitably included abundant experimentation with psychedelics, hitchhiking adventures to many parts of the country and later the world, meeting leading figures in the avant-garde, and participating in some extraordinary events. The most profound experience was encountering Baba Hari Dass. The presence of that shining being brought to Shunyamurti overwhelming love and a long period of discipleship."
                ]
            },
            {
                "heading": "Journey from Worldly to Otherworldly",
                "paragraphs": [
                    "After graduating from university with a double major in philosophy and drama and a minor in literature, Shunyamurti became the director of an international book club in New York City focused on insightful analyses of current issues in geopolitics. Eventually, he earned a law degree and a psychology doctorate. The practice of law was stultifying, but worthwhile because it satisfied his interest in cosmic law (to structure future human interactions with extraterrestrial visitors), karmic law, and the genuine worldly wisdom hidden at the heart of our degraded legal systems—plus, it taught him first-hand how the system worked."
                ]
            },
            {
                "heading": "A Passage to India",
                "paragraphs": [
                    "He was rescued from a career as an attorney during a fervent solitary meditation retreat. The Great Spirit abducted him. An encounter with a teacher from India led to a pilgrimage in that land. Immersed in the exquisite divine energy field of an ashram, Shunyamurti bathed for ten years in that holy river of Gyana and Shakti, becoming a devoted yogi. Then, he received new marching orders from within: learn Western approaches to soul healing and become adept in offering help."
                ]
            },
            {
                "heading": "Hypnosis and Beyond",
                "paragraphs": [
                    "After studying hypnotherapy, he began a private practice. He also took graduate courses in psychology at night and on weekends.",
                    "A flourishing practice of transformational healing unfolded, evolving from Ericksonian hypnotherapy to past-life regression, to spirit de-possession, to ghost-busting at haunted houses, to working with people who had been captured and released by aliens, to removing curses imposed by practitioners of black magic, and even to being psychically attacked by those dark forces in revenge. He learned a great deal about the world of the occult and the paranormal."
                ]
            },
            {
                "heading": "But then ...",
                "paragraphs": [
                    "But then, a very different immersion in psychoanalysis training—first Kleinian, then Lacanian—led Shunyamurti to a critical reappraisal of the role of such a focus on the paranormal, transforming his shamanic level of work to a higher spiritual level. He came to see that the subconscious had to be countervailed by the Superconscious, and those pivotal insights concerned the use of Kundalini energy. After correcting the psychoanalytic map of the structure of the ego and learning the language of dreams, the function was to abide in the Absolute.",
                    "The rest is the story of the sangha, the ashram, and the miracles of our Lord. But that is for another page ..."
                ]
            }
        ],
        background_elements={
            "tree": {
                "image": "/tree.png",
                "desktop": {
                    "width": "1024px",
                    "height": "1536px",
                    "left": "-420px",
                    "top": "531.2px",
                    "background": "linear-gradient(180deg, rgba(250, 248, 241, 0) 7.91%, #FAF8F1 79.92%)",
                    "zIndex": 0
                }
            }
        }
    )
    db.add(cv_content)

    # 5. ENCOUNTERS SECTION
    encounters_section = PageSection(
        page_slug="about-shunyamurti",
        section_slug="encounters",
        section_type="encounters",
        order_index=5,
        is_active=True
    )
    db.add(encounters_section)
    db.flush()

    encounters_content = SectionContent(
        section_id=encounters_section.id,
        tagline="ENCOUNTERS WITH SHUNYAMURTI",
        content=[
            {
                "id": 1,
                "text": "In this heartfelt compilation, seekers from around the world share their encounters with Shunyamurti—moments of insight, transformation, and remembrance. Each is a testament to the uncanny and life-transforming power of a true encounter—a transmission that changes everything.",
                "author": "Lauren",
                "location": "The Netherlands",
                "media": {
                    "type": "video",
                    "src": "https://www.youtube.com/embed/Ut4iguf7n6U",
                    "videoType": "youtube"
                }
            },
            {
                "id": 2,
                "text": "Meeting Shunyamurti was like coming home to a truth I had always known but forgotten. His presence awakened something deep within me that had been dormant for years. The transformation was immediate and lasting.",
                "author": "Michael",
                "location": "United States",
                "media": {
                    "type": "image",
                    "src": "/encounter2-image.jpg"
                }
            },
            {
                "id": 3,
                "text": "Through Shunyamurti's teachings, I discovered the joy of surrender and the peace that comes from letting go of the ego's constant demands. His wisdom opened doorways I never knew existed.",
                "author": "Sofia",
                "location": "Spain"
            }
        ]
    )
    db.add(encounters_content)

    db.commit()
    print("✅ about/shunyamurti page seeded successfully!")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding about/shunyamurti: {e}")
    import traceback
    traceback.print_exc()
    raise
finally:
    db.close()
