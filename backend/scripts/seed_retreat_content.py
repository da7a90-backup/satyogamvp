#!/usr/bin/env python3
"""
Seed script for retreat content
Migrates hardcoded retreat content to database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.retreat import Retreat

def seed_darshan_content():
    """Seed content for Darshan retreat."""
    db: Session = SessionLocal()

    try:
        # Find Darshan retreat by slug or type
        darshan = db.query(Retreat).filter(
            Retreat.slug.like('%darshan%')
        ).first()

        if not darshan:
            print("❌ Darshan retreat not found. Please create the retreat first.")
            return

        print(f"📦 Seeding content for: {darshan.title}")

        # Included items
        darshan.included_title = "Included in this 7-day retreat"
        darshan.included_items = [
            {
                "title": "Private Darshan with Shunyamurti",
                "description": "In your profound meeting with Shunyamurti, you can ask your most personal and urgent questions and receive direct guidance and affirmation of your Being. If you want to sustain inner peace and luminous clarity, this session can prove a turning point."
            },
            {
                "title": "Core Curriculum Module Classes",
                "description": "Small group classes delve into the core modules of our wisdom school curriculum. Designed to help you deconstruct the false self and be free of the suffering it causes, these tutorials will open your third eye and give you x-ray vision of your subconscious attachments and empower you to drop the ego illusion and return to your true nature of illumined Consciousness."
            },
            {
                "title": "Nourishing, Vegetarian Cuisine",
                "description": "Reinvigorate your organism with nourishing vegetarian meals, prepared with organic, high-vibrational ingredients—many sourced from our own gardens. We always offer vegan and gluten-free options."
            },
            {
                "title": "Meditation Gatherings",
                "description": "Your soul will bask in the Light of God as you let go of constrictions and enter the deep silence of Pure Awareness during our group meditation sittings. We assemble several times daily to cultivate stillness, serene joy, and an ever-deepening connection to our Supreme Source."
            },
            {
                "title": "Ashram Tours",
                "description": "Explore the ashram's food-growing infrastructure and processes on our popular Prema-culture tour, and learn our unique approach to permaculture infused with divine love (prema). Visit our thriving greenhouses and magical food gardens and learn how we cultivate organic produce in harmony with Nature and Spirit."
            },
            {
                "title": "Personal Time for Gaia Gazing and Walking Meditation",
                "description": "Wander through our sacred landscape mindfully, and discover how every tree, stream, and breeze carries the whisper of the Absolute. You may meet fascinating birds, butterflies, sloths, or monkeys during such contemplative walks! As you attune to the rhythms of Nature, let the power of the energy field saturate your soul with healing grace."
            },
            {
                "title": "Evening Community Classes",
                "description": "The evenings bring a variety of events, which may include a documentary or feature film, a deep dive into recent teachings, or a tranquil guided meditation."
            },
            {
                "title": "Charming Cabin Accommodations",
                "description": "Nestled in colourful and fragrant gardens by a placid forest, our peaceful lodgings provide the perfect refuge for deep relaxation and renewal. Your personal space will bring comfort, beauty, and calm. Each room the option of a private bath and a balcony to immerse yourself in the tranquil energy of the holy mountain."
            }
        ]

        # Intro section
        darshan.intro1_title = "A Personal Encounter with Shunyamurti"
        darshan.intro1_content = [
            "This retreat is a precious opportunity to receive initiation from Shunyamurti directly—an encounter that can shift your vibrational frequency immediately to the Presence of divine light and love. This in turn can bring full realization of your God-Self.",
            "Designed to open your heart and mind to be filled with the Light of the Supreme Real,",
            "these compact events also feature wisdom classes, meditation training, and optional meetings with an individual counselor."
        ]

        # Schedule
        darshan.schedule_tagline = "A TYPICAL ASHRAM DAY"
        darshan.schedule_title = "Sample Daily Schedule"
        darshan.schedule_items = [
            {"time": "4:00 - 4:45am", "activity": "Morning meditation"},
            {"time": "5:00 - 8:00am", "activity": "Personal Time, Asanas, or Optional Outdoor Service"},
            {"time": "8:45 - 11:45 am", "activity": "Class, Optional Service, or Atmanology Session"},
            {"time": "12:15 - 12:50 pm", "activity": "Midday Meditation"},
            {"time": "1:00 - 1:45 pm", "activity": "Lunch"},
            {"time": "2:30 - 5:30 pm", "activity": "Personal Time"},
            {"time": "5:30 - 7:00 pm", "activity": "Evening Class / Meditation"},
            {"time": "7:00 - 7:30 pm", "activity": "Evening Meal"}
        ]

        db.commit()
        print(f"✅ Seeded content for Darshan retreat")

    except Exception as e:
        print(f"❌ Error seeding Darshan content: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_shakti_content():
    """Seed content for Shakti retreat."""
    db: Session = SessionLocal()

    try:
        shakti = db.query(Retreat).filter(
            Retreat.slug.like('%shakti%')
        ).first()

        if not shakti:
            print("❌ Shakti retreat not found. Please create the retreat first.")
            return

        print(f"📦 Seeding content for: {shakti.title}")

        # Included items
        shakti.included_title = "Included"
        shakti.included_items = [
            {
                "title": "Advanced Seminar with Shunyamurti",
                "description": "Every seminar led by Shunyamurti brings new advances in understanding the ultimate mysteries of the Real. Such an event forms the core of this accelerated course, offering direct transmission of divine energy and insight that brings resonance with the Source. Through these teachings, previous misunderstandings of reality can drop away—and a new blossoming of your soul's potential will bring wonderment and joy."
            },
            {
                "title": "Sacred Satsang with Shunyamurti",
                "description": "One of the greatest joys of ashram life is coming together for sacred satsangs with Shunyamurti. These intimate gatherings offer a space to ask questions, perceive new mind-boggling paradoxes operating in consciousness, and to internalize a higher vibrational frequency."
            },
            {
                "title": "Seva & Community Service",
                "description": "One way to open your heart is through seva (selfless service), uniting your will with the needs of the whole community. You may be asked to offer assistance in the ashram kitchen, or to give loving attention to the plants in our gardens, or to help keep the meditation hall in proper order, or other activities augmenting our hospitality for everyone. A deep sense of satisfaction will ensue."
            },
            {
                "title": "Charming Cabin Accommodations",
                "description": "Nestled in pristine nature, our peaceful lodgings provide the perfect refuge for rest and renewal. Encompassed by wild forests and the celestial stillness of starry nights, your accommodations offer comfort, beauty, and tranquillity. Each room includes a private bath and a balcony for solitary contemplation"
            },
            {
                "title": "Meditation Gatherings",
                "description": "The power of regular group meditation sittings, several times per day, will reinvigorate your enthusiasm for ultimate Liberation. The power of Presence brings ecstatic intoxication, stillness free of thought, and the ending of anxiety."
            },
            {
                "title": "Core Curriculum Module Classes",
                "description": "Small group classes delve into the core modules of our wisdom school curriculum. Designed to help you become free of a false and obsolete identity, our complete re-engineering of the ancient knowledge of nonduality can activate higher levels of consciousness—and even bring instant enlightenment."
            },
            {
                "title": "Optional Atmanology Sessions",
                "description": "The really serious seekers of inner transformation may choose to explore and alter the subconscious foundations of the ego complex, by engaging in private sessions of Atmanology—a therapeutic modality that opens up the higher reaches of Kundalini. These dialogues can quickly demolish obstacles to Self-realization."
            },
            {
                "title": "Nourishing Vegetarian Cuisine",
                "description": "Hearty vegetarian meals, prepared with fresh ingredients—mostly sourced from our own gardens and farms. We offer vegan and gluten-free options to those on special diets."
            },
            {
                "title": "Evening Community Classes",
                "description": "The evenings furnish a variety of cultural events, including devotional singing, participation in psychodramas, screening and discussion of cutting-edge videos on science and psychology, feature films, further study of recent teachings, plus guided meditations."
            },
            {
                "title": "Ashram Tour",
                "description": "You will learn a great deal about the principles of living sustainably in our popular Prema-culture tour, our unique approach to permaculture infused with prema, or divine love. Visit our thriving greenhouses and food gardens and learn how we cultivate organic produce in harmony with Nature and Spirit."
            },
            {
                "title": "Walks in Nature",
                "description": "Wander along our well-tended paths where every tree, stream, butterfly, and bird bring renewed connection to the Beyond. You may hear the roar of monkeys or catch a glimpse of an adorable sloth. Each breeze will utter whispers from the Beyond. The energy of the Earth is charged with vital power that your body will gladly receive."
            }
        ]

        # Intro section
        shakti.intro1_title = "A Life-Changing Discovery of Your True Nature"
        shakti.intro1_content = [
            "The Shakti Saturation process is an adventure in Self-discovery! The curriculum has been specially designed to serve our growing global community of seekers of healing and inner peace, and lovers of Truth.",
            "This onsite program is open to all who delight in the Sat Yoga teachings, and who are ready to engage in the inner work of attaining Total Presence.",
            "Whether you are joining us for a month or considering extending your stay, this intensive reconfiguration of identity will serve as an exhilarating introduction to life at the Ashram—and your personal divinization.",
            "Your days will be filled with mind-clearing wisdom, sweet inner silence, and heart-healing self-acceptance. The understanding of our supportive spiritual community will assist in enabling you to drop all your old projections, defensiveness, and self-doubt.",
            "Through this profound peeling away of the past, your life will feel renewed. You may experience a paradigm shift into a more beautiful reality. And you will be able to rebuild your life on the bedrock of the Real Self—and live in freedom, in a state of grace."
        ]

        # Schedule
        shakti.schedule_tagline = "A TYPICAL ASHRAM DAY"
        shakti.schedule_title = "Sample Daily Schedule"
        shakti.schedule_items = [
            {"time": "4:00 - 4:45am", "activity": "Morning meditation"},
            {"time": "5:00 - 8:00am", "activity": "Personal Time, Asanas, or Optional Outdoor Service"},
            {"time": "8:45 - 11:45 am", "activity": "Class, Optional Service, or Atmanology Session"},
            {"time": "12:15 - 12:50 pm", "activity": "Midday Meditation"},
            {"time": "1:00 - 1:45 pm", "activity": "Lunch"},
            {"time": "2:30 - 5:30 pm", "activity": "Personal Time"},
            {"time": "5:30 - 7:00 pm", "activity": "Evening Class / Meditation"},
            {"time": "7:00 - 7:30 pm", "activity": "Evening Meal"}
        ]

        db.commit()
        print(f"✅ Seeded content for Shakti retreat")

    except Exception as e:
        print(f"❌ Error seeding Shakti content: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_sevadhari_content():
    """Seed content for Sevadhari retreat."""
    db: Session = SessionLocal()

    try:
        sevadhari = db.query(Retreat).filter(
            Retreat.slug.like('%sevadhari%')
        ).first()

        if not sevadhari:
            print("❌ Sevadhari retreat not found. Please create the retreat first.")
            return

        print(f"📦 Seeding content for: {sevadhari.title}")

        # Intro section
        sevadhari.intro1_title = "A Personal Encounter with Shunyamurti"
        sevadhari.intro1_content = [
            "This retreat is a precious opportunity to receive initiation from Shunyamurti directly—an encounter that can shift your vibrational frequency immediately to the Presence of divine light and love. This in turn can bring full realization of your God-Self.",
            "Designed to open your heart and mind to be filled with the Light of the Supreme Real,",
            "these compact events also feature wisdom classes, meditation training, and optional meetings with an individual counselor."
        ]

        # Schedule
        sevadhari.schedule_tagline = "A TYPICAL ASHRAM DAY"
        sevadhari.schedule_title = "Sample Daily Schedule"
        sevadhari.schedule_items = [
            {"time": "4:00 - 4:45am", "activity": "Morning meditation"},
            {"time": "5:00 - 8:00am", "activity": "Personal Time, Asanas, or Optional Outdoor Service"},
            {"time": "8:45 - 11:45 am", "activity": "Class, Optional Service, or Atmanology Session"},
            {"time": "12:15 - 12:50 pm", "activity": "Midday Meditation"},
            {"time": "1:00 - 1:45 pm", "activity": "Lunch"},
            {"time": "2:30 - 5:30 pm", "activity": "Personal Time"},
            {"time": "5:30 - 7:00 pm", "activity": "Evening Class / Meditation"},
            {"time": "7:00 - 7:30 pm", "activity": "Evening Meal"}
        ]

        db.commit()
        print(f"✅ Seeded content for Sevadhari retreat")

    except Exception as e:
        print(f"❌ Error seeding Sevadhari content: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding retreat content...")

    seed_darshan_content()
    seed_shakti_content()
    seed_sevadhari_content()

    print("✨ Seeding complete!")
