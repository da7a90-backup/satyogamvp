#!/usr/bin/env python3
"""
Seed online retreats data into the database
Migrates from data.ts onlineRetreatsData
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.static_content import OnlineRetreat
import json

db = SessionLocal()

try:
    print("🌱 Seeding online retreats...")

    # Delete existing retreats
    db.query(OnlineRetreat).delete()
    db.commit()

    # Retreat 1: Hopeless Yet Hilarious
    retreat1 = OnlineRetreat(
        slug="hopeless-yet-hilarious",
        title="Why Our Situation is Hopeless, Yet Hilarious!",
        subtitle="A 3-Day Online Retreat with Shunyamurti",
        fixed_date="December 27-29, 2025",
        location="Online Retreat",
        duration="3 days",
        price=195,
        booking_tagline="3-DAY ONLINE RETREAT",

        # Intro 1
        intro1_title="About This Retreat",
        intro1_content=[
            "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out. When you open your third eye, you will immediately perceive the unreality of the world you thought you were living in, and of your own appearance in that projected dreamfield.",
            "Suddenly, what had been regarded as adverse and traumatic events; feelings of pain and suffering; and a weak, disgraceful, and unlovable identity are recognized as hilarious illusions. In this retreat, we will help you pry open your third eyelid—so you can enjoy the healing laughter of your liberated heart."
        ],

        # Intro 2
        intro2_title="This 3-Day Online Retreat Includes:",
        intro2_content=[
            "<strong>Livestream Satsangs with Shunyamurti:</strong> Three, 90-minute Livestream Satsangs including Wisdom Classes, Guided Meditations, and Question and Answer Sessions",
            "<strong>Early Morning Meditation:</strong> Meditate with the Sat Yoga Sangha Live via Zoom",
            "<strong>Encounter Group:</strong> Connect with Senior Sat Yogis Live via Zoom",
            "<strong>Asanas:</strong> Yoga Asana Practice Live via Zoom",
            "<strong>Retreat Portal:</strong> Access your transformational journey through our beautifully designed Retreat Portal, directly available from your personal dashboard. This intuitive platform includes responsive design for any device, live calendar, instant replay of all sessions, at-home practice guide, and community forum to submit questions and connect with fellow retreatants."
        ],

        # Agenda/Schedule
        agenda_title="All Times Are In Costa Rica Time",
        agenda_items=[
            {"time": "6:00 - 6:45am", "activity": "Morning Meditation (via Zoom)"},
            {"time": "10:00am - 12:00pm", "activity": "Livestream Satsang with Shunyamurti"},
            {"time": "3:00 - 4:30pm", "activity": "Encounter Group (via Zoom)"},
            {"time": "5:00 - 6:00pm", "activity": "Yoga Asana Practice (via Zoom)"}
        ],

        # Media
        hero_background="/orbanner.png",
        images=[
            {"src": "/PURCHASE GALLERY 2.jpg", "alt": "Retreat session"},
            {"src": "/PURCHASE GALLERY 3.jpg", "alt": "Meditation practice"},
            {"src": "/PURCHASE GALLERY 4.jpg", "alt": "Community gathering"},
            {"src": "/PURCHASE GALLERY 5.jpg", "alt": "Wisdom teaching"}
        ],

        # Testimonials
        testimonial_data={
            "tagline": "TESTIMONIALS",
            "heading": "Reflections from Recent Retreatants",
            "items": [
                {
                    "quote": "These teachings this weekend have been amazing. My husband and I watch and discuss for hours. Thank you, Sat Yoga team, for bringing this to our living room. Thank you also to Shunyamurti for sharing his sacred wisdom with us.",
                    "name": "Anissa",
                    "location": "USA"
                },
                {
                    "quote": "The retreat left my being much lighter. I feel I dissolved many layers of the ego and more are lifting with each breath.",
                    "name": "Brad",
                    "location": "Canada"
                },
                {
                    "quote": "Thank you for this most amazing, wonderful retreat! The teachings were fantastic, so much wisdom and useful tools, I will listen again and again.",
                    "name": "Elisabeth",
                    "location": "Sweden"
                },
                {
                    "quote": "I have so enjoyed immersing myself in the blissful ocean of these teachings and meditations. Please convey my deepest gratitude to Shunyamurti for his exquisite transmissions.",
                    "name": "Mara",
                    "location": "UK"
                }
            ]
        },

        is_active=True
    )

    db.add(retreat1)
    db.commit()

    print(f"✅ Seeded retreat: {retreat1.title}")
    print(f"✅ Total online retreats seeded: 1")

except Exception as e:
    db.rollback()
    print(f"❌ Error seeding online retreats: {e}")
    import traceback
    traceback.print_exc()
    raise

finally:
    db.close()
